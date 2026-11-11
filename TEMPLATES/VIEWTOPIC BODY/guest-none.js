(() => {
  function hideGuestProfileTabs() {
    document.querySelectorAll('.litso-msg_rank').forEach(rank => {
      const rankName = rank.textContent.trim().toLowerCase();
      if (rankName !== 'invité') return;

      const post = rank.closest('.post');
      const tabs = post?.querySelector('.litso_tabsystem');

      if (tabs) {
        tabs.style.setProperty('display', 'none', 'important');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideGuestProfileTabs, { once: true });
  } else {
    hideGuestProfileTabs();
  }
})();
