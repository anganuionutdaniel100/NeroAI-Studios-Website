import { addXP } from './xp-storage.js';
const THREADS_KEY = 'neroai_forum_threads';
const REPLIES_KEY = 'neroai_forum_replies';

export const FORUM_CATEGORIES = [
  { id: 'general', nameKey: 'forum.cat.general.title', descKey: 'forum.cat.general.desc', color: 'purple', icon: '💬' },
  { id: 'regulations', nameKey: 'forum.cat.regulations.title', descKey: 'forum.cat.regulations.desc', color: 'red', icon: '🛡️' },
  { id: 'ai-art', nameKey: 'forum.cat.aiArt.title', descKey: 'forum.cat.aiArt.desc', color: 'cyan', icon: '✨' },
  { id: 'prompting', nameKey: 'forum.cat.prompting.title', descKey: 'forum.cat.prompting.desc', color: 'amber', icon: '📝' },
  { id: 'workflows', nameKey: 'forum.cat.workflows.title', descKey: 'forum.cat.workflows.desc', color: 'emerald', icon: '⚙️' },
  { id: 'showcase', nameKey: 'forum.cat.showcase.title', descKey: 'forum.cat.showcase.desc', color: 'rose', icon: '🖼️' },
  { id: 'gaming', nameKey: 'forum.cat.gaming.title', descKey: 'forum.cat.gaming.desc', color: 'lime', icon: '🎮' },
  { id: 'presentations', nameKey: 'forum.cat.presentations.title', descKey: 'forum.cat.presentations.desc', color: 'indigo', icon: '🎤' },
  { id: 'help', nameKey: 'forum.cat.help.title', descKey: 'forum.cat.help.desc', color: 'sky', icon: '❓' },
  { id: 'information', nameKey: 'forum.cat.information.title', descKey: 'forum.cat.information.desc', color: 'orange', icon: 'ℹ️' },
  { id: 'server-discord', nameKey: 'forum.cat.serverDiscord.title', descKey: 'forum.cat.serverDiscord.desc', color: 'indigo', icon: '🖥️' },
  { id: 'bot-discord', nameKey: 'forum.cat.botDiscord.title', descKey: 'forum.cat.botDiscord.desc', color: 'cyan', icon: '🤖' },
  { id: 'partnerships', nameKey: 'forum.cat.partnerships.title', descKey: 'forum.cat.partnerships.desc', color: 'emerald', icon: '🤝' },
  { id: 'requests', nameKey: 'forum.cat.requests.title', descKey: 'forum.cat.requests.desc', color: 'amber', icon: '📋' },
  { id: 'reclamatii', nameKey: 'forum.cat.reclamatii.title', descKey: 'forum.cat.reclamatii.desc', color: 'red', icon: '⚠️' },
  { id: 'muzica', nameKey: 'forum.cat.muzica.title', descKey: 'forum.cat.muzica.desc', color: 'violet', icon: '🎵' },
  { id: 'promotions', nameKey: 'forum.cat.promotions.title', descKey: 'forum.cat.promotions.desc', color: 'fuchsia', icon: '🚀' },
  { id: 'communities', nameKey: 'forum.cat.communities.title', descKey: 'forum.cat.communities.desc', color: 'teal', icon: '👥' },
];

const CATEGORY_COLOR_MAP = {
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-300' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', badge: 'bg-cyan-500/15 text-cyan-300' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-300' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', badge: 'bg-rose-500/15 text-rose-300' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', badge: 'bg-sky-500/15 text-sky-300' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', badge: 'bg-red-500/15 text-red-300' },
  lime: { bg: 'bg-lime-500/10', border: 'border-lime-500/20', text: 'text-lime-400', badge: 'bg-lime-500/15 text-lime-300' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', badge: 'bg-indigo-500/15 text-indigo-300' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', badge: 'bg-orange-500/15 text-orange-300' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', badge: 'bg-violet-500/15 text-violet-300' },
  fuchsia: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', text: 'text-fuchsia-400', badge: 'bg-fuchsia-500/15 text-fuchsia-300' },
  teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400', badge: 'bg-teal-500/15 text-teal-300' },
};

