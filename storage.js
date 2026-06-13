/**
 * Session & user storage for NeroAI Studios.
 * Handles user registration, login, session persistence.
 */

const USERS_KEY = 'neroai_users';
const SESSION_KEY = 'neroai_session';

/* ═══════════════════════════════════════════
   User helpers
   ═══════════════════════════════════════════ */

async function getAllUsers() {
  const raw = await window.miniappsAI.storage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveAllUsers(users) {
  await window.miniappsAI.storage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Register a new user. Returns { ok, user?, error? } */
export async function registerUser({ username, email, password }) {
  const users = await getAllUsers();
  
  if (!username || username.trim().length < 2) {
    return { ok: false, error: 'Numele trebuie să aibă cel puțin 2 caractere.' };
  }
  if (!email || !email.includes('@')) {
    return { ok: false, error: 'Adresa de email nu este validă.' };
  }
  if (!password || password.length < 4) {
    return { ok: false, error: 'Parola trebuie să aibă cel puțin 4 caractere.' };
  }
  
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return { ok: false, error: 'Există deja un cont cu acest email.' };
  }
  
  const existingUsername = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existingUsername) {
    return { ok: false, error: 'Acest nume de utilizator este deja luat.' };
  }
  
  const user = {
    id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    avatar: null,
    bio: '',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
  
  users.push(user);
  await saveAllUsers(users);
  
  const session = { ...user };
  delete session.password;
  await window.miniappsAI.storage.setItem(SESSION_KEY, JSON.stringify(session));
  
  return { ok: true, user: session };
}

/** Login user. Returns { ok, user?, error? } */
export async function loginUser({ email, password }) {
  const users = await getAllUsers();
  
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return { ok: false, error: 'Email sau parolă incorectă.' };
  }
  
  if (user.password !== password) {
    return { ok: false, error: 'Email sau parolă incorectă.' };
  }
  
  user.lastLogin = new Date().toISOString();
  await saveAllUsers(users);
  
  const session = { ...user };
  delete session.password;
  await window.miniappsAI.storage.setItem(SESSION_KEY, JSON.stringify(session));
  
  return { ok: true, user: session };
}

/** Load current session */
export async function loadSession() {
  const raw = await window.miniappsAI.storage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Logout current user */
export async function logoutUser() {
  await window.miniappsAI.storage.removeItem(SESSION_KEY);
}

/** Update user profile */
export async function updateUserProfile(userId, updates) {
  const users = await getAllUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return { ok: false, error: 'Utilizator negăsit.' };
  
  if (updates.username) {
    const existing = users.find(u => u.id !== userId && u.username.toLowerCase() === updates.username.toLowerCase());
    if (existing) {
      return { ok: false, error: 'Acest nume de utilizator este deja luat.' };
    }
    users[idx].username = updates.username.trim();
  }
  
  if (updates.bio !== undefined) users[idx].bio = updates.bio;
  if (updates.avatar !== undefined) users[idx].avatar = updates.avatar;
  
  await saveAllUsers(users);
  
  const session = { ...users[idx] };
  delete session.password;
  await window.miniappsAI.storage.setItem(SESSION_KEY, JSON.stringify(session));
  
  return { ok: true, user: session };
}

/** Get user by ID */
export async function getUserById(userId) {
  const users = await getAllUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  const session = { ...user };
  delete session.password;
  return session;
}
