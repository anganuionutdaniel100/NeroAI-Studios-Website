/**
 * Toast notification view for NeroAI Studios.
 * Shows brief success/info/error messages.
 */

const t = (key, values) => window.miniappI18n?.t(key, values) ?? key;

let toastContainer = null;

function ensureContainer() {
  if (toastContainer) return;
  toastContainer = document.createElement('div');
  toastContainer.className = 'fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none';
  toastContainer.style.maxWidth = '360px';
  document.body.appendChild(toastContainer);
}

/**
 * Show a toast notification.
 * @param {string} message - Text to display
 * @param {'success'|'error'|'info'} type - Toast type
 * @param {number} duration - How long to show (ms)
 */
export function showToast(message, type = 'success', duration = 3000) {
  ensureContainer();

  const colors = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    info: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  };

  const icons = {
    success: `<svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    error: `<svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>`,
    info: `<svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>`,
  };

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm toast-enter ${colors[type]}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `${icons[type]}<span class="text-sm font-medium">${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}
