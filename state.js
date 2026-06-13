/**
 * Global state management for NeroAI Studios.
 * Simple pub/sub store with preferences persistence.
 */

const PREFS_KEY = 'neroai_prefs';

let state = {
  currentUser: null,
  preferences: null,
  currentLang: 'ro',
  // Auth modal
  isAuthModalOpen: false,
  authTab: 'login', // 'login' | 'register'
  // Settings modal
  isSettingsOpen: false,
  settingsTab: 'appearance',
  // Admin panel
  isAdminPanelOpen: false,
  // Info panel tab
  infoTab: 'rules',
  // Forum
  forumView: 'categories',
  forumCategory: null,
  forumThreadId: null,
  forumSearch: '',
  forumSort: 'newest',
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setState(partial) {
  state = { ...state, ...partial };
  for (const fn of listeners) {
    try { fn(state); } catch (e) { console.error(e); }
  }
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function initPreferences() {
  const raw = await window.miniappsAI.storage.getItem(PREFS_KEY);
  const prefs = raw ? JSON.parse(raw) : {};
  setState({ preferences: prefs });
  return prefs;
}

export async function savePreferences(partial) {
  const current = state.preferences || {};
  const updated = { ...current, ...partial };
  setState({ preferences: updated });
  await window.miniappsAI.storage.setItem(PREFS_KEY, JSON.stringify(updated));
}
