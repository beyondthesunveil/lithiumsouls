(function () {
  "use strict";

  var categoryIntros = [
    "Toute éternité commence par un seuil. Les premiers fragments du royaume vous attendent ici.",
    "Au-delà des portes s’étendent les territoires où les âmes se cherchent, se rencontrent et se consument."
  ];

  var forumBadges = [
    "Administration",
    "Actualités",
    "Personnages",
    "Territoire"
  ];

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function cleanText(element) {
    if (!element) {
      return "";
    }

    return element.textContent
      .replace(/\s+/g, " ")
      .trim();
  }

  function createGhostWord(titleElement) {
    var title = cleanText(titleElement);

    if (!title) {
      return "INFERNI";
    }

    var words = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(" ")
      .filter(Boolean);

    return words.length
      ? words[words.length - 1].toUpperCase()
      : "INFERNI";
  }

  function moveForumImage(forum) {
    var description = forum.querySelector(
      ".litso-forum_desc"
    );

    var visual = forum.querySelector(
      ".litso-forum_visual-image"
    );

    if (!description || !visual) {
      return;
    }

    var image = description.querySelector("img");

    if (!image) {
      forum.classList.add(
        "litso-forum_no-image"
      );

      return;
    }

    image.removeAttribute("width");
    image.removeAttribute("height");

    visual.appendChild(image);
  }

  function initializeLitsoIndexBox() {
    var categories = document.querySelectorAll(
      ".litso-cat"
    );

    var globalForumIndex = 0;

    Array.prototype.forEach.call(
      categories,
      function (category, categoryIndex) {
        var categoryNumber = pad(
          categoryIndex + 1
        );

        var indexElement = category.querySelector(
          ".litso-cat_index b"
        );

        var titleElement = category.querySelector(
          ".litso-cat_title"
        );

        var introElement = category.querySelector(
          ".litso-cat_intro"
        );

        if (indexElement) {
          indexElement.textContent =
            categoryNumber;
        }

        if (introElement) {
          introElement.textContent =
            categoryIntros[categoryIndex] || "";
        }

        category.setAttribute(
          "data-ghost",
          createGhostWord(titleElement)
        );

        var forums = category.querySelectorAll(
          ".litso-forum"
        );

        Array.prototype.forEach.call(
          forums,
          function (forum) {
            globalForumIndex++;

            var forumNumber = pad(
              globalForumIndex
            );

            var smallNumber =
              forum.querySelector(
                ".litso-forum_num"
              );

            var bigNumber =
              forum.querySelector(
                ".litso-forum_big-num"
              );

            var badge =
              forum.querySelector(
                ".litso-forum_badge"
              );

            if (smallNumber) {
              smallNumber.textContent =
                forumNumber;
            }

            if (bigNumber) {
              bigNumber.textContent =
                forumNumber;
            }

            if (badge) {
              badge.textContent =
                forumBadges[
                  globalForumIndex - 1
                ] || "Chapitre";
            }

            moveForumImage(forum);
          }
        );
      }
    );
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoIndexBox
    );
  } else {
    initializeLitsoIndexBox();
  }
})();
