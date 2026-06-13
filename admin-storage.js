/**
 * Admin storage helpers for NeroAI Studios.
 * Manages admin roles, bans, announcements, activity log, and server config.
 */

const ADMIN_KEY = 'neroai_admins';
const BANS_KEY = 'neroai_bans';
const ANNOUNCEMENTS_KEY = 'neroai_announcements';
const ACTIVITY_LOG_KEY = 'neroai_activity_log';
const SERVER_CONFIG_KEY = 'neroai_server_config';
const REPORTS_KEY = 'neroai_reports';

const USERS_KEY = 'neroai_users';
const FORUM_THREADS_KEY = 'neroai_forum_threads';

/* ═══════════════════════════════════════════
   Role helpers
   ═══════════════════════════════════════════ */

const ROLES = ['member', 'moderator', 'admin'];
const ROLE_HIERARCHY = { member: 0, moderator: 1, admin: 2 };

async function getAdminList() {
  const raw = await window.miniappsAI.storage.getItem(ADMIN_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveAdminList(list) {
  await window.miniappsAI.storage.setItem(ADMIN_KEY, JSON.stringify(list));
}

export async function getUserRole(userId) {
  const list = await getAdminList();
  return list[userId] || 'member';
}

export async function isStaff(userId) {
  const role = await getUserRole(userId);
  return role === 'admin' || role === 'moderator';
}

export async function isAdmin(userId) {
  const role = await getUserRole(userId);
  return role === 'admin';
}

export async function setUserRole(targetUserId, newRole, callerId) {
  if (!ROLES.includes(newRole)) return { ok: false, error: 'Rol invalid.' };
  const callerRole = await getUserRole(callerId);
  if (callerRole !== 'admin') return { ok: false, error: 'Doar administratorii pot schimba roluri.' };
  if (targetUserId === callerId) return { ok: false, error: 'Nu-ți poți schimba propriul rol.' };

  const targetRole = await getUserRole(targetUserId);
  if (targetRole === 'admin' && newRole !== 'admin') {
    const list = await getAdminList();
    const adminCount = Object.values(list).filter(r => r === 'admin').length;
    if (adminCount <= 1) return { ok: false, error: 'Trebuie să existe cel puțin un administrator.' };
  }

  const list = await getAdminList();
  if (newRole === 'member') {
    delete list[targetUserId];
  } else {
    list[targetUserId] = newRole;
  }
  await saveAdminList(list);
  await logActivity('role_change', callerId, { targetUserId, newRole });
  return { ok: true };
}

export async function ensureFirstAdmin(userId) {
  const list = await getAdminList();
  if (Object.keys(list).length === 0) {
    list[userId] = 'admin';
    await saveAdminList(list);
    await logActivity('auto_admin', userId, {});
    return true;
  }
  return false;
}

/* ═══════════════════════════════════════════
   Ban management
   ═══════════════════════════════════════════ */

async function getBanList() {
  const raw = await window.miniappsAI.storage.getItem(BANS_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveBanList(bans) {
  await window.miniappsAI.storage.setItem(BANS_KEY, JSON.stringify(bans));
}

export async function isBanned(userId) {
  const bans = await getBanList();
  if (!bans[userId]) return false;
  if (bans[userId].until && new Date(bans[userId].until) < new Date()) {
    delete bans[userId];
    await saveBanList(bans);
    return false;
  }
  return bans[userId];
}

export async function banUser(targetUserId, reason, durationDays, callerId) {
  const callerRole = await getUserRole(callerId);
  const targetRole = await getUserRole(targetUserId);
  if (ROLE_HIERARCHY[callerRole] <= ROLE_HIERARCHY[targetRole]) {
    return { ok: false, error: 'Nu poți interzice un utilizator cu rol egal sau superior.' };
  }

  const bans = await getBanList();
  bans[targetUserId] = {
    reason: reason || 'Fără motiv specificat',
    bannedBy: callerId,
    bannedAt: new Date().toISOString(),
    until: durationDays > 0 ? new Date(Date.now() + durationDays * 86400000).toISOString() : null,
  };
  await saveBanList(bans);
  await logActivity('ban', callerId, { targetUserId, reason, durationDays });
  return { ok: true };
}

export async function unbanUser(targetUserId, callerId) {
  const bans = await getBanList();
  delete bans[targetUserId];
  await saveBanList(bans);
  await logActivity('unban', callerId, { targetUserId });
  return { ok: true };
}

export async function getAllBans() {
  const bans = await getBanList();
  return Object.entries(bans).map(([userId, data]) => ({ userId, ...data }));
}

/* ═══════════════════════════════════════════
   Announcements
   ═══════════════════════════════════════════ */

async function getAnnouncements() {
  const raw = await window.miniappsAI.storage.getItem(ANNOUNCEMENTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveAnnouncements(list) {
  await window.miniappsAI.storage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(list));
}

export async function createAnnouncement({ title, body, type, authorId }) {
  const list = await getAnnouncements();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title, body,
    type: type || 'info',
    authorId,
    createdAt: new Date().toISOString(),
    pinned: false,
  };
  list.unshift(entry);
  if (list.length > 30) list.length = 30;
  await saveAnnouncements(list);
  await logActivity('announcement', authorId, { title, type });
  return entry;
}

export async function getAnnouncementsList() {
  return getAnnouncements();
}

export async function toggleAnnouncementPin(announcementId, callerId) {
  const list = await getAnnouncements();
  const idx = list.findIndex(a => a.id === announcementId);
  if (idx === -1) return { ok: false };
  list[idx].pinned = !list[idx].pinned;
  await saveAnnouncements(list);
  await logActivity('announcement_pin', callerId, { announcementId, pinned: list[idx].pinned });
  return { ok: true, pinned: list[idx].pinned };
}

export async function deleteAnnouncement(announcementId, callerId) {
  const list = await getAnnouncements();
  const filtered = list.filter(a => a.id !== announcementId);
  await saveAnnouncements(filtered);
  await logActivity('announcement_delete', callerId, { announcementId });
  return { ok: true };
}

/* ═══════════════════════════════════════════
   Activity log
   ═══════════════════════════════════════════ */

async function getActivityLog() {
  const raw = await window.miniappsAI.storage.getItem(ACTIVITY_LOG_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveActivityLog(log) {
  await window.miniappsAI.storage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(log));
}

async function logActivity(action, userId, details) {
  const log = await getActivityLog();
  log.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    action, userId, details,
    timestamp: new Date().toISOString(),
  });
  if (log.length > 100) log.length = 100;
  await saveActivityLog(log);
}

export async function getActivityLogList(limit = 50) {
  const log = await getActivityLog();
  return log.slice(0, limit);
}

/* ═══════════════════════════════════════════
   Reports (content moderation)
   ═══════════════════════════════════════════ */

async function getReports() {
  const raw = await window.miniappsAI.storage.getItem(REPORTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveReports(list) {
  await window.miniappsAI.storage.setItem(REPORTS_KEY, JSON.stringify(list));
}

export async function reportContent({ contentType, contentId, reason, reporterId }) {
  const list = await getReports();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    contentType, contentId,
    reason: reason || 'Fără motiv',
    reporterId,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  list.unshift(entry);
  await saveReports(list);
  return entry;
}

export async function getReportsList() {
  return getReports();
}

export async function resolveReport(reportId, action, callerId) {
  const list = await getReports();
  const idx = list.findIndex(r => r.id === reportId);
  if (idx === -1) return { ok: false };
  list[idx].status = action === 'dismiss' ? 'dismissed' : 'resolved';
  list[idx].resolvedBy = callerId;
  list[idx].resolvedAt = new Date().toISOString();
  await saveReports(list);
  await logActivity('report_' + action, callerId, { reportId });
  return { ok: true };
}

/* ═══════════════════════════════════════════
   Server config
   ═══════════════════════════════════════════ */

const DEFAULT_CONFIG = {
  discordLink: 'https://discord.gg/neroai',
  serverName: 'NeroAI Studios',
  welcomeMessage: 'Bun venit pe NeroAI Studios! Alătură-te comunității noastre Discord.',
  maintenanceMode: false,
  registrationOpen: true,
};

export async function getServerConfig() {
  const raw = await window.miniappsAI.storage.getItem(SERVER_CONFIG_KEY);
  if (!raw) return { ...DEFAULT_CONFIG };
  try { return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }; }
  catch { return { ...DEFAULT_CONFIG }; }
}

export async function saveServerConfig(config) {
  await window.miniappsAI.storage.setItem(SERVER_CONFIG_KEY, JSON.stringify(config));
  await logActivity('config_update', null, { fields: Object.keys(config) });
}

/* ═══════════════════════════════════════════
   Dashboard stats
   ═══════════════════════════════════════════ */

export async function getAdminStats() {
  const usersRaw = await window.miniappsAI.storage.getItem(USERS_KEY);
  const users = usersRaw ? JSON.parse(usersRaw) : [];
  const threadsRaw = await window.miniappsAI.storage.getItem(FORUM_THREADS_KEY);
  const threads = threadsRaw ? JSON.parse(threadsRaw) : [];
  const bans = await getBanList();
  const announcements = await getAnnouncements();
  const reports = await getReports();
  const adminList = await getAdminList();

  const now = Date.now();
  const oneDayAgo = now - 86400000;
  const oneWeekAgo = now - 7 * 86400000;

  const newToday = users.filter(u => new Date(u.createdAt).getTime() > oneDayAgo).length;
  const newWeek = users.filter(u => new Date(u.createdAt).getTime() > oneWeekAgo).length;
  const totalReplies = threads.reduce((sum, t) => sum + (t.replies?.length || 0), 0);
  const threadsToday = threads.filter(t => new Date(t.createdAt).getTime() > oneDayAgo).length;
  const threadsWeek = threads.filter(t => new Date(t.createdAt).getTime() > oneWeekAgo).length;
  const openReports = reports.filter(r => r.status === 'open').length;

  const roleCounts = { admin: 0, moderator: 0, member: 0 };
  for (const u of users) {
    const role = adminList[u.id] || 'member';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  }

  return {
    totalUsers: users.length, newToday, newWeek,
    totalThreads: threads.length, totalReplies,
    threadsToday, threadsWeek,
    activeBans: Object.keys(bans).length,
    totalAnnouncements: announcements.length,
    openReports, roleCounts,
    users: users.map(u => ({ ...u, role: adminList[u.id] || 'member' })),
  };
}

export async function getAllUsers() {
  const usersRaw = await window.miniappsAI.storage.getItem(USERS_KEY);
  const users = usersRaw ? JSON.parse(usersRaw) : [];
  const adminList = await getAdminList();
  const bans = await getBanList();
  return users.map(u => ({
    ...u,
    role: adminList[u.id] || 'member',
    banned: bans[u.id] || null,
  }));
}

export async function adminDeleteThread(threadId, callerId) {
  const threadsRaw = await window.miniappsAI.storage.getItem(FORUM_THREADS_KEY);
  const threads = threadsRaw ? JSON.parse(threadsRaw) : [];
  const filtered = threads.filter(t => t.id !== threadId);
  await window.miniappsAI.storage.setItem(FORUM_THREADS_KEY, JSON.stringify(filtered));
  await logActivity('thread_delete', callerId, { threadId });
  return { ok: true };
}

export async function adminTogglePinThread(threadId, callerId) {
  const threadsRaw = await window.miniappsAI.storage.getItem(FORUM_THREADS_KEY);
  const threads = threadsRaw ? JSON.parse(threadsRaw) : [];
  const thread = threads.find(t => t.id === threadId);
  if (!thread) return { ok: false };
  thread.pinned = !thread.pinned;
  await window.miniappsAI.storage.setItem(FORUM_THREADS_KEY, JSON.stringify(threads));
  await logActivity('thread_pin', callerId, { threadId, pinned: thread.pinned });
  return { ok: true, pinned: thread.pinned };
}

export async function adminToggleLockThread(threadId, callerId) {
  const threadsRaw = await window.miniappsAI.storage.getItem(FORUM_THREADS_KEY);
  const threads = threadsRaw ? JSON.parse(threadsRaw) : [];
  const thread = threads.find(t => t.id === threadId);
  if (!thread) return { ok: false };
  thread.locked = !thread.locked;
  await window.miniappsAI.storage.setItem(FORUM_THREADS_KEY, JSON.stringify(threads));
  await logActivity('thread_lock', callerId, { threadId, locked: thread.locked });
  return { ok: true, locked: thread.locked };
}
