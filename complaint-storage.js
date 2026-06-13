/**
 * Complaint system storage for NeroAI Studios.
 * Users submit complaints; admins review, respond, and resolve.
 */

const COMPLAINTS_KEY = 'neroai_complaints';

const CATEGORIES = [
  { id: 'bug', icon: '🐛', labelKey: 'complaint.catBug' },
  { id: 'behavior', icon: '⚠️', labelKey: 'complaint.catBehavior' },
  { id: 'content', icon: '📋', labelKey: 'complaint.catContent' },
  { id: 'suggestion', icon: '💡', labelKey: 'complaint.catSuggestion' },
  { id: 'other', icon: '📌', labelKey: 'complaint.catOther' },
];

const PRIORITIES = [
  { id: 'low', icon: '🟢', labelKey: 'complaint.priLow', color: 'emerald' },
  { id: 'medium', icon: '🟡', labelKey: 'complaint.priMedium', color: 'amber' },
  { id: 'high', icon: '🟠', labelKey: 'complaint.priHigh', color: 'orange' },
  { id: 'urgent', icon: '🔴', labelKey: 'complaint.priUrgent', color: 'red' },
];

const STATUS_LIST = [
  { id: 'pending', icon: '⏳', labelKey: 'complaint.statusPending', color: 'amber' },
  { id: 'review', icon: '🔍', labelKey: 'complaint.statusReview', color: 'blue' },
  { id: 'resolved', icon: '✅', labelKey: 'complaint.statusResolved', color: 'emerald' },
  { id: 'rejected', icon: '❌', labelKey: 'complaint.statusRejected', color: 'red' },
];

export { CATEGORIES, PRIORITIES, STATUS_LIST };

async function getAll() {
  const raw = await window.miniappsAI.storage.getItem(COMPLAINTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveAll(list) {
  await window.miniappsAI.storage.setItem(COMPLAINTS_KEY, JSON.stringify(list));
}

export async function createComplaint({ userId, username, category, priority, subject, description }) {
  const list = await getAll();
  const entry = {
    id: 'cmp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    userId, username: username || 'Anonim',
    category: category || 'other',
    priority: priority || 'medium',
    subject: subject || 'Fără subiect',
    description: description || '',
    status: 'pending', responses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  list.unshift(entry);
  if (list.length > 200) list.length = 200;
  await saveAll(list);
  return entry;
}

export async function getAllComplaints() { return getAll(); }

export async function getUserComplaints(userId) {
  const list = await getAll();
  return list.filter(c => c.userId === userId);
}

export async function getComplaintById(id) {
  const list = await getAll();
  return list.find(c => c.id === id) || null;
}

export async function updateComplaintStatus(complaintId, newStatus, callerId) {
  const list = await getAll();
  const idx = list.findIndex(c => c.id === complaintId);
  if (idx === -1) return { ok: false, error: 'Reclamația nu a fost găsită.' };
  list[idx].status = newStatus;
  list[idx].updatedAt = new Date().toISOString();
  await saveAll(list);
  return { ok: true };
}

export async function respondToComplaint(complaintId, { authorId, authorName, message }) {
  const list = await getAll();
  const idx = list.findIndex(c => c.id === complaintId);
  if (idx === -1) return { ok: false, error: 'Reclamația nu a fost găsită.' };
  if (!list[idx].responses) list[idx].responses = [];
  list[idx].responses.push({
    id: 'rsp_' + Date.now().toString(36),
    authorId, authorName: authorName || 'Admin', message,
    createdAt: new Date().toISOString(),
  });
  list[idx].updatedAt = new Date().toISOString();
  await saveAll(list);
  return { ok: true };
}

export async function deleteComplaint(complaintId) {
  const list = await getAll();
  const filtered = list.filter(c => c.id !== complaintId);
  await saveAll(filtered);
  return { ok: true };
}

export async function getComplaintStats() {
  const list = await getAll();
  const total = list.length;
  const pending = list.filter(c => c.status === 'pending').length;
  const review = list.filter(c => c.status === 'review').length;
  const resolved = list.filter(c => c.status === 'resolved').length;
  const rejected = list.filter(c => c.status === 'rejected').length;

  const byCategory = {};
  const byPriority = {};
  for (const c of list) {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
  }

  return { total, pending, review, resolved, rejected, byCategory, byPriority };
}

export async function seedComplaints() {
  const existing = await getAll();
  if (existing.length > 0) return;

  const demo = [
    {
      id: 'cmp_demo1', userId: 'demo_user', username: 'AlexDev',
      category: 'bug', priority: 'high',
      subject: 'Playerul radio se oprește după schimbarea paginii',
      description: 'Când navighez de pe secțiunea Radio pe altă secțiune și revin, playerul nu mai redă automat.',
      status: 'resolved',
      responses: [{
        id: 'rsp_demo1', authorId: 'admin_demo', authorName: 'NeroAI Admin',
        message: 'Mulțumim pentru raportare! Am implementat o soluție care menține playerul activ la navigare.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }],
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'cmp_demo2', userId: 'demo_user', username: 'AlexDev',
      category: 'behavior', priority: 'medium',
      subject: 'Comportament toxic pe forumul de discuții',
      description: 'Un utilizator postează comentarii ofensatoare în thread-ul "Cele mai bune instrumente AI".',
      status: 'review', responses: [],
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      updatedAt: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: 'cmp_demo3', userId: 'demo_user2', username: 'MariaK',
      category: 'suggestion', priority: 'low',
      subject: 'Sugestie: temă întunecată pentru forum',
      description: 'Ar fi util să avem o opțiune de temă întunecată mai pronunțată pentru forum.',
      status: 'pending', responses: [],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'cmp_demo4', userId: 'demo_user3', username: 'IonutR',
      category: 'content', priority: 'urgent',
      subject: 'Conținut spam pe categorii multiple',
      description: 'Sunt mai multe conturi care postează link-uri suspecte pe categoriile "Promovări Servere" și "Comunități".',
      status: 'pending', responses: [],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  await saveAll(demo);
}
