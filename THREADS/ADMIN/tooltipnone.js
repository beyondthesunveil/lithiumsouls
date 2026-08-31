/* empêcher le tooltip natif des top sites d'intervernis */

document.addEventListener(
  "DOMContentLoaded",
  function () {
    document
      .querySelectorAll(
        ".litso_noticeTooltip"
      )
      .forEach(function (link) {
        link.removeAttribute(
          "title"
        );
      });
  }
);
