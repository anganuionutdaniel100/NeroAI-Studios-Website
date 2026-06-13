/**
 * Chatbox storage for NeroAI Studios.
 * Real-time-like chat with multiple channels.
 */

const MESSAGES_KEY = 'neroai_chatbox_messages';
const CHANNELS_KEY = 'neroai_chatbox_channels';
const MAX_MESSAGES = 500;

const DEFAULT_CHANNELS = [
  { id: 'general', name: 'General', icon: '💬', description: 'Discuții generale' },
  { id: 'ai-tools', name: 'AI Tools', icon: '🤖', description: 'Instrumente AI' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', description: 'Gaming discussions' },
  { id: 'music', name: 'Music', icon: '🎵', description: 'Muzică și radio' },
  { id: 'memes', name: 'Memes', icon: '😂', description: 'Memes și distracție' },
  { id: 'support', name: 'Support', icon: '🛠️', description: 'Suport tehnic' },
  { id: 'off-topic', name: 'Off-Topic', icon: '🌊', description: 'Orice subiect' },
  { id: 'announcements', name: 'Announcements', icon: '📢', description: 'Anunțuri oficiale' },
];

export { DEFAULT_CHANNELS };

async function getMessages() {
  const raw = await window.miniappsAI.storage.getItem(MESSAGES_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveMessages(data) {
  await window.miniappsAI.storage.setItem(MESSAGES_KEY, JSON.stringify(data));
}

async function getChannels() {
  const raw = await window.miniappsAI.storage.getItem(CHANNELS_KEY);
  if (!raw) {
    await window.miniappsAI.storage.setItem(CHANNELS_KEY, JSON.stringify(DEFAULT_CHANNELS));
    return DEFAULT_CHANNELS;
  }
  return JSON.parse(raw);
}

export async function initChatbox() {
  return getChannels();
}

export async function getChannelMessages(channelId, limit = 50) {
  const all = await getMessages();
  const msgs = all[channelId] || [];
  return msgs.slice(-limit);
}

export async function sendMessage({ channelId, userId, username, avatar, content, replyTo }) {
  if (!content || !content.trim()) return { ok: false, error: 'Mesajul este gol.' };

  const all = await getMessages();
  if (!all[channelId]) all[channelId] = [];

  const msg = {
    id: 'msg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    userId,
    username: username || 'Anonim',
    avatar: avatar || null,
    content: content.trim().slice(0, 2000),
    replyTo: replyTo || null,
    reactions: {},
    createdAt: new Date().toISOString(),
  };

  all[channelId].push(msg);
  if (all[channelId].length > MAX_MESSAGES) {
    all[channelId] = all[channelId].slice(-MAX_MESSAGES);
  }

  await saveMessages(all);
  return { ok: true, message: msg };
}

export async function deleteMessage(channelId, messageId, userId, isAdmin) {
  const all = await getMessages();
  if (!all[channelId]) return { ok: false };
  const idx = all[channelId].findIndex(m => m.id === messageId);
  if (idx === -1) return { ok: false };
  if (!isAdmin && all[channelId][idx].userId !== userId) return { ok: false, error: 'Nu poți șterge mesajul altcuiva.' };

  all[channelId].splice(idx, 1);
  await saveMessages(all);
  return { ok: true };
}

export async function editMessage(channelId, messageId, userId, newContent) {
  const all = await getMessages();
  if (!all[channelId]) return { ok: false };
  const msg = all[channelId].find(m => m.id === messageId);
  if (!msg) return { ok: false };
  if (msg.userId !== userId) return { ok: false, error: 'Nu poți edita mesajul altcuiva.' };

  msg.content = newContent.trim().slice(0, 2000);
  msg.editedAt = new Date().toISOString();
  await saveMessages(all);
  return { ok: true, message: msg };
}

export async function toggleReaction(channelId, messageId, userId, emoji) {
  const all = await getMessages();
  if (!all[channelId]) return { ok: false };
  const msg = all[channelId].find(m => m.id === messageId);
  if (!msg) return { ok: false };

  if (!msg.reactions) msg.reactions = {};
  if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

  const idx = msg.reactions[emoji].indexOf(userId);
  if (idx === -1) {
    msg.reactions[emoji].push(userId);
  } else {
    msg.reactions[emoji].splice(idx, 1);
    if (msg.reactions[emoji].length === 0) delete msg.reactions[emoji];
  }

  await saveMessages(all);
  return { ok: true, reactions: msg.reactions };
}

export async function getOnlineUsers() {
  return Math.floor(Math.random() * 30) + 15;
}

export async function seedChatbox() {
  const channels = await getChannels();
  const all = await getMessages();
  const hasMessages = Object.values(all).some(ch => ch.length > 0);
  if (hasMessages) return;

  const demoUsers = [
    { id: 'user1', username: 'AlexDev', avatar: '🧑‍💻' },
    { id: 'user2', username: 'MariaK', avatar: '👩‍🎨' },
    { id: 'user3', username: 'IonutR', avatar: '🎮' },
    { id: 'user4', username: 'ElenaP', avatar: '🎵' },
    { id: 'user5', username: 'BogdanM', avatar: '🤖' },
  ];

  const demoMessages = {
    'general': [
      { user: demoUsers[0], content: 'Salutare tuturor! Bun venit pe NeroAI Studios! 🎉', time: -3600000 },
      { user: demoUsers[1], content: 'Mulțumesc! Abia aștept să explorez toate funcționalitățile.', time: -3000000 },
      { user: demoUsers[2], content: 'Cine vrea să facem un voice chat mai târziu?', time: -2400000 },
      { user: demoUsers[0], content: 'Sigur! Pregătiți-vă pentru seara de gaming 🎮', time: -1800000 },
      { user: demoUsers[3], content: 'Radio-ul de pe site e super! Mergeți pe secțiunea Radio 24/7 🎵', time: -1200000 },
      { user: demoUsers[4], content: 'Am testat instrumentele AI — sunt incredibile! Recomand tuturor.', time: -600000 },
      { user: demoUsers[1], content: 'Cine știe când începe următorul event?', time: -300000 },
      { user: demoUsers[0], content: 'Verificați secțiunea de știri pentru detalii!', time: -120000 },
    ],
    'ai-tools': [
      { user: demoUsers[4], content: 'Am folosit AI-ul pentru a genera cod și funcționează perfect!', time: -7200000 },
      { user: demoUsers[0], content: 'Ce instrumente AI ați mai încercat?', time: -5400000 },
      { user: demoUsers[1], content: 'Generarea de imagini e preferata mea 🎨', time: -3600000 },
    ],
    'gaming': [
      { user: demoUsers[2], content: 'Cine joacă Valorant azi? 🎯', time: -10800000 },
      { user: demoUsers[3], content: 'Eu! Să facem o echipă!', time: -9000000 },
      { user: demoUsers[0], content: 'Count me in! Ne vedem pe Discord voice.', time: -7200000 },
    ],
  };

  for (const [channelId, messages] of Object.entries(demoMessages)) {
    all[channelId] = messages.map((m, i) => ({
      id: `msg_seed_${channelId}_${i}`,
      userId: m.user.id,
      username: m.user.username,
      avatar: m.user.avatar,
      content: m.content,
      replyTo: null,
      reactions: i === 0 ? { '🎉': ['user2', 'user3'] } : {},
      createdAt: new Date(Date.now() + m.time).toISOString(),
    }));
  }

  await saveMessages(all);
}
