(function () {
  "use strict";

  function initializeGuestAvatars() {

    function updateGuestAvatar(notification) {
      if (
        !notification ||
        !notification.matches(".notification")
      ) {
        return;
      }

      var text = notification.querySelector(".notif_text");
      var avatar = notification.querySelector(".notif_avatar");

      if (!text || !avatar) {
        return;
      }

      var normalizedText = text.textContent
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      var isGuest = /\binvite\b/.test(normalizedText);

      avatar.classList.toggle(
        "notif-guest",
        isGuest
      );
    }

    function scanElement(element) {
      if (!element || element.nodeType !== 1) {
        return;
      }

      if (element.matches(".notification")) {
        updateGuestAvatar(element);
      }

      element
        .querySelectorAll(".notification")
        .forEach(updateGuestAvatar);
    }

    document
      .querySelectorAll(".notification")
      .forEach(updateGuestAvatar);

    if ("MutationObserver" in window) {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {

          mutation.addedNodes.forEach(function (node) {
            scanElement(node);
          });

          if (mutation.type === "characterData") {
            var notification =
              mutation.target.parentElement &&
              mutation.target.parentElement.closest(
                ".notification"
              );

            if (notification) {
              updateGuestAvatar(notification);
            }
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }


  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeGuestAvatars,
      { once: true }
    );
  } else {
    initializeGuestAvatars();
  }
})();
