(function () {
  "use strict";


  /* =====================================================
     OUTILS
     ===================================================== */

  function normalizeLitsoText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );
  }


  function refreshLitsoIcons() {
    if (
      window.lucide &&
      typeof window.lucide.createIcons ===
        "function"
    ) {
      window.lucide.createIcons();
    }
  }


  /* =====================================================
     ÉTAT DU BOUTON J’AIME
     ===================================================== */

  function detectInitialLikeState(button) {
    var className = String(
      button.className || ""
    ).toLowerCase();

    var label = normalizeLitsoText(
      button.textContent
    );

    return (
      className.indexOf("liked") !== -1 ||
      className.indexOf("active") !== -1 ||
      className.indexOf("voted") !== -1 ||
      label.indexOf("je n'aime plus") !== -1 ||
      label.indexOf("retirer") !== -1 ||
      label.indexOf("unlike") !== -1
    );
  }


  function readLikeCount(button) {
    var counter = button.querySelector(
      ".litso-msg_likeCount"
    );

    if (!counter) {
      return 0;
    }

    var match = counter.textContent.match(
      /\d+/
    );

    return match
      ? parseInt(match[0], 10)
      : 0;
  }


  function updateLikeButton(
    button,
    liked,
    count
  ) {
    var label = button.querySelector(
      ".litso-msg_likeLabel"
    );

    var counter = button.querySelector(
      ".litso-msg_likeCount"
    );

    button.classList.toggle(
      "is-liked",
      liked
    );

    button.setAttribute(
      "aria-pressed",
      String(liked)
    );

    button.setAttribute(
      "aria-label",
      liked
        ? "Retirer mon appréciation"
        : "J’aime ce message"
    );

    if (label) {
      label.textContent = liked
        ? "Aimé"
        : "J’aime";
    }

    if (counter) {
      counter.textContent =
        count > 0
          ? String(count)
          : "";
    }
  }


  function sendLikeRequest(url) {
    return window.fetch(
      url,
      {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "X-Requested-With":
            "XMLHttpRequest"
        }
      }
    ).then(
      function (response) {
        if (!response.ok) {
          throw new Error(
            "La réaction n’a pas été enregistrée."
          );
        }

        return response;
      }
    );
  }


  function initializeLikeButton(button) {
    if (
      button.getAttribute(
        "data-litso-like-ready"
      ) === "true"
    ) {
      return;
    }

    button.setAttribute(
      "data-litso-like-ready",
      "true"
    );

    var initiallyLiked =
      detectInitialLikeState(button);

    updateLikeButton(
      button,
      initiallyLiked,
      readLikeCount(button)
    );

    button.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        if (
          button.classList.contains(
            "is-loading"
          )
        ) {
          return;
        }

        var currentlyLiked =
          button.getAttribute(
            "aria-pressed"
          ) === "true";

        var addUrl =
          button.getAttribute(
            "data-href"
          );

        var removeUrl =
          button.getAttribute(
            "data-href-rm"
          );

        var requestUrl =
          currentlyLiked
            ? removeUrl
            : addUrl;

        if (!requestUrl) {
          return;
        }

        var previousCount =
          readLikeCount(button);

        var nextCount =
          Math.max(
            0,
            previousCount +
              (currentlyLiked ? -1 : 1)
          );

        button.classList.add(
          "is-loading"
        );

        sendLikeRequest(requestUrl)
          .then(
            function () {
              updateLikeButton(
                button,
                !currentlyLiked,
                nextCount
              );
            }
          )
          .catch(
            function () {
              updateLikeButton(
                button,
                currentlyLiked,
                previousCount
              );
            }
          )
          .finally(
            function () {
              button.classList.remove(
                "is-loading"
              );
            }
          );
      }
    );
  }


  /* =====================================================
     ÉTAT DE SURVEILLANCE DU SUJET
     ===================================================== */

  function updateWatchTopicState(
    watchBlock
  ) {
    var watchLink =
      watchBlock.querySelector("a");

    if (!watchLink) {
      watchBlock.hidden = true;
      return;
    }

    var label = normalizeLitsoText(
      watchLink.textContent
    );

    var href = normalizeLitsoText(
      watchLink.getAttribute("href")
    );

    var isWatching =
      label.indexOf(
        "arreter de surveiller"
      ) !== -1 ||
      label.indexOf(
        "ne plus surveiller"
      ) !== -1 ||
      label.indexOf(
        "stop watching"
      ) !== -1 ||
      href.indexOf("unwatch") !== -1;

    watchBlock.classList.toggle(
      "is-watching",
      isWatching
    );

    watchLink.setAttribute(
      "aria-pressed",
      String(isWatching)
    );

    watchLink.setAttribute(
      "aria-label",
      isWatching
        ? "Ne plus surveiller ce sujet"
        : "Surveiller ce sujet"
    );

    /*
     * On conserve le texte produit par
     * Forumactif afin que le lien reste
     * compréhensible et fonctionnel.
     */
  }


  /* =====================================================
     ÉTAT DU BOUTON FAVORI
     ===================================================== */

  function updateFavoriteState() {
    var favoriteButton =
      document.getElementById(
        "fa-topic-fav-button"
      );

    if (!favoriteButton) {
      return;
    }

    var isFavorite =
      favoriteButton.classList.contains(
        "is-faved"
      );

    favoriteButton.setAttribute(
      "aria-pressed",
      String(isFavorite)
    );
  }


  /* =====================================================
     INITIALISATION
     ===================================================== */

  function initializeLitsoTopicTools() {
    var likeButtons =
      document.querySelectorAll(
        ".litso-msg_likebtn"
      );

    Array.prototype.forEach.call(
      likeButtons,
      initializeLikeButton
    );

    var watchBlocks =
      document.querySelectorAll(
        "[data-litso-msg-watch]"
      );

    Array.prototype.forEach.call(
      watchBlocks,
      updateWatchTopicState
    );

    updateFavoriteState();
    refreshLitsoIcons();


    /*
     * Le script des favoris peut changer
     * la classe du bouton après notre
     * initialisation. Cet observateur
     * synchronise alors aria-pressed.
     */

    var favoriteButton =
      document.getElementById(
        "fa-topic-fav-button"
      );

    if (
      favoriteButton &&
      favoriteButton.getAttribute(
        "data-litso-favorite-observer"
      ) !== "true" &&
      "MutationObserver" in window
    ) {
      favoriteButton.setAttribute(
        "data-litso-favorite-observer",
        "true"
      );

      var favoriteObserver =
        new MutationObserver(
          updateFavoriteState
        );

      favoriteObserver.observe(
        favoriteButton,
        {
          attributes: true,
          attributeFilter: [
            "class"
          ]
        }
      );
    }
  }


  function startLitsoTopicTools() {
    initializeLitsoTopicTools();

    window.addEventListener(
      "load",
      initializeLitsoTopicTools,
      { once: true }
    );
  }


  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      startLitsoTopicTools,
      { once: true }
    );
  } else {
    startLitsoTopicTools();
  }

})();
