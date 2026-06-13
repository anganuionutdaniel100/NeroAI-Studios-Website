/**
 * Radio 24/7 system for NeroAI Studios.
 * 20 channels: 8 AI-generated, 8 Romanian, 4 International.
 */

const RADIO_FAV_KEY = 'neroai_radio_favorites';
const RADIO_HISTORY_KEY = 'neroai_radio_history';
const RADIO_VOLUME_KEY = 'neroai_radio_volume';

export const RADIO_CHANNELS = [
  /* AI Generated */
  { id: 'lofi_ai', name: 'Lo-Fi AI', desc: 'Muzică lo-fi generată de AI pentru relaxare și focus.', icon: '🎧', color: 'purple', category: 'ai', stream: 'https://streams.ilovemusic.de/iloveradio17.mp3', genre: 'Lo-Fi', listeners: 42 },
  { id: 'synthwave', name: 'Synthwave', desc: 'Synthwave și retrowave — sunete din viitorul retro.', icon: '🌆', color: 'cyan', category: 'ai', stream: 'https://streams.ilovemusic.de/iloveradio20.mp3', genre: 'Synthwave', listeners: 31 },
  { id: 'ambient', name: 'Ambient Spa', desc: 'Sunete ambientale pentru meditație și concentrare.', icon: '🌿', color: 'emerald', category: 'ai', stream: 'https://streams.ilovemusic.de/iloveradio14.mp3', genre: 'Ambient', listeners: 28 },
  { id: 'cyberpunk', name: 'Cyberpunk FM', desc: 'Muzică electronică dark pentru sesiuni intense de coding.', icon: '🤖', color: 'rose', category: 'ai', stream: 'https://streams.ilovemusic.de/iloveradio19.mp3', genre: 'Electronic', listeners: 19 },
  { id: 'jazz_ai', name: 'Jazz AI', desc: 'Jazz generat de AI — improvizații infinite.', icon: '🎷', color: 'violet', category: 'ai', stream: 'https://streams.ilovemusic.de/iloveradio21.mp3', genre: 'Jazz', listeners: 23 },
  { id: 'classical_ai', name: 'Clasică AI', desc: 'Muzică clasică generată de AI — Beethoven, Mozart reimaginați.', icon: '🎻', color: 'sky', category: 'ai', stream: 'https://streams.ilovemusic.de/iloveradio15.mp3', genre: 'Clasică', listeners: 17 },
  { id: 'drum_and_bass', name: 'Drum & Bass', desc: 'Ritmuri rapide și bass profund — energie pură.', icon: '🥁', color: 'orange', category: 'ai', stream: 'https://streams.ilovemusic.de/iloveradio3.mp3', genre: 'Drum & Bass', listeners: 35 },
  { id: 'deep_house', name: 'Deep House', desc: 'Deep house și progressive pentru sesiuni chill de lucru.', icon: '🌊', color: 'teal', category: 'ai', stream: 'https://streams.ilovemusic.de/iloveradio4.mp3', genre: 'Deep House', listeners: 47 },

  /* Românești */
  { id: 'radio_zu', name: 'Radio ZU', desc: 'Cel mai ascultat post de radio din România — hituri, dance, pop.', icon: '🔴', color: 'red', category: 'romania', stream: 'https://astreaming.radiozu.ro/radiozu', genre: 'Pop / Dance', listeners: 156 },
  { id: 'europa_fm', name: 'Europa FM', desc: 'Știri, dezbateri și muzică de calitate — informație și entertainment.', icon: '🔵', color: 'blue', category: 'romania', stream: 'https://astreaming.europafm.ro/europafm', genre: 'Știri / Pop', listeners: 134 },
  { id: 'kiss_fm', name: 'Kiss FM', desc: 'Cele mai tari hituri — muzică dance, pop și R&B.', icon: '💜', color: 'pink', category: 'romania', stream: 'https://astreaming.kissfm.ro/kissfm', genre: 'Dance / Pop', listeners: 121 },
  { id: 'pro_fm', name: 'Pro FM', desc: 'Hituri actuale și clasice — pop, rock, tot ce contează.', icon: '🟢', color: 'green', category: 'romania', stream: 'https://astreaming.profm.ro/profm', genre: 'Pop / Rock', listeners: 98 },
  { id: 'romania_actualitati', name: 'România Actualități', desc: 'Radio public — știri, cultură, emisiuni de actualitate.', icon: '📻', color: 'yellow', category: 'romania', stream: 'https://rastream.ro/radioactualitati.mp3', genre: 'Știri / Cultură', listeners: 87 },
  { id: 'magic_fm', name: 'Magic FM', desc: 'Cele mai frumoase melodii — oldies, pop clasic, balade.', icon: '✨', color: 'indigo', category: 'romania', stream: 'https://astreaming.magicfm.ro/magicfm', genre: 'Oldies / Pop', listeners: 76 },
  { id: 'virgin_radio', name: 'Virgin Radio', desc: 'Rock, indie, alternative — muzică cu atitudine.', icon: '🎸', color: 'lime', category: 'romania', stream: 'https://astreaming.virginradio.ro/virginradio', genre: 'Rock / Indie', listeners: 65 },
  { id: 'radio_guerrilla', name: 'Radio Guerrilla', desc: 'Alternativ, rock, jazz, electronic — muzică liberă.', icon: '✊', color: 'stone', category: 'romania', stream: 'https://astreaming.radioguerrilla.ro/guerrilla', genre: 'Alternativ / Rock', listeners: 58 },

  /* Internaționale */
  { id: 'lofi_girl', name: 'Lofi Girl', desc: 'Lo-fi hip hop beats to relax/study to — fenomenul global.', icon: '🎧', color: 'fuchsia', category: 'international', stream: 'https://streams.ilovemusic.de/iloveradio95.mp3', genre: 'Lo-Fi Hip Hop', listeners: 203 },
  { id: 'classic_fm_uk', name: 'Classic FM UK', desc: 'Cel mai mare post de muzică clasică din UK — Mozart, Chopin, Debussy.', icon: '🎶', color: 'slate', category: 'international', stream: 'https://media-ice.musicradio.com/ClassicFMMP3', genre: 'Clasică', listeners: 145 },
  { id: 'bbc_radio1', name: 'BBC Radio 1', desc: 'Cel mai popular post BBC — muzică nouă, dance, pop, hip-hop.', icon: '🇬🇧', color: 'red', category: 'international', stream: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one', genre: 'Pop / Dance', listeners: 178 },
  { id: 'soma_drone', name: 'SomaFM Drone Zone', desc: 'Ambient atmosferic spațial — perfect pentru meditație și focus.', icon: '🌌', color: 'slate', category: 'international', stream: 'https://ice4.somafm.com/dronezone-128-mp3', genre: 'Ambient / Drone', listeners: 89 },
];

export const CHANNEL_COLOR_MAP = {
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', accent: '#a855f7' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', accent: '#06b6d4' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', accent: '#10b981' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', accent: '#f59e0b' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', accent: '#f43f5e' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', accent: '#8b5cf6' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', accent: '#0ea5e9' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', accent: '#f97316' },
  teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400', accent: '#14b8a6' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', accent: '#ef4444' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', accent: '#3b82f6' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', accent: '#ec4899' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', accent: '#eab308' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', accent: '#6366f1' },
  lime: { bg: 'bg-lime-500/10', border: 'border-lime-500/20', text: 'text-lime-400', accent: '#84cc16' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', accent: '#22c55e' },
  stone: { bg: 'bg-stone-500/10', border: 'border-stone-500/20', text: 'text-stone-400', accent: '#78716c' },
  fuchsia: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', text: 'text-fuchsia-400', accent: '#d946ef' },
  slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', accent: '#64748b' },
};

export const RADIO_CATEGORIES = [
  { id: 'all', labelKey: 'radio.cat.all', icon: '📻' },
  { id: 'romania', labelKey: 'radio.cat.romania', icon: '🇷🇴' },
  { id: 'international', labelKey: 'radio.cat.international', icon: '🌍' },
  { id: 'ai', labelKey: 'radio.cat.ai', icon: '🤖' },
  { id: 'favorites', labelKey: 'radio.cat.favorites', icon: '⭐' },
];

/* ═══════════════════════════════════════════
   Favorites
   ═══════════════════════════════════════════ */

async function getFavorites() {
  const raw = await window.miniappsAI.storage.getItem(RADIO_FAV_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveFavorites(favs) {
  await window.miniappsAI.storage.setItem(RADIO_FAV_KEY, JSON.stringify(favs));
}

export async function getRadioFavorites() {
  return getFavorites();
}

export async function toggleRadioFavorite(channelId) {
  const favs = await getFavorites();
  const idx = favs.indexOf(channelId);
  if (idx >= 0) { favs.splice(idx, 1); } else { favs.push(channelId); }
  await saveFavorites(favs);
  return favs;
}

export async function isRadioFavorite(channelId) {
  const favs = await getFavorites();
  return favs.includes(channelId);
}

/* ═══════════════════════════════════════════
   Volume
   ═══════════════════════════════════════════ */

export async function getRadioVolume() {
  const raw = await window.miniappsAI.storage.getItem(RADIO_VOLUME_KEY);
  return raw ? parseFloat(raw) : 0.5;
}

export async function setRadioVolume(vol) {
  await window.miniappsAI.storage.setItem(RADIO_VOLUME_KEY, String(Math.max(0, Math.min(1, vol))));
}

/* ═══════════════════════════════════════════
   Listening history (for quest tracking)
   ═══════════════════════════════════════════ */

export async function logRadioSession(userId, channelId) {
  const raw = await window.miniappsAI.storage.getItem(RADIO_HISTORY_KEY);
  const history = raw ? JSON.parse(raw) : {};
  if (!history[userId]) history[userId] = [];
  const today = new Date().toISOString().split('T')[0];
  const exists = history[userId].some(h => h.date === today && h.channelId === channelId);
  if (!exists) {
    history[userId].unshift({ channelId, date: today, at: new Date().toISOString() });
    if (history[userId].length > 100) history[userId].length = 100;
  }
  await window.miniappsAI.storage.setItem(RADIO_HISTORY_KEY, JSON.stringify(history));
  return !exists;
}

export async function getTodayRadioCount(userId) {
  if (!userId) return 0;
  const raw = await window.miniappsAI.storage.getItem(RADIO_HISTORY_KEY);
  const history = raw ? JSON.parse(raw) : {};
  const userHistory = history[userId] || [];
  const today = new Date().toISOString().split('T')[0];
  return userHistory.filter(h => h.date === today).length;
}
