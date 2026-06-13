/**
 * Quest system for NeroAI Studios.
 * Daily and weekly quests that reward XP for community engagement.
 */

const QUEST_PROGRESS_KEY = 'neroai_quest_progress';
const QUEST_CLAIMED_KEY = 'neroai_quest_claimed';

/* ═══════════════════════════════════════════
   Quest definitions
   ═══════════════════════════════════════════ */

export const DAILY_QUESTS = [
  { id: 'daily_login', icon: '🔑', titleKey: 'quest.daily.login.title', descKey: 'quest.daily.login.desc', xp: 10, target: 1, action: 'login' },
  { id: 'daily_post', icon: '📝', titleKey: 'quest.daily.post.title', descKey: 'quest.daily.post.desc', xp: 30, target: 1, action: 'thread_created' },
  { id: 'daily_reply', icon: '💬', titleKey: 'quest.daily.reply.title', descKey: 'quest.daily.reply.desc', xp: 25, target: 3, action: 'reply_created' },
  { id: 'daily_visit', icon: '👁️', titleKey: 'quest.daily.visit.title', descKey: 'quest.daily.visit.desc', xp: 5, target: 1, action: 'visit' },
  { id: 'daily_radio', icon: '📻', titleKey: 'quest.daily.radio.title', descKey: 'quest.daily.radio.desc', xp: 15, target: 1, action: 'radio_listen' },
];

export const WEEKLY_QUESTS = [
  { id: 'weekly_posts', icon: '📄', titleKey: 'quest.weekly.posts.title', descKey: 'quest.weekly.posts.desc', xp: 100, target: 5, action: 'thread_created' },
  { id: 'weekly_replies', icon: '🗣️', titleKey: 'quest.weekly.replies.title', descKey: 'quest.weekly.replies.desc', xp: 120, target: 15, action: 'reply_created' },
  { id: 'weekly_streak', icon: '🔥', titleKey: 'quest.weekly.streak.title', descKey: 'quest.weekly.streak.desc', xp: 150, target: 7, action: 'login' },
  { id: 'weekly_tickets', icon: '🎫', titleKey: 'quest.weekly.tickets.title', descKey: 'quest.weekly.tickets.desc', xp: 80, target: 2, action: 'ticket_created' },
  { id: 'weekly_radio', icon: '🎵', titleKey: 'quest.weekly.radio.title', descKey: 'quest.weekly.radio.desc', xp: 60, target: 5, action: 'radio_listen' },
];

/* ═══════════════════════════════════════════
   Time helpers
   ═══════════════════════════════════════════ */

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getWeekKey() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return start.toISOString().split('T')[0];
}

/* ═══════════════════════════════════════════
   Progress storage
   ═══════════════════════════════════════════ */

