const t = (key, values) => window.miniappI18n?.t(key, values) ?? key;

export function renderStats(container) {
  const stats = [
    { valueKey: 'stats.members.value', labelKey: 'stats.members.label', icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>` },
    { valueKey: 'stats.online.value', labelKey: 'stats.online.label', icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"/></svg>` },
    { valueKey: 'stats.channels.value', labelKey: 'stats.channels.label', icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>` },
  ];

  const items = stats.map(s => `
    <div class="text-center">
      <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-purple-400">
        ${s.icon}
      </div>
      <p class="text-3xl font-black text-white sm:text-4xl">${t(s.valueKey)}</p>
      <p class="mt-1 text-sm text-gray-400">${t(s.labelKey)}</p>
    </div>
  `).join('');

  container.innerHTML = `
    <section id="stats" class="border-y border-white/5 bg-white/[0.02] py-16 sm:py-20">
      <div class="mx-auto max-w-4xl px-4 sm:px-6">
        <div class="grid grid-cols-3 gap-8">
          ${items}
        </div>
      </div>
    </section>
  `;
}
