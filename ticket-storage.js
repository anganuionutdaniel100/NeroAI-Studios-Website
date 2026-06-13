/**
 * Support ticket system storage for NeroAI Studios.
 * Users create tickets; staff responds and resolves.
 */

const TICKETS_KEY = 'neroai_tickets';

const TICKET_CATEGORIES = [
  { id: 'general', icon: '💬', labelKey: 'ticket.catGeneral' },
  { id: 'technical', icon: '🔧', labelKey: 'ticket.catTechnical' },
  { id: 'billing', icon: '💳', labelKey: 'ticket.catBilling' },
  { id: 'report', icon: '🚨', labelKey: 'ticket.catReport' },
  { id: 'suggestion', icon: '💡', labelKey: 'ticket.catSuggestion' },
  { id: 'other', icon: '📌', labelKey: 'ticket.catOther' },
];

const TICKET_STATUSES = [
  { id: 'open', icon: '🟢', labelKey: 'ticket.statusOpen', color: 'emerald' },
  { id: 'pending', icon: '🟡', labelKey: 'ticket.statusPending', color: 'amber' },
  { id: 'resolved', icon: '✅', labelKey: 'ticket.statusResolved', color: 'blue' },
  { id: 'closed', icon: '🔒', labelKey: 'ticket.statusClosed', color: 'gray' },
];

const TICKET_PRIORITIES = [
  { id: 'low', icon: '🟢', labelKey: 'ticket.priLow', color: 'emerald' },
  { id: 'medium', icon: '🟡', labelKey: 'ticket.priMedium', color: 'amber' },
  { id: 'high', icon: '🟠', labelKey: 'ticket.priHigh', color: 'orange' },
  { id: 'urgent', icon: '🔴', labelKey: 'ticket.priUrgent', color: 'red' },
];

export { TICKET_CATEGORIES, TICKET_STATUSES, TICKET_PRIORITIES };

async function getAll() {
  const raw = await window.miniappsAI.storage.getItem(TICKETS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveAll(list) {
  await window.miniappsAI.storage.setItem(TICKETS_KEY, JSON.stringify(list));
}

export async function createTicket({ userId, username, category, priority, subject, description }) {
  const list = await getAll();
  const entry = {
    id: 'tkt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    userId,
    username: username || 'Anonim',
    category: category || 'general',
    priority: priority || 'medium',
    subject: subject || 'Fără subiect',
    description: description || '',
    status: 'open',
    responses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  list.unshift(entry);
  if (list.length > 200) list.length = 200;
  await saveAll(list);
  return entry;
}

export async function getAllTickets() {
  return getAll();
}

export async function getUserTickets(userId) {
  const list = await getAll();
  return list.filter(t => t.userId === userId);
}

export async function getTicketById(id) {
  const list = await getAll();
  return list.find(t => t.id === id) || null;
}

export async function updateTicketStatus(ticketId, newStatus, callerId) {
  const list = await getAll();
  const idx = list.findIndex(t => t.id === ticketId);
  if (idx === -1) return { ok: false, error: 'Ticketul nu a fost găsit.' };
  list[idx].status = newStatus;
  list[idx].updatedAt = new Date().toISOString();
  await saveAll(list);
  return { ok: true };
}

export async function respondToTicket(ticketId, { authorId, authorName, message }) {
  const list = await getAll();
  const idx = list.findIndex(t => t.id === ticketId);
  if (idx === -1) return { ok: false, error: 'Ticketul nu a fost găsit.' };
  if (!list[idx].responses) list[idx].responses = [];
  list[idx].responses.push({
    id: 'rsp_' + Date.now().toString(36),
    authorId,
    authorName: authorName || 'Staff',
    message,
    createdAt: new Date().toISOString(),
  });
  list[idx].updatedAt = new Date().toISOString();
  await saveAll(list);
  return { ok: true };
}

export async function deleteTicket(ticketId) {
  const list = await getAll();
  const filtered = list.filter(t => t.id !== ticketId);
  await saveAll(filtered);
  return { ok: true };
}

export async function getTicketStats() {
  const list = await getAll();
  const total = list.length;
  const open = list.filter(t => t.status === 'open').length;
  const pending = list.filter(t => t.status === 'pending').length;
  const resolved = list.filter(t => t.status === 'resolved').length;
  const closed = list.filter(t => t.status === 'closed').length;
  return { total, open, pending, resolved, closed };
}

export async function seedTicketData() {
  const existing = await getAll();
  if (existing.length > 0) return;

  const demo = [
    {
      id: 'tkt_demo1',
      userId: 'demo_user',
      username: 'AlexDev',
      category: 'technical',
      priority: 'high',
      subject: 'Nu pot accesa panoul de administrare',
      description: 'De ieri, când încerc să intru în panoul de admin, primesc eroare 403. Am încercat pe mai multe browsere.',
      status: 'open',
      responses: [],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'tkt_demo2',
      userId: 'demo_user2',
      username: 'MariaK',
      category: 'suggestion',
      priority: 'low',
      subject: 'Sugestie: Dark mode pentru chatbox',
      description: 'Ar fi util să avem opțiunea de dark mode pentru chatbox, deoarece albul curent e obositor noaptea.',
      status: 'resolved',
      responses: [
        {
          id: 'rsp_demo1',
          authorId: 'admin_demo',
          authorName: 'NeroAI Staff',
          message: 'Mulțumim pentru sugestie! Am implementat tema întunecată pentru chatbox. Verifică setările.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'tkt_demo3',
      userId: 'demo_user3',
      username: 'IonutR',
      category: 'general',
      priority: 'medium',
      subject: 'Cum pot deveni moderator?',
      description: 'Aș dori să știu care sunt pașii pentru a deveni moderator pe serverul NeroAI.',
      status: 'pending',
      responses: [],
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      updatedAt: new Date(Date.now() - 43200000).toISOString(),
    },
  ];

  await saveAll(demo);
}
