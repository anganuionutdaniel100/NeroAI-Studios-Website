/**
 * Activity tab view for Settings panel.
 * Shows user stats, achievement badges, activity timeline, and streaks.
 */

import { getState } from '../state.js';
import { t } from './settings-helpers.js';
import { loadUserActivity, getUserStats } from '../storage.js';

/* ─── Achievement definitions ─── */
const ACHIEVEMENTS = [
  { id: 'first_login', icon: '🔑', labelKey: 'activity.achievement.firstLogin', descKey: 'activity.achievement.firstLoginDesc', check: (s) => s.logins >= 1 },
  { id: 'profile_complete', icon: '👤', labelKey: 'activity.achievement.profileComplete', descKey: 'activity.achievement.profileCompleteDesc', check: (s) => s.profileComplete },
  { id: 'first_post', icon: '📝', labelKey: 'activity.achievement.firstPost', descKey: 'activity.achievement.firstPostDesc', check: (s) => s.posts >= 1 },
  { id: 'five_posts', icon: '📚', labelKey: 'activity.achievement.fivePosts', descKey: 'activity.achievement.fivePostsDesc', check: (s) => s.posts >= 5 },
  { id: 'first_reply', icon: '💬', labelKey: 'activity.achievement.firstReply', descKey: 'activity.achievement.firstReplyDesc', check: (s) => s.replies >= 1 },
  { id: 'ten_replies', icon: '🗣️', labelKey: 'activity.achievement.tenReplies', descKey: 'activity.achievement.tenRepliesDesc', check: (s) => s.replies >= 10 },
  { id: 'week_streak', icon: '🔥', labelKey: 'activity.achievement.weekStreak', descKey: 'activity.achievement.weekStreakDesc', check: (s) => s.streak >= 7 },
  { id: 'month_member', icon: '🗓️', labelKey: 'activity.achievement.monthMember', descKey: 'activity.achievement.monthMemberDesc', check: (s) => s.memberDays >= 30 },
  { id: 'early_adopter', icon: '⭐', labelKey: 'activity.achievement.earlyAdopter', descKey: 'activity.achievement.earlyAdopterDesc', check: (s) => s.memberDays >= 90 },
  { id: 'rules_accepted', icon: '✅', labelKey: 'activity.achievement.rulesAccepted', descKey: 'activity.achievement.rulesAcceptedDesc', check: (s) => s.rulesAccepted },
  { id: 'discord_linked', icon: '🔗', labelKey: 'activity.achievement.discordLinked', descKey: 'activity.achievement.discordLinkedDesc', check: (s) => s.discordLinked },
  { id: 'ticket_created', icon: '🎫', labelKey: 'activity.achievement.ticketCreated', descKey: 'activity.achievement.ticketCreatedDesc', check: (s) => s.tickets >= 1 },
];

/* ─── Stats card ─── */
function renderStatsCard(stats) {
  const cards = [
    { value: stats.logins, label: t('activity.stat.logins'), color: 'from-purple-500 to-indigo-600' },
    { value: stats.posts, label: t('activity.stat.posts'), color: 'from-cyan-500 to-blue-600' },
    { value: stats.replies, label: t('activity.stat.replies'), color: 'from-emerald-500 to-teal-600' },
    { value: stats.tickets, label: t('activity.stat.tickets'), color: 'from-amber-500 to-orange-600' },
    { value: stats.streak + 'd', label: t('activity.stat.streak'), color: 'from-rose-500 to-pink-600' },
    { value: stats.memberDays, label: t('activity.stat.days'), color: 'from-sky-500 to-blue-600' },
  ];

  return `<div class="grid grid-cols-3 gap-3">
    ${cards.map(c => `
      <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
        <div class="text-lg font-black text-white">${c.value}</div>
        <div class="text-[10px] text-gray-500 mt-0.5">${c.label}</div>
      </div>
    `).join('')}
  </div>`;
}

/* ─── Streak visualization ─── */
function renderStreakCalendar(streakDays) {
  const days = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const active = i < streakDays;
    const isToday = i === 0;
    days.push(`
      <div class="flex flex-col items-center gap-1" title="${d.toLocaleDateString()}">
        <div class="h-5 w-5 rounded-sm ${isToday ? 'ring-2 ring-purple-400' : ''} ${active ? 'bg-purple-500' : 'bg-gray-800'}"></div>
        <span class="text-[8px] text-gray-600">${d.toLocaleDateString(undefined, { weekday: 'short' }).charAt(0)}</span>
      </div>
    `);
  }
  return `
    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-bold text-white flex items-center gap-2">
          🔥 ${t('activity.streakTitle')}
        </h4>
        <span class="text-xs font-bold text-orange-400">${streakDays} ${t('activity.streakDays')}</span>
      </div>
      <div class="flex items-center justify-between">${days.join('')}</div>
      <p class="text-[10px] text-gray-600 mt-2">${t('activity.streakHint')}</p>
    </div>
  `;
}

