(function () {
  "use strict";

  function initializeLitsoQeel() {
    var qeel = document.querySelector(
      "[data-litso-qeel]"
    );

    if (
      !qeel ||
      qeel.getAttribute(
        "data-litso-qeel-ready"
      ) === "true"
    ) {
      return;
    }

    qeel.setAttribute(
      "data-litso-qeel-ready",
      "true"
    );

    var newestSource = qeel.querySelector(
      "[data-litso-qeel_newestSource]"
    );

    var usersSource = qeel.querySelector(
      "[data-litso-qeel_usersSource]"
    );

    var postsSource = qeel.querySelector(
      "[data-litso-qeel_postsSource]"
    );

    var newestTarget = qeel.querySelector(
      "[data-litso-qeel_newestName]"
    );

    var usersTarget = qeel.querySelector(
      "[data-litso-qeel_users]"
    );

    var postsTarget = qeel.querySelector(
      "[data-litso-qeel_posts]"
    );

    var connectedMembers = qeel.querySelector(
      "[data-litso-qeel_connected]"
    );

    var recentMembers = qeel.querySelector(
      "[data-litso-qeel_recent]"
    );

    function extractNumber(element) {
      if (!element) {
        return "0";
      }

      var text = element.textContent
        .replace(/\s+/g, " ")
        .trim();

      var match = text.match(
        /\d[\d\s.,]*/
      );

      return match
        ? match[0].replace(/\s+/g, " ").trim()
        : "0";
    }

    function displayNewestMember() {
      if (!newestSource || !newestTarget) {
        return;
      }

      var profileLink =
        newestSource.querySelector("a");

      newestTarget.innerHTML = "";

      if (profileLink) {
        newestTarget.appendChild(
          profileLink.cloneNode(true)
        );

        return;
      }

      var sourceText = newestSource.textContent
        .replace(/\s+/g, " ")
        .trim()
        .replace(
          /l['’]utilisateur(?:rice)? enregistré(?:e)? le plus récent est\s*/i,
          ""
        )
        .replace(
          /le membre enregistré(?:e)? le plus récent est\s*/i,
          ""
        )
        .trim();

      newestTarget.textContent =
        sourceText || "Nouvelle âme";
    }

    function displayStatistics() {
      if (usersTarget) {
        usersTarget.textContent =
          extractNumber(usersSource);
      }

      if (postsTarget) {
        postsTarget.textContent =
          extractNumber(postsSource);
      }
    }

    function cleanTextNodes(
      element,
      expressions
    ) {
      if (!element) {
        return;
      }

      var walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      var textNodes = [];
      var currentNode;

      while (
        (currentNode = walker.nextNode())
      ) {
        textNodes.push(currentNode);
      }

      Array.prototype.forEach.call(
        textNodes,
        function (textNode) {
          var content = textNode.nodeValue;

          Array.prototype.forEach.call(
            expressions,
            function (expression) {
              content = content.replace(
                expression,
                ""
              );
            }
          );

          textNode.nodeValue = content;
        }
      );
    }


function cleanMemberLists() {
  cleanTextNodes(
    qeel,
    [
      /membres?\s+connecté(?:e)?s?\s+au\s+cours\s+des\s+\d+\s+dernières?\s+heures?\s*:\s*/gi,

      /(?:cette\s+âme\s+foule|ces\s+âmes\s+foulent)\s+les\s+pavés\s+de\s+bonnes\s+intentions\s*[.!:]?\s*/gi
    ]
  );

  cleanTextNodes(
    recentMembers,
    [
      /utilisateurs?\s+enregistré(?:e)?s?\s*:\s*/gi
    ]
  );
}

    displayNewestMember();
    displayStatistics();
    cleanMemberLists();
  }


  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoQeel,
      { once: true }
    );
  } else {
    initializeLitsoQeel();
  }
})();