export function getCatColors(catId) {
  const cat = FORUM_CATEGORIES.find(c => c.id === catId);
  return CATEGORY_COLOR_MAP[cat?.color] || CATEGORY_COLOR_MAP.purple;
}

async function getAllThreads() {
  const raw = await window.miniappsAI.storage.getItem(THREADS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveAllThreads(threads) {
  await window.miniappsAI.storage.setItem(THREADS_KEY, JSON.stringify(threads));
}

export async function loadThreads(categoryId) {
  const all = await getAllThreads();
  const filtered = categoryId ? all.filter(t => t.categoryId === categoryId) : all;
  return filtered.sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
    return new Date(b.lastReplyAt || b.createdAt) - new Date(a.lastReplyAt || a.createdAt);
  });
}

export async function getThread(threadId) {
  const all = await getAllThreads();
  return all.find(t => t.id === threadId) || null;
}

export async function createThread({ categoryId, title, body, authorId, authorName }) {
  const all = await getAllThreads();
  const thread = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    categoryId, title, body, authorId, authorName,
    createdAt: new Date().toISOString(), likes: [], views: 0,
    pinned: false, locked: false, lastReplyAt: new Date().toISOString(),
  };
  all.unshift(thread);
  await saveAllThreads(all);
  await addXP(authorId, 'thread_created', thread.id);
  return thread;
}

export async function deleteThread(threadId) {
  const all = await getAllThreads();
  await saveAllThreads(all.filter(t => t.id !== threadId));
  const allReplies = await getAllReplies();
  await saveAllReplies(allReplies.filter(r => r.threadId !== threadId));
}

export async function toggleThreadLike(threadId, userId) {
  const all = await getAllThreads();
  const idx = all.findIndex(t => t.id === threadId);
  if (idx === -1) return null;
  const likes = all[idx].likes || [];
  const likeIdx = likes.indexOf(userId);
  if (likeIdx >= 0) { likes.splice(likeIdx, 1); } else { likes.push(userId); }
  all[idx].likes = likes;
  await saveAllThreads(all);
  if (likeIdx < 0 && all[idx].authorId !== userId) {
    await addXP(all[idx].authorId, 'like_received_thread', threadId);
  }
  return all[idx];
}

export async function incrementViews(threadId) {
  const all = await getAllThreads();
  const idx = all.findIndex(t => t.id === threadId);
  if (idx === -1) return;
  all[idx].views = (all[idx].views || 0) + 1;
  await saveAllThreads(all);
}

export async function searchThreads(query, categoryId) {
  const threads = categoryId ? await loadThreads(categoryId) : await getAllThreads();
  if (!query) return threads;
  const q = query.toLowerCase();
  return threads.filter(t =>
    t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q) || t.authorName.toLowerCase().includes(q)
  );
}

