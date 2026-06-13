import { renderChatbox } from './ui/chatbox-view.js';
import { addXP } from './xp-storage.js';
import { getVerificationStatus } from './verification-storage.js';
import { loadUserXP } from './ui/navbar-view.js';
import { renderDiscordView } from './ui/discord-view.js';
import { renderNavbar } from './ui/navbar-view.js';
import { renderHero } from './ui/hero-view.js';
import { renderStats } from './ui/stats-view.js';
import { renderFeatures } from './ui/features-view.js';
import { renderForumView } from './ui/forum-view.js';
import { renderForumThreadsView } from './ui/forum-threads-view.js';
import { renderForumThreadView } from './ui/forum-thread-view.js';
import { renderForumComposeView } from './ui/forum-compose-view.js';
import { renderInfoPanel } from './ui/info-panel-view.js';
import { renderNews } from './ui/news-view.js';
import { showToast } from './ui/toast-view.js';
import { openTicketPanel, renderTicketPanel, setTicketContainer } from './ui/ticket-panel-view.js';
import { seedTicketData } from './ticket-storage.js';
import { renderLevelUpToast } from './ui/xp-badge-view.js';
import { renderJoin } from './ui/join-view.js';
import { renderFooter } from './ui/footer-view.js';
import { renderAuthModal } from './ui/auth-modal-view.js';
import { renderSettingsModal } from './ui/settings-view.js';
import { renderAdminPanel } from './ui/admin-panel-view.js';
import { seedNotifications, initNotifications } from './ui/notification-panel-view.js';
import { applyTheme, applyFontSize, applyReducedMotion } from './ui/settings-helpers.js';
import { seedForumData } from './forum-storage.js';
import { loadSession } from './storage.js';
import { getState, setState, subscribe, initPreferences } from './state.js';
import { applyLocale } from './ui/lang-switcher-view.js';
import { setInstallBannerContainer, renderInstallBanner } from './ui/install-pwa-view.js';
import { renderQuestView } from './ui/quest-view.js';
import { renderStaffAppView } from './ui/staff-app-view.js';
import { renderRadioView, initRadioPlayer } from './ui/radio-view.js';
import { seedStaffApplications } from './staff-application-storage.js';
import { seedComplaints } from './complaint-storage.js';
import { renderComplaintView } from './ui/complaint-view.js';
import { trackQuestAction } from './quest-storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const [user, prefs] = await Promise.all([loadSession(), initPreferences()]);
  if (user) {
    setState({ currentUser: user });
  }

  if (user) {
    await loadUserXP(user.id);
    const loginResult = await addXP(user.id, 'login');
    if (loginResult?.leveledUp) {
      showToast(renderLevelUpToast(loginResult.newInfo.level, loginResult.newInfo.rankKey), 'success');
    }
  }

  applyTheme(prefs || {});
  applyFontSize(prefs?.fontSize || 'normal');
  applyReducedMotion(prefs?.reducedMotion || false);

  const savedLang = prefs?.language || 'ro';
  setState({ currentLang: savedLang });
  await applyLocale(savedLang);

  await seedNotifications();
  await initNotifications();
  await seedForumData();
  await seedTicketData();
  await seedStaffApplications();
  await seedComplaints();

  renderNavbar(document.getElementById('navbar'));
  renderHero(document.getElementById('hero'));
  renderStats(document.getElementById('stats'));
  renderFeatures(document.getElementById('features'));
  renderDiscordView(document.getElementById('discord'));
  renderInfoPanel(document.getElementById('info'));
  await renderNews(document.getElementById('news'));
  await renderJoin(document.getElementById('join'));
  await renderFooter(document.getElementById('footer'));

  setInstallBannerContainer(document.getElementById('install-banner'));
  await renderInstallBanner();

  const ticketContainer = document.getElementById('tickets');
  setTicketContainer(ticketContainer);
  await renderTicketPanel();

  const questContainer = document.getElementById('quests');
  if (questContainer) renderQuestView(questContainer);

  const staffAppContainer = document.getElementById('staff-apps');
  if (staffAppContainer) renderStaffAppView(staffAppContainer);

  const radioContainer = document.getElementById('radio');
  if (radioContainer) renderRadioView(radioContainer);

  const radioBar = document.getElementById('radio-player-bar');
  if (radioBar) initRadioPlayer(radioBar);

  const complaintContainer = document.getElementById('complaints');
  if (complaintContainer) renderComplaintView(complaintContainer);

  const chatboxContainer = document.getElementById('chatbox');
  if (chatboxContainer) await renderChatbox(chatboxContainer);

  if (user) {
    await trackQuestAction(user.id, 'login');
    await trackQuestAction(user.id, 'visit');
  }

  let _prevTicketUser = null;
  subscribe((state) => {
    if (_prevTicketUser !== state.currentUser) {
      _prevTicketUser = state.currentUser;
      renderTicketPanel();
    }
  });

  let _prevAuth = { isOpen: false, tab: '', user: null };
  let _prevSett = { isOpen: false, tab: '', user: null, prefs: null };
  let _prevAdmin = { isOpen: false };
  const infoContainer = document.getElementById('info');
  let _prevInfo = { tab: '' };
  subscribe((state) => {
    const authChanged = _prevAuth.isOpen !== state.isAuthModalOpen ||
      _prevAuth.tab !== state.authTab || _prevAuth.user !== state.currentUser;
    _prevAuth = { isOpen: state.isAuthModalOpen, tab: state.authTab, user: state.currentUser };
    if (authChanged) renderAuthModal();

    const settChanged = _prevSett.isOpen !== state.isSettingsOpen ||
      _prevSett.tab !== state.settingsTab ||
      _prevSett.user !== state.currentUser ||
      _prevSett.prefs !== state.preferences;
    _prevSett = { isOpen: state.isSettingsOpen, tab: state.settingsTab, user: state.currentUser, prefs: state.preferences };
    if (settChanged) renderSettingsModal();

    const adminChanged = _prevAdmin.isOpen !== state.isAdminPanelOpen;
    _prevAdmin = { isOpen: state.isAdminPanelOpen };
    if (adminChanged) renderAdminPanel();

    const infoChanged = _prevInfo.tab !== state.infoTab;
    _prevInfo = { tab: state.infoTab };
    if (infoChanged && infoContainer) renderInfoPanel(infoContainer);
  });

  const forumContainer = document.getElementById('forum');
  renderForumView(forumContainer);

  let _prevForum = { view: 'categories', cat: null, threadId: null, search: '', sort: 'newest' };
  subscribe((state) => {
    const changed = _prevForum.view !== state.forumView ||
      _prevForum.cat !== state.forumCategory ||
      _prevForum.threadId !== state.forumThreadId ||
      _prevForum.search !== state.forumSearch ||
      _prevForum.sort !== state.forumSort;
    _prevForum = {
      view: state.forumView,
      cat: state.forumCategory,
      threadId: state.forumThreadId,
      search: state.forumSearch,
      sort: state.forumSort,
    };
    if (changed) renderForumByState(forumContainer);
  });

  renderAuthModal();
  renderSettingsModal();
  renderAdminPanel();
});

async function renderForumByState(container) {
  const { forumView } = getState();
  switch (forumView) {
    case 'categories': await renderForumView(container); break;
    case 'threads': await renderForumThreadsView(container); break;
    case 'thread': await renderForumThreadView(container); break;
    case 'compose': renderForumComposeView(container); break;
    default: await renderForumView(container);
  }
}
