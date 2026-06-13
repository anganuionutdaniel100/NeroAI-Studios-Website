/**
 * Staff application system for NeroAI Studios.
 * Users apply for staff roles; admins review and manage applications.
 */

const APPS_KEY = 'neroai_staff_applications';

const STAFF_ROLES = [
  { id: 'moderator', icon: '🛡️', labelKey: 'staff.role.moderator', descKey: 'staff.role.moderator.desc' },
  { id: 'helper', icon: '🤝', labelKey: 'staff.role.helper', descKey: 'staff.role.helper.desc' },
  { id: 'event_organizer', icon: '🎉', labelKey: 'staff.role.eventOrg', descKey: 'staff.role.eventOrg.desc' },
  { id: 'content_creator', icon: '✍️', labelKey: 'staff.role.content', descKey: 'staff.role.content.desc' },
  { id: 'developer', icon: '💻', labelKey: 'staff.role.developer', descKey: 'staff.role.developer.desc' },
];

const APP_STATUSES = [
  { id: 'pending', icon: '⏳', labelKey: 'staff.app.pending', color: 'amber' },
  { id: 'reviewing', icon: '🔍', labelKey: 'staff.app.reviewing', color: 'blue' },
  { id: 'accepted', icon: '✅', labelKey: 'staff.app.accepted', color: 'emerald' },
  { id: 'rejected', icon: '❌', labelKey: 'staff.app.rejected', color: 'red' },
];

export { STAFF_ROLES, APP_STATUSES };

async function getAll() {
  const raw = await window.miniappsAI.storage.getItem(APPS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveAll(list) {
  await window.miniappsAI.storage.setItem(APPS_KEY, JSON.stringify(list));
}

export async function createStaffApplication({ userId, username, role, experience, motivation, availability }) {
  const list = await getAll();
  const existing = list.find(a => a.userId === userId && a.status === 'pending');
  if (existing) {
    return { ok: false, error: 'Ai deja o aplicație în așteptare.' };
  }

  const entry = {
    id: 'app_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    userId,
    username: username || 'Anonim',
    role: role || 'moderator',
    experience: experience || '',
    motivation: motivation || '',
    availability: availability || '',
    status: 'pending',
    reviewNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  list.unshift(entry);
  if (list.length > 100) list.length = 100;
  await saveAll(list);
  return { ok: true, application: entry };
}

export async function getAllApplications() {
  return getAll();
}

export async function getUserApplications(userId) {
  const list = await getAll();
  return list.filter(a => a.userId === userId);
}

export async function getApplicationById(id) {
  const list = await getAll();
  return list.find(a => a.id === id) || null;
}

export async function updateApplicationStatus(appId, newStatus, reviewNotes, callerId) {
  const list = await getAll();
  const idx = list.findIndex(a => a.id === appId);
  if (idx === -1) return { ok: false, error: 'Aplicația nu a fost găsită.' };
  list[idx].status = newStatus;
  list[idx].reviewNotes = reviewNotes || '';
  list[idx].reviewedBy = callerId;
  list[idx].updatedAt = new Date().toISOString();
  await saveAll(list);
  return { ok: true };
}

export async function deleteApplication(appId) {
  const list = await getAll();
  const filtered = list.filter(a => a.id !== appId);
  await saveAll(filtered);
  return { ok: true };
}

export async function getApplicationStats() {
  const list = await getAll();
  const total = list.length;
  const pending = list.filter(a => a.status === 'pending').length;
  const reviewing = list.filter(a => a.status === 'reviewing').length;
  const accepted = list.filter(a => a.status === 'accepted').length;
  const rejected = list.filter(a => a.status === 'rejected').length;

  const byRole = {};
  for (const a of list) {
    byRole[a.role] = (byRole[a.role] || 0) + 1;
  }

  return { total, pending, reviewing, accepted, rejected, byRole };
}

export async function seedStaffApplications() {
  const existing = await getAll();
  if (existing.length > 0) return;

  const demo = [
    {
      id: 'app_demo1',
      userId: 'demo_user',
      username: 'AlexDev',
      role: 'moderator',
      experience: 'Am fost moderator pe 3 servere Discord cu peste 1000 membri.',
      motivation: 'Vreau să ajut comunitatea NeroAI să crească și să fie un loc sigur pentru toți.',
      availability: 'Zilnic, 4-6 ore, mai ales seara.',
      status: 'pending',
      reviewNotes: '',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'app_demo2',
      userId: 'demo_user2',
      username: 'MariaK',
      role: 'event_organizer',
      experience: 'Am organizat evenimente pe Discord și Twitch pentru comunități de gaming.',
      motivation: 'Îmi place să creez experiențe memorabile pentru comunitate.',
      availability: 'Weekend-uri și seara în timpul săptămânii.',
      status: 'reviewing',
      reviewNotes: 'Candidat promovat. Verificăm experiența.',
      reviewedBy: 'admin_demo',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: 'app_demo3',
      userId: 'demo_user3',
      username: 'IonutR',
      role: 'developer',
      experience: 'Full-stack developer cu 5 ani experiență. Am lucrat cu React, Node.js, Python.',
      motivation: 'Vreau să contribui la instrumentele AI ale comunității.',
      availability: 'Part-time, 2-3 ore zilnic.',
      status: 'accepted',
      reviewNotes: 'Excepțional. Acceptat cu rol de developer.',
      reviewedBy: 'admin_demo',
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ];

  await saveAll(demo);
}