async function getAllReplies() {
  const raw = await window.miniappsAI.storage.getItem(REPLIES_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveAllReplies(replies) {
  await window.miniappsAI.storage.setItem(REPLIES_KEY, JSON.stringify(replies));
}

export async function loadReplies(threadId) {
  const all = await getAllReplies();
  return all.filter(r => r.threadId === threadId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

export async function createReply({ threadId, body, authorId, authorName }) {
  const all = await getAllReplies();
  const reply = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    threadId, body, authorId, authorName,
    createdAt: new Date().toISOString(), likes: [],
  };
  all.push(reply);
  await saveAllReplies(all);
  const threads = await getAllThreads();
  const tIdx = threads.findIndex(t => t.id === threadId);
  if (tIdx >= 0) {
    threads[tIdx].lastReplyAt = new Date().toISOString();
    await saveAllThreads(threads);
  }
  await addXP(authorId, 'reply_created', reply.id);
  return reply;
}

export async function toggleReplyLike(replyId, userId) {
  const all = await getAllReplies();
  const idx = all.findIndex(r => r.id === replyId);
  if (idx === -1) return null;
  const likes = all[idx].likes || [];
  const likeIdx = likes.indexOf(userId);
  if (likeIdx >= 0) { likes.splice(likeIdx, 1); } else { likes.push(userId); }
  all[idx].likes = likes;
  await saveAllReplies(all);
  if (likeIdx < 0 && all[idx].authorId !== userId) {
    await addXP(all[idx].authorId, 'like_received_reply', replyId);
  }
  return all[idx];
}

export async function getCategoryStats() {
  const threads = await getAllThreads();
  const replies = await getAllReplies();
  const stats = {};
  for (const cat of FORUM_CATEGORIES) {
    const catThreads = threads.filter(t => t.categoryId === cat.id);
    const catThreadIds = new Set(catThreads.map(t => t.id));
    const catReplies = replies.filter(r => catThreadIds.has(r.threadId));
    stats[cat.id] = { threads: catThreads.length, posts: catThreads.length + catReplies.length };
  }
  return stats;
}

export async function seedForumData() {
  const existing = await getAllThreads();
  if (existing.length > 0) return;
  const adminId = 'seed_admin';
  const adminName = 'NeroAI Team';
  const threads = [
    { id: 'seed_t1', categoryId: 'prompting', title: 'Cele mai bune prompturi pentru SDXL', body: 'Prompturi testate: portrete, peisaje, abstract.', authorId: adminId, authorName: adminName, createdAt: '2025-12-08T10:00:00Z', likes: ['u1','u2','u3','u4','u5'], views: 342, pinned: true, locked: false, lastReplyAt: '2025-12-10T14:30:00Z' },
    { id: 'seed_t2', categoryId: 'workflows', title: 'Workflow ComfyUI pentru upscaling 4x', body: 'Tutorial pas cu pas cu RealESRGAN.', authorId: adminId, authorName: adminName, createdAt: '2025-12-06T09:00:00Z', likes: ['u1','u2','u3'], views: 215, pinned: true, locked: false, lastReplyAt: '2025-12-09T11:00:00Z' },
    { id: 'seed_t3', categoryId: 'showcase', title: 'Prima mea lucrare cu AI 🎨', body: 'Cyberpunk cityscape cu SDXL.', authorId: 'su1', authorName: 'Alex_M', createdAt: '2025-12-09T15:00:00Z', likes: ['u2','u3','u4','u5','u6','u7'], views: 178, pinned: false, locked: false, lastReplyAt: '2025-12-10T12:00:00Z' },
    { id: 'seed_t4', categoryId: 'ai-art', title: 'Stable Diffusion 3 — Primele impresii', body: 'Comparatie SD3 vs SDXL.', authorId: 'su2', authorName: 'DariaV', createdAt: '2025-12-07T12:00:00Z', likes: ['u1','u3'], views: 289, pinned: false, locked: false, lastReplyAt: '2025-12-10T08:00:00Z' },
    { id: 'seed_t5', categoryId: 'help', title: 'ControlNet cu SD — Ghid începători', body: 'OpenPose, Canny, Depth explained.', authorId: 'su3', authorName: 'MihaiDev', createdAt: '2025-12-05T08:00:00Z', likes: ['u1','u2','u4','u5','u6','u7','u8'], views: 521, pinned: false, locked: false, lastReplyAt: '2025-12-10T16:00:00Z' },
    { id: 'seed_t6', categoryId: 'general', title: 'Salut! Sunt nou aici 👋', body: 'Programator pasionat de AI art.', authorId: 'su4', authorName: 'AndreiP', createdAt: '2025-12-10T09:00:00Z', likes: ['u2','u5'], views: 67, pinned: false, locked: false, lastReplyAt: '2025-12-10T10:30:00Z' },
    { id: 'seed_t7', categoryId: 'regulations', title: 'Regulamentul comunității', body: '5 reguli de bază.', authorId: adminId, authorName: adminName, createdAt: '2025-12-01T08:00:00Z', likes: ['u1','u2','u3','u4','u5','u6','u7','u8'], views: 890, pinned: true, locked: true, lastReplyAt: '2025-12-01T08:00:00Z' },
    { id: 'seed_t8', categoryId: 'gaming', title: 'Jocuri + AI Art 🎮', body: 'Wallpaper-uri Cyberpunk, Elden Ring.', authorId: 'su1', authorName: 'Alex_M', createdAt: '2025-12-09T18:00:00Z', likes: ['u3','u5','u6'], views: 156, pinned: false, locked: false, lastReplyAt: '2025-12-10T09:00:00Z' },
    { id: 'seed_t9', categoryId: 'presentations', title: 'Proiect portret AI — Workflow complet', body: 'SDXL + LoRA + upscale.', authorId: 'su2', authorName: 'DariaV', createdAt: '2025-12-08T14:00:00Z', likes: ['u1','u4','u7','admin'], views: 234, pinned: false, locked: false, lastReplyAt: '2025-12-10T11:00:00Z' },
    { id: 'seed_t10', categoryId: 'information', title: '📌 Resurse utile pentru începători', body: 'Linkuri, tutoriale, FAQ.', authorId: adminId, authorName: adminName, createdAt: '2025-12-03T10:00:00Z', likes: ['u1','u2','u3','u4','u5'], views: 645, pinned: true, locked: true, lastReplyAt: '2025-12-03T10:00:00Z' },
    { id: 'seed_t11', categoryId: 'server-discord', title: 'Setare server Discord NeroAI', body: 'Ghid moderatori.', authorId: adminId, authorName: adminName, createdAt: '2025-12-08T11:00:00Z', likes: ['u1','u2','u3'], views: 198, pinned: true, locked: true, lastReplyAt: '2025-12-08T11:00:00Z' },
    { id: 'seed_t12', categoryId: 'bot-discord', title: 'Bot generare imagini AI', body: '/gen /style /upscale /models', authorId: adminId, authorName: adminName, createdAt: '2025-12-07T15:00:00Z', likes: ['u1','u3','u4','u5','u6'], views: 412, pinned: true, locked: false, lastReplyAt: '2025-12-10T10:00:00Z' },
    { id: 'seed_t13', categoryId: 'partnerships', title: 'Program parteneriate', body: '100+ membri, comunitate activă.', authorId: adminId, authorName: adminName, createdAt: '2025-12-05T09:00:00Z', likes: ['u2','u4','u6'], views: 287, pinned: true, locked: true, lastReplyAt: '2025-12-05T09:00:00Z' },
    { id: 'seed_t14', categoryId: 'requests', title: 'Cerere rol Moderator', body: 'Template + cerințe.', authorId: adminId, authorName: adminName, createdAt: '2025-12-04T08:00:00Z', likes: ['u1','u3','u5','u7','u8'], views: 356, pinned: false, locked: true, lastReplyAt: '2025-12-04T08:00:00Z' },
    { id: 'seed_t15', categoryId: 'reclamatii', title: 'Comportament necorespunzător #general', body: 'Mesaje ofensatoare, dovezi atașate.', authorId: 'su1', authorName: 'Alex_M', createdAt: '2025-12-10T20:00:00Z', likes: ['u2','u3'], views: 89, pinned: false, locked: false, lastReplyAt: '2025-12-11T10:00:00Z' },
    { id: 'seed_t16', categoryId: 'muzica', title: 'Top instrumente AI pentru muzică 🎵', body: 'Suno, Udio, MusicGen.', authorId: 'su2', authorName: 'DariaV', createdAt: '2025-12-09T13:00:00Z', likes: ['u1','u3','u4','u5','u6'], views: 267, pinned: true, locked: false, lastReplyAt: '2025-12-11T09:00:00Z' },
    { id: 'seed_t17', categoryId: 'promotions', title: '🚀 Server nou AI Art — 500+ membri', body: 'Canale, boți, tutoriale, challenge-uri.', authorId: 'su3', authorName: 'MihaiDev', createdAt: '2025-12-08T16:00:00Z', likes: ['u1','u4'], views: 198, pinned: false, locked: false, lastReplyAt: '2025-12-10T15:00:00Z' },
    { id: 'seed_t18', categoryId: 'communities', title: 'Lista comunităților AI Discord', body: 'Art, Dev, Music, Gaming, Prompting.', authorId: adminId, authorName: adminName, createdAt: '2025-12-07T10:00:00Z', likes: ['u1','u2','u3','u4','u5','u6','u7'], views: 534, pinned: true, locked: false, lastReplyAt: '2025-12-11T08:00:00Z' },
  ];
  const replies = [
    { id: 'sr1', threadId: 'seed_t1', body: 'Promptul pentru portrete funcționează excelent!', authorId: 'su1', authorName: 'Alex_M', createdAt: '2025-12-09T11:00:00Z', likes: ['u2'] },
    { id: 'sr2', threadId: 'seed_t1', body: 'Recomand "film grain" pentru look vintage.', authorId: 'su2', authorName: 'DariaV', createdAt: '2025-12-10T14:30:00Z', likes: [] },
    { id: 'sr3', threadId: 'seed_t3', body: 'Adaugă "dramatic rim lighting"!', authorId: 'su3', authorName: 'MihaiDev', createdAt: '2025-12-10T12:00:00Z', likes: ['su1'] },
    { id: 'sr4', threadId: 'seed_t3', body: 'Încearcă ControlNet pentru compoziție.', authorId: adminId, authorName: adminName, createdAt: '2025-12-10T13:00:00Z', likes: [] },
    { id: 'sr5', threadId: 'seed_t4', body: 'SD3 textul e mult mai bun.', authorId: 'su4', authorName: 'AndreiP', createdAt: '2025-12-08T09:00:00Z', likes: ['su2'] },
    { id: 'sr6', threadId: 'seed_t5', body: 'OpenPose deformat — ce weight?', authorId: 'su4', authorName: 'AndreiP', createdAt: '2025-12-09T14:00:00Z', likes: [] },
    { id: 'sr7', threadId: 'seed_t5', body: 'Weight 0.65-0.75, CFG 8-9.', authorId: 'su3', authorName: 'MihaiDev', createdAt: '2025-12-10T16:00:00Z', likes: ['su4'] },
    { id: 'sr8', threadId: 'seed_t6', body: 'Bun venit! 🎉', authorId: adminId, authorName: adminName, createdAt: '2025-12-10T10:30:00Z', likes: ['su4'] },
    { id: 'sr9', threadId: 'seed_t8', body: 'ControlNet depth cu screenshot-uri!', authorId: 'su3', authorName: 'MihaiDev', createdAt: '2025-12-10T09:00:00Z', likes: ['su1'] },
    { id: 'sr10', threadId: 'seed_t9', body: 'LoRA-ul face diferența. Ce LR?', authorId: adminId, authorName: adminName, createdAt: '2025-12-09T16:00:00Z', likes: ['su2'] },
    { id: 'sr11', threadId: 'seed_t15', body: 'Confirm incidentul.', authorId: 'su2', authorName: 'DariaV', createdAt: '2025-12-11T10:00:00Z', likes: ['su1'] },
    { id: 'sr12', threadId: 'seed_t16', body: 'Suno AI e incredibil!', authorId: 'su4', authorName: 'AndreiP', createdAt: '2025-12-10T15:00:00Z', likes: ['su2'] },
    { id: 'sr13', threadId: 'seed_t18', body: 'Excelentă listă!', authorId: 'su1', authorName: 'Alex_M', createdAt: '2025-12-11T08:00:00Z', likes: [] },
  ];
  await saveAllThreads(threads);
  await saveAllReplies(replies);
}
