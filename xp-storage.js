/**
 * XP & Leveling system for NeroAI Studios.
 * Tracks user XP, levels, and ranks.
 */

const XP_KEY = 'neroai_xp';

const XP_ACTIONS = {
  login: 10,
  visit: 5,
  post: 20,
  reply: 10,
  like: 2,
  ticket: 15,
  complaint: 10,
  quest: 25,
  staff_app: 20,
  chatbox: 5,
};

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1800, 3000, 5000, 8000, 12000,
  18000, 25000, 35000, 50000, 70000, 100000, 140000, 190000, 250000, 350000,
];

const RANKS = [
  { level: 1, key: 'rank.newcomer', icon: '🌱', color: 'gray' },
  { level: 3, key: 'rank.member', icon: '👤', color: 'slate' },
  { level: 5, key: 'rank.active', icon: '⚡', color: 'blue' },
  { level: 8, key: 'rank.veteran', icon: '🛡️', color: 'cyan' },
  { level: 10, key: 'rank.expert', icon: '⭐', color: 'amber' },
  { level: 13, key: 'rank.master', icon: '🏆', color: 'orange' },
  { level: 15, key: 'rank.elite', icon: '💎', color: 'purple' },
  { level: 18, key: 'rank.legend', icon: '👑', color: 'yellow' },
  { level: 20, key: 'rank.mythic', icon: '🔥', color: 'red' },
];

async function getAllXP() {
  const raw = await window.miniappsAI.storage.getItem(XP_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveAllXP(data) {
  await window.miniappsAI.storage.setItem(XP_KEY, JSON.stringify(data));
}

export function getLevelForXP(xp) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function getXPForLevel(level) {
  const idx = Math.min(level - 1, LEVEL_THRESHOLDS.length - 1);
  return LEVEL_THRESHOLDS[idx] || 0;
}

export function getNextLevelXP(level) {
  const idx = Math.min(level, LEVEL_THRESHOLDS.length - 1);
  return LEVEL_THRESHOLDS[idx] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

export function getRankForLevel(level) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.level) rank = r;
  }
  return rank;
}

export function getAllRanks() {
  return RANKS;
}

/** Add XP for a user action. Returns { newXP, newLevel, newRankKey, leveledUp } */
export async function addXP(userId, action) {
  const amount = XP_ACTIONS[action] || 0;
  if (amount <= 0) return null;
  
  const allXP = await getAllXP();
  if (!allXP[userId]) {
    allXP[userId] = { xp: 0, history: [] };
  }
  
  const oldLevel = getLevelForXP(allXP[userId].xp);
  allXP[userId].xp += amount;
  allXP[userId].history.push({
    action,
    amount,
    timestamp: new Date().toISOString(),
  });
  
  if (allXP[userId].history.length > 100) {
    allXP[userId].history = allXP[userId].history.slice(-100);
  }
  
  await saveAllXP(allXP);
  
  const newXP = allXP[userId].xp;
  const newLevel = getLevelForXP(newXP);
  const rank = getRankForLevel(newLevel);
  
  return {
    newXP,
    newLevel,
    newRankKey: rank.key,
    leveledUp: newLevel > oldLevel,
    newInfo: { level: newLevel, rankKey: rank.key, xp: newXP },
  };
}

/** Get XP info for a user */
export async function getUserXP(userId) {
  const allXP = await getAllXP();
  const data = allXP[userId] || { xp: 0, history: [] };
  const level = getLevelForXP(data.xp);
  const rank = getRankForLevel(level);
  const nextXP = getNextLevelXP(level);
  const prevXP = getXPForLevel(level);
  const progress = nextXP > prevXP ? ((data.xp - prevXP) / (nextXP - prevXP)) * 100 : 100;
  
  return {
    xp: data.xp,
    level,
    rank,
    nextXP,
    prevXP,
    progress: Math.min(progress, 100),
    history: data.history.slice(-20),
  };
}