/* ─── Achievement badges ─── */
function renderAchievements(stats) {
  const unlocked = ACHIEVEMENTS.filter(a => a.check(stats));
  const locked = ACHIEVEMENTS.filter(a => !a.check(stats));
  const total = ACHIEVEMENTS.length;
  const progressPct = Math.round((unlocked.length / total) * 100);

  return `
    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
      <div class="flex items-center justify-between mb-1">
        <h4 class="text-sm font-bold text-white flex items-center gap-2">
          🏆 ${t('activity.achievements')}
        </h4>
        <span class="text-xs text-gray-400">${unlocked.length}/${total}</span>
      </div>
      <div class="w-full h-1.5 rounded-full bg-gray-800 mb-4 overflow-hidden">
        <div class="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all xp-bar-animate" style="width:${progressPct}%"></div>
      </div>
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
        ${unlocked.map(a => `
          <div class="flex flex-col items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 p-2.5 transition hover:bg-purple-500/15" title="${t(a.descKey)}">
            <span class="text-xl">${a.icon}</span>
            <span class="text-[9px] text-purple-300 text-center leading-tight">${t(a.labelKey)}</span>
          </div>
        `).join('')}
        ${locked.map(a => `
          <div class="flex flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 opacity-40" title="${t(a.descKey)}">
            <span class="text-xl grayscale">🔒</span>
            <span class="text-[9px] text-gray-600 text-center leading-tight">${t(a.labelKey)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ─── Activity timeline ─── */
function renderActivityLog(log) {
  if (!log || log.length === 0) {
    return `
      <div class="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
        <p class="text-sm text-gray-500">${t('activity.noActivity')}</p>
      </div>
    `;
  }

  const iconMap = {
    login: '🔑', post: '📝', reply: '💬', like: '❤️',
    ticket: '🎫', profile: '👤', verify: '✅', xp: '⭐', level_up: '🎉',
  };
  const colorMap = {
    login: 'bg-purple-500/20 text-purple-400', post: 'bg-cyan-500/20 text-cyan-400',
    reply: 'bg-emerald-500/20 text-emerald-400', like: 'bg-rose-500/20 text-rose-400',
    ticket: 'bg-amber-500/20 text-amber-400', profile: 'bg-sky-500/20 text-sky-400',
    verify: 'bg-green-500/20 text-green-400', xp: 'bg-yellow-500/20 text-yellow-400',
    level_up: 'bg-orange-500/20 text-orange-400',
  };

  const recent = log.slice(0, 10);
  return `
    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
      <h4 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
        📋 ${t('activity.recentActivity')}
      </h4>
      <div class="space-y-2">
        ${recent.map(entry => {
          const icon = iconMap[entry.type] || '📌';
          const color = colorMap[entry.type] || 'bg-gray-500/20 text-gray-400';
          const timeAgo = getTimeAgo(entry.timestamp);
          return `
            <div class="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/[0.03]">
              <span class="flex h-7 w-7 items-center justify-center rounded-lg text-sm ${color}">${icon}</span>
              <div class="min-w-0 flex-1">
                <p class="text-xs text-gray-300 truncate">${entry.label || entry.type}</p>
              </div>
              <span class="text-[10px] text-gray-600 flex-shrink-0">${timeAgo}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t('notifications.time.now');
  if (minutes < 60) return t('notifications.time.minutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('notifications.time.hours', { count: hours });
  const days = Math.floor(hours / 24);
  return t('notifications.time.days', { count: days });
}

/* ─── XP Progress mini ─── */
function renderXPProgress(stats) {
  const level = stats.level || 1;
  const currentXP = stats.totalXP || 0;
  const xpInLevel = stats.xpInLevel || 0;
  const xpNeeded = stats.xpNeeded || 50;
  const pct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  return `
    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-bold text-white flex items-center gap-2">
          ⚡ ${t('xp.level')} ${level}
        </h4>
        <span class="text-xs text-gray-400">${currentXP} ${t('xp.totalXp').toLowerCase()}</span>
      </div>
      <div class="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
        <div class="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 xp-bar-animate" style="width:${pct}%"></div>
      </div>
      <p class="text-[10px] text-gray-500 mt-1.5">${t('xp.nextLevel', { xp: xpNeeded - xpInLevel })}</p>
    </div>
  `;
}

/* ─── Main render ─── */
export async function renderActivityTab() {
  const { currentUser } = getState();
  if (!currentUser) return `<p class="text-center text-gray-500 py-8">${t('activity.loginRequired')}</p>`;

  const stats = await getUserStats(currentUser.id);
  const activity = await loadUserActivity(currentUser.id);

  return `
    <div class="space-y-5">
      ${renderStatsCard(stats)}
      ${renderXPProgress(stats)}
      ${renderStreakCalendar(stats.streak)}
      ${renderAchievements(stats)}
      ${renderActivityLog(activity)}
    </div>
  `;
}
