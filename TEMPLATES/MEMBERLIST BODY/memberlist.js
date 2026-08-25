(function () {
  "use strict";

  function initializeLitsoMemberlist() {
    var memberCards = document.querySelectorAll(
      "[data-litso-memberlist_member]"
    );

    if (!memberCards.length) {
      return;
    }

    Array.prototype.forEach.call(
      memberCards,
      function (memberCard) {
        if (
          memberCard.getAttribute(
            "data-litso-memberlist-ready"
          ) === "true"
        ) {
          return;
        }

        memberCard.setAttribute(
          "data-litso-memberlist-ready",
          "true"
        );

        var pseudo = memberCard.querySelector(
          "[data-litso-memberlist_pseudo]"
        );

        if (!pseudo) {
          return;
        }

        var groupMarker = pseudo.querySelector(
          ".usr_grp_clr"
        );

        if (!groupMarker) {
          return;
        }


        /* ----- CLASSE DU GROUPE ----- */

        var groupClass = Array.prototype.find.call(
          groupMarker.classList,
          function (className) {
            return className.indexOf("group-") === 0;
          }
        );

        if (groupClass) {
          memberCard.classList.add(groupClass);
          pseudo.classList.add(groupClass);
        }


        /* ----- COULEUR RÉELLE DU GROUPE ----- */

        var groupColor =
          window.getComputedStyle(groupMarker).color;

        if (
          groupColor &&
          groupColor !== "rgba(0, 0, 0, 0)" &&
          groupColor !== "transparent"
        ) {
          memberCard.style.setProperty(
            "--litso-memberlist_groupColor",
            groupColor
          );
        }
      }
    );
  }


  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoMemberlist,
      { once: true }
    );
  } else {
    initializeLitsoMemberlist();
  }
})();