async function getAllProgress() {
  const raw = await window.miniappsAI.storage.getItem(QUEST_PROGRESS_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveAllProgress(data) {
  await window.miniappsAI.storage.setItem(QUEST_PROGRESS_KEY, JSON.stringify(data));
}

async function getAllClaimed() {
  const raw = await window.miniappsAI.storage.getItem(QUEST_CLAIMED_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveAllClaimed(data) {
  await window.miniappsAI.storage.setItem(QUEST_CLAIMED_KEY, JSON.stringify(data));
}

/** Track quest progress for a user action */
export async function trackQuestAction(userId, action) {
  if (!userId || !action) return;

  const today = getTodayKey();
  const week = getWeekKey();
  const progress = await getAllProgress();

  if (!progress[userId]) progress[userId] = { daily: {}, weekly: {} };

  // Track daily
  if (!progress[userId].daily[today]) progress[userId].daily[today] = {};
  const dailyKey = today;
  if (!progress[userId].daily[dailyKey]) progress[userId].daily[dailyKey] = {};

  for (const quest of DAILY_QUESTS) {
    if (quest.action === action) {
      if (!progress[userId].daily[dailyKey][quest.id]) {
        progress[userId].daily[dailyKey][quest.id] = 0;
      }
      progress[userId].daily[dailyKey][quest.id]++;
    }
  }

  // Track weekly
  if (!progress[userId].weekly[week]) progress[userId].weekly[week] = {};
  for (const quest of WEEKLY_QUESTS) {
    if (quest.action === action) {
      if (!progress[userId].weekly[week][quest.id]) {
        progress[userId].weekly[week][quest.id] = 0;
      }
      progress[userId].weekly[week][quest.id]++;
    }
  }

  // Clean old data (keep only current + last day/week)
  const keys = Object.keys(progress[userId].daily);
  if (keys.length > 3) {
    keys.sort();
    for (let i = 0; i < keys.length - 2; i++) {
      delete progress[userId].daily[keys[i]];
    }
  }

  await saveAllProgress(progress);
}

/** Get quest progress for a user */
export async function getQuestProgress(userId) {
  if (!userId) return { daily: {}, weekly: {} };

  const today = getTodayKey();
  const week = getWeekKey();
  const progress = await getAllProgress();
  const claimed = await getAllClaimed();

  const userProgress = progress[userId] || { daily: {}, weekly: {} };
  const userClaimed = claimed[userId] || { daily: {}, weekly: {} };

  const dailyProgress = userProgress.daily[today] || {};
  const weeklyProgress = userProgress.weekly[week] || {};
  const dailyClaimed = userClaimed.daily[today] || [];
  const weeklyClaimed = userClaimed.weekly[week] || [];

  return {
    daily: DAILY_QUESTS.map(quest => ({
      ...quest,
      current: Math.min(dailyProgress[quest.id] || 0, quest.target),
      completed: (dailyProgress[quest.id] || 0) >= quest.target,
      claimed: dailyClaimed.includes(quest.id),
    })),
    weekly: WEEKLY_QUESTS.map(quest => ({
      ...quest,
      current: Math.min(weeklyProgress[quest.id] || 0, quest.target),
      completed: (weeklyProgress[quest.id] || 0) >= quest.target,
      claimed: weeklyClaimed.includes(quest.id),
    })),
  };
}

/** Claim a completed quest reward. Returns { ok, xp?, error? } */
export async function claimQuest(userId, questId, period) {
  if (!userId) return { ok: false, error: 'Neautentificat.' };

  const progress = await getQuestProgress(userId);
  const list = period === 'daily' ? progress.daily : progress.weekly;
  const quest = list.find(q => q.id === questId);

  if (!quest) return { ok: false, error: 'Quest negăsit.' };
  if (!quest.completed) return { ok: false, error: 'Quest-ul nu este completat.' };
  if (quest.claimed) return { ok: false, error: 'Recompensa a fost deja revendicată.' };

  // Mark as claimed
  const claimed = await getAllClaimed();
  if (!claimed[userId]) claimed[userId] = { daily: {}, weekly: {} };

  const today = getTodayKey();
  const week = getWeekKey();
  const key = period === 'daily' ? today : week;

  if (period === 'daily') {
    if (!claimed[userId].daily[key]) claimed[userId].daily[key] = [];
    claimed[userId].daily[key].push(questId);
  } else {
    if (!claimed[userId].weekly[key]) claimed[userId].weekly[key] = [];
    claimed[userId].weekly[key].push(questId);
  }

  await saveAllClaimed(claimed);

  return { ok: true, xp: quest.xp };
}

/** Get quest summary stats */
export async function getQuestSummary(userId) {
  const progress = await getQuestProgress(userId);
  const dailyDone = progress.daily.filter(q => q.claimed).length;
  const weeklyDone = progress.weekly.filter(q => q.claimed).length;
  const dailyTotal = progress.daily.reduce((s, q) => s + q.xp, 0);
  const weeklyTotal = progress.weekly.reduce((s, q) => s + q.xp, 0);
  const dailyEarned = progress.daily.filter(q => q.claimed).reduce((s, q) => s + q.xp, 0);
  const weeklyEarned = progress.weekly.filter(q => q.claimed).reduce((s, q) => s + q.xp, 0);

  return {
    dailyDone,
    dailyTotal: progress.daily.length,
    weeklyDone,
    weeklyTotal: progress.weekly.length,
    dailyXPEarned: dailyEarned,
    dailyXPTotal: dailyTotal,
    weeklyXPEarned: weeklyEarned,
    weeklyXPTotal: weeklyTotal,
  };
}
