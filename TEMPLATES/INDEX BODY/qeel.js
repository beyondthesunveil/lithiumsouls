(function () {
  "use strict";

  function initializeLitsoQeel() {
    var qeel = document.querySelector("[data-litso-qeel]");

    if (
      !qeel ||
      qeel.getAttribute("data-litso-qeel-ready") === "true"
    ) {
      return;
    }

    qeel.setAttribute("data-litso-qeel-ready", "true");

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


    /* ----- EXTRACTION D’UN NOMBRE ----- */

    function extractNumber(element) {
      if (!element) {
        return "0";
      }

      var text = element.textContent
        .replace(/\s+/g, " ")
        .trim();

      var match = text.match(/\d[\d\s.,]*/);

      return match
        ? match[0].replace(/\s+/g, " ").trim()
        : "0";
    }


    /* ----- DERNIER MEMBRE ----- */

    function displayNewestMember() {
      if (!newestSource || !newestTarget) {
        return;
      }

      var profileLink = newestSource.querySelector("a");

      newestTarget.innerHTML = "";

      if (profileLink) {
        var clonedLink = profileLink.cloneNode(true);

        newestTarget.appendChild(clonedLink);
        return;
      }

      var sourceText = newestSource.textContent
        .replace(/\s+/g, " ")
        .trim();

      sourceText = sourceText
        .replace(
          /l['’]utilisateur(?:rice)? enregistré(?:e)? le plus récent est\s*/i,
          ""
        )
        .replace(
          /le membre enregistré le plus récent est\s*/i,
          ""
        )
        .trim();

      newestTarget.textContent =
        sourceText || "Nouvelle âme";
    }


    /* ----- STATISTIQUES ----- */

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


    displayNewestMember();
    displayStatistics();
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
