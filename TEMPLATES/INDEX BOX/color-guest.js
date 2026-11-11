(function () {
  function addGuestAuthorBadges() {
    document.querySelectorAll('.litso-lastpost_meta').forEach(function (meta) {
      if (
        meta.closest('.litso-forum_empty') ||
        meta.querySelector('.litso-lastpost_author, a[href*="/u"], a[href*="mode=viewprofile"]')
      ) {
        return;
      }

      const lineBreak = meta.querySelector(':scope > br');
      const nameNode = lineBreak && lineBreak.nextSibling;

      if (!nameNode || nameNode.nodeType !== Node.TEXT_NODE) return;

      const name = nameNode.textContent.trim();
      if (!name) return;

      // Le nom doit être seul sur sa ligne.
      for (let node = nameNode.nextSibling; node; node = node.nextSibling) {
        if (node.nodeType !== Node.TEXT_NODE || node.textContent.trim()) {
          return;
        }
      }

      const badge = document.createElement('span');
      badge.className = 'litso-lastpost_author';
      badge.style.setProperty('--litso-author-color', 'var(--border-strong)');
      badge.textContent = name;
      nameNode.replaceWith(badge);
    });
  }

  if (document.readyState === 'complete') {
    addGuestAuthorBadges();
  } else {
    window.addEventListener('load', addGuestAuthorBadges, { once: true });
  }
})();
