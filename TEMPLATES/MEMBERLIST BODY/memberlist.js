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

        var groupClass = "";


        /* ----- CLASSE PRÉSENTE DANS LE PSEUDO ----- */

        if (groupMarker) {
          groupClass = Array.prototype.find.call(
            groupMarker.classList,
            function (className) {
              return className.indexOf("group-") === 0;
            }
          ) || "";
        }


        /* ----- SECOURS AVEC USER_GROUP_ID ----- */

        if (!groupClass) {
          var groupId = memberCard.getAttribute(
            "data-group"
          );

          if (groupId) {
            groupClass = "group-" + groupId;
          }
        }


        /* ----- APPLICATION ----- */

        if (groupClass) {
          memberCard.classList.add(groupClass);
          pseudo.classList.add(groupClass);
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
