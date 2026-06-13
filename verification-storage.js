/**
 * Account verification system for NeroAI Studios.
 * Multi-level verification with codes and requirements.
 */

const VERIF_KEY = 'neroai_verification';

const VERIF_LEVELS = [
  { id: 'none', labelKey: 'verif.levelNone', icon: '⚪', color: 'gray', minXP: 0 },
  { id: 'email', labelKey: 'verif.levelEmail', icon: '📧', color: 'blue', minXP: 50 },
  { id: 'active', labelKey: 'verif.levelActive', icon: '⚡', color: 'cyan', minXP: 200 },
  { id: 'trusted', labelKey: 'verif.levelTrusted', icon: '🛡️', color: 'emerald', minXP: 500 },
  { id: 'verified', labelKey: 'verif.levelVerified', icon: '✅', color: 'purple', minXP: 1000 },
  { id: 'elite', labelKey: 'verif.levelElite', icon: '💎', color: 'amber', minXP: 2500 },
];

const VERIF_CODES = {
  email: 'NERO-2024',
  active: 'ACTIVE-X',
  trusted: 'TRUST-ME',
  verified: 'VERIFIED',
  elite: 'ELITE-PRO',
};

export { VERIF_LEVELS, VERIF_CODES };

async function getAllVerif() {
  const raw = await window.miniappsAI.storage.getItem(VERIF_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveAllVerif(data) {
  await window.miniappsAI.storage.setItem(VERIF_KEY, JSON.stringify(data));
}

/** Get verification status for a user */
export async function getVerificationStatus(userId) {
  const allVerif = await getAllVerif();
  return allVerif[userId] || { level: 'none', verifiedAt: null, codeUsed: null };
}

/** Attempt to verify a user with a code */
export async function verifyUser(userId, code, userXP) {
  const allVerif = await getAllVerif();
  const current = allVerif[userId] || { level: 'none' };
  const currentIdx = VERIF_LEVELS.findIndex(v => v.id === current.level);

  for (let i = VERIF_LEVELS.length - 1; i > currentIdx; i--) {
    const targetLevel = VERIF_LEVELS[i];
    const expectedCode = VERIF_CODES[targetLevel.id];

    if (!expectedCode) continue;

    if (code.toUpperCase().trim() === expectedCode) {
      if (userXP < targetLevel.minXP) {
        return {
          ok: false,
          error: `Ai nevoie de cel puțin ${targetLevel.minXP} XP pentru nivelul "${targetLevel.id}". XP curent: ${userXP}.`,
        };
      }

      allVerif[userId] = {
        level: targetLevel.id,
        verifiedAt: new Date().toISOString(),
        codeUsed: code.toUpperCase().trim(),
      };
      await saveAllVerif(allVerif);
      return { ok: true, level: targetLevel.id, icon: targetLevel.icon };
    }
  }

  return { ok: false, error: 'Cod invalid. Verifică codul și încearcă din nou.' };
}

/** Reset verification for a user (admin action) */
export async function resetVerification(userId) {
  const allVerif = await getAllVerif();
  delete allVerif[userId];
  await saveAllVerif(allVerif);
  return { ok: true };
}

/** Get all verified users */
export async function getAllVerifiedUsers() {
  const allVerif = await getAllVerif();
  return Object.entries(allVerif).map(([userId, data]) => ({
    userId,
    ...data,
  }));
}

/** Get verification stats */
export async function getVerificationStats() {
  const allVerif = await getAllVerif();
  const stats = {};
  for (const level of VERIF_LEVELS) {
    stats[level.id] = 0;
  }
  for (const data of Object.values(allVerif)) {
    stats[data.level] = (stats[data.level] || 0) + 1;
  }
  return stats;
}
