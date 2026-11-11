(function () {
  function addGuestAuthorBadges() {
    document.querySelectorAll('.litso-lastpost_meta').forEach(function (meta) {
      if (
        meta.closest('.litso-forum_empty') ||
        meta.querySelector('.litso-lastpost_author')
      ) {
        return;
      }
      
      const breaks = Array.from(meta.querySelectorAll('br')).reverse();

      for (const lineBreak of breaks) {
        const nameNodes = [];

        for (
          let node = lineBreak.nextSibling;
          node && node.nodeName !== 'BR';
          node = node.nextSibling
        ) {
          if (
            node.nodeType === Node.TEXT_NODE ||
            (node.nodeType === Node.ELEMENT_NODE && node.matches('strong, span, b'))
          ) {
            nameNodes.push(node);
          }
        }

        const name = nameNodes.map(function (node) {
          return node.textContent;
        }).join('').trim();

        if (!name) continue;

        const badge = document.createElement('span');
        badge.className = 'litso-lastpost_author';
        badge.textContent = name;

        nameNodes[0].before(badge);
        nameNodes.forEach(function (node) {
          node.remove();
        });
        break;
      }
    });
  }

  if (document.readyState === 'complete') {
    addGuestAuthorBadges();
  } else {
    window.addEventListener('load', addGuestAuthorBadges, { once: true });
  }
})();
