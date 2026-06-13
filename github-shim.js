/**
 * GitHub Pages compatibility shim for NeroAI Studios.
 * Provides localStorage-based fallbacks when miniappsAI SDK is not available.
 * Loaded before main.js in index.html.
 */

(function () {
  'use strict';

  // Only apply shim if miniappsAI SDK is NOT present
  if (window.miniappsAI) {
    console.log('[NeroAI] miniappsAI SDK detected — shim skipped.');
    return;
  }

  console.log('[NeroAI] miniappsAI SDK not found — activating GitHub Pages shim.');

  /* ═══════════════════════════════════════════
     Storage — wraps localStorage
     ═══════════════════════════════════════════ */

  const PREFIX = 'neroai_';
  const SESSION_PREFIX = 'neroai_session_';

  const storageShim = {
    async getItem(key, opts) {
      try {
        if (opts?.area === 'session') {
          return sessionStorage.getItem(SESSION_PREFIX + key);
        }
        return localStorage.getItem(PREFIX + key);
      } catch {
        return null;
      }
    },

    async setItem(key, value, opts) {
      try {
        if (opts?.area === 'session') {
          sessionStorage.setItem(SESSION_PREFIX + key, value);
        } else {
          localStorage.setItem(PREFIX + key, value);
        }
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          throw new Error('STORAGE_QUOTA_EXCEEDED');
        }
        throw e;
      }
    },

    async removeItem(key, opts) {
      try {
        if (opts?.area === 'session') {
          sessionStorage.removeItem(SESSION_PREFIX + key);
        } else {
          localStorage.removeItem(PREFIX + key);
        }
      } catch { /* silent */ }
    },
  };

  /* ═══════════════════════════════════════════
     TTS — graceful no-op
     ═══════════════════════════════════════════ */

  const ttsShim = {
    async speak({ text }) {
      // Try native browser TTS as fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ro-RO';
        window.speechSynthesis.speak(utterance);
        return { requestId: 'browser_tts', status: 'ok' };
      }
      console.warn('[NeroAI] TTS not available on this platform.');
      return { requestId: 'noop', status: 'unsupported' };
    },

    async stop() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return { stopped: true };
    },

    async listVoices() {
      return { voices: [], page: 1, itemsPerPage: 50, total: 0, hasMore: false };
    },
  };

  /* ═══════════════════════════════════════════
     AI — not available outside miniapps.ai
     ═══════════════════════════════════════════ */

  function aiUnavailable() {
    throw new Error('Funcțiile AI sunt disponibile doar pe platforma miniapps.ai. Găzduiește aplicația acolo pentru acces complet.');
  }

  const aiShim = {
    async callModel() { aiUnavailable(); },
    async callStructured() { aiUnavailable(); },
    async uploadFile() { aiUnavailable(); },
    async uploadFiles() { aiUnavailable(); },
    async promoteFile(asset) { return asset; },
    extractText(result) {
      if (!result?.output) return '';
      return result.output
        .filter(p => p.type === 'text')
        .map(p => p.text || '')
        .join('');
    },
    extractMediaAssets() { return []; },
    async listModels() { return []; },
  };

  /* ═══════════════════════════════════════════
     Assemble window.miniappsAI
     ═══════════════════════════════════════════ */

  window.miniappsAI = {
    storage: storageShim,
    tts: ttsShim,
    ...aiShim,
  };

  /* ═══════════════════════════════════════════
     i18n shim — basic translation support
     ═══════════════════════════════════════════ */

  if (!window.miniappI18n) {
    let _catalog = {};
    let _locale = 'ro';

    async function loadCatalog(locale) {
      try {
        const resp = await fetch(`locales/${locale}.json`);
        if (resp.ok) {
          _catalog = await resp.json();
          _locale = locale;
        }
      } catch {
        console.warn(`[NeroAI] Could not load locale: ${locale}`);
      }
    }

    // Load default locale
    loadCatalog('en');

    window.miniappI18n = {
      t(key, values) {
        const parts = key.split('.');
        let val = _catalog;
        for (const part of parts) {
          if (val && typeof val === 'object' && part in val) {
            val = val[part];
          } else {
            return key; // fallback to raw key
          }
        }
        if (typeof val !== 'string') return key;
        // Replace {placeholders}
        if (values) {
          return val.replace(/\{(\w+)\}/g, (_, k) => values[k] !== undefined ? values[k] : `{${k}}`);
        }
        return val;
      },

      getContext() {
        return {
          resolvedLocale: _locale,
          dir: 'ltr',
          availableLocales: ['ro', 'en', 'en-US'],
          canChangeLocale: true,
        };
      },

      async setLocale(code) {
        await loadCatalog(code);
        return { ok: true, locale: code };
      },
    };
  }

  console.log('[NeroAI] GitHub Pages shim active. Storage → localStorage, TTS → browser, AI → disabled.');
})();
window.miniappI18n._readyPromise = _readyPromise;
})();


