(function () {
  "use strict";


  /* =======================================================
     INTRODUCTIONS DES CATÉGORIES
     ======================================================= */

  var categoryIntros = [
    "Toute éternité commence par un seuil. Les premiers fragments du royaume vous attendent ici.",
    "Au-delà des portes s’étendent les territoires où les âmes se cherchent, se rencontrent et se consument."
  ];


  /* =======================================================
     PHRASES PERSONNALISÉES DES FORUMS
     ======================================================= */

  var forumKickers = {
    "f1": "Les premières lois gravées dans la pierre",
    "f2": "Les nouvelles portées par-delà les portes",
    "f3": "Les âmes qui attendent encore un visage",
    "f4": "Là où commencent les territoires du royaume"
  };


  /* =======================================================
     BADGES DES VISUELS
     ======================================================= */

  var forumBadges = [
    "Administration",
    "Actualités",
    "Personnages",
    "Territoire"
  ];


  /* =======================================================
     OUTILS
     ======================================================= */

  function pad(number) {
    var value = String(number);

    return value.length < 2
      ? "0" + value
      : value;
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


  /* =======================================================
     IDENTIFIANT DU FORUM
     ======================================================= */

  function getForumKey(forum) {
    var link = forum.querySelector(
      ".litso-forum_title a"
    );

    if (!link) {
      return "";
    }

    var href =
      link.getAttribute("href") || "";

    var match = href.match(
      /\/f(\d+)(?:-|\/|$)/
    );

    return match
      ? "f" + match[1]
      : "";
  }


  /* =======================================================
     KICKER
     ======================================================= */

  function setForumKicker(forum) {
    var kicker = forum.querySelector(
      ".litso-forum_kicker"
    );

    if (!kicker) {
      return;
    }

    kicker.textContent =
      forumKickers[getForumKey(forum)] ||
      "Fragments d’un royaume sans fin";
  }


  /* =======================================================
     IMAGE DU FORUM
     ======================================================= */

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

    var image = description.querySelector(
      "img"
    );

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


  /* =======================================================
     IDENTIFICATION DES LIENS
     ======================================================= */

  function isUserProfileLink(link) {
    if (!link) {
      return false;
    }

    var href =
      link.getAttribute("href") || "";

    return (
      /^\/u\d+(?:-|$)/.test(href) ||
      /\/profile\?mode=viewprofile/.test(href)
    );
  }


  function findLastMessageLink(meta) {
    if (!meta) {
      return null;
    }

    var result = null;

    Array.prototype.some.call(
      meta.querySelectorAll("a"),
      function (link) {
        if (isUserProfileLink(link)) {
          return false;
        }

        var href =
          link.getAttribute("href") || "";

        if (
          href.indexOf("#") !== -1 ||
          link.querySelector("img")
        ) {
          result = link;
          return true;
        }

        return false;
      }
    );

    return result;
  }


  /* =======================================================
     BADGE DE L’AUTEUR
     ======================================================= */

  function decorateLastPostAuthor(meta) {
    if (!meta) {
      return;
    }

    var author = null;

    Array.prototype.some.call(
      meta.querySelectorAll("a"),
      function (link) {
        if (isUserProfileLink(link)) {
          author = link;
          return true;
        }

        return false;
      }
    );

    if (!author) {
      return;
    }

    var colorSource =
      author.querySelector(
        "[style*='color']"
      ) ||
      author;

    var color =
      window.getComputedStyle(
        colorSource
      ).color;

    author.style.setProperty(
      "--litso-author-color",
      color
    );

    author.classList.add(
      "litso-lastpost_author"
    );
  }


  /* =======================================================
     DERNIER MESSAGE
     ======================================================= */

  function initializeLastPost(forum) {
    /*
     * Le forum vide est entièrement géré par le CSS.
     */
    if (
      forum.getAttribute("data-topics") === "0" &&
      forum.getAttribute("data-posts") === "0"
    ) {
      return;
    }

    var meta = forum.querySelector(
      ".litso-lastpost_meta"
    );

    var arrow = forum.querySelector(
      ".litso-lastpost_arrow--real"
    );

    var title = forum.querySelector(
      ".litso-lastpost_title"
    );

    if (!meta) {
      return;
    }

    var messageLink =
      findLastMessageLink(meta);

    var href = messageLink
      ? messageLink.getAttribute("href") || ""
      : "";

    if (href) {
      if (arrow) {
        arrow.href = href;
      }

      if (title) {
        title.href = href;
      }
    }

    decorateLastPostAuthor(meta);

    Array.prototype.forEach.call(
      meta.querySelectorAll("img"),
      function (image) {
        image.remove();
      }
    );
  }


  /* =======================================================
     INITIALISATION
     ======================================================= */

  function initializeLitsoIndexBox() {
    var categories =
      document.querySelectorAll(
        ".litso-cat"
      );

    var globalForumIndex = 0;

    Array.prototype.forEach.call(
      categories,
      function (
        category,
        categoryIndex
      ) {
        var indexElement =
          category.querySelector(
            ".litso-cat_index b"
          );

        var titleElement =
          category.querySelector(
            ".litso-cat_title"
          );

        var introElement =
          category.querySelector(
            ".litso-cat_intro"
          );

        if (indexElement) {
          indexElement.textContent =
            pad(categoryIndex + 1);
        }

        if (introElement) {
          introElement.textContent =
            categoryIntros[
              categoryIndex
            ] || "";
        }

        category.setAttribute(
          "data-ghost",
          createGhostWord(
            titleElement
          )
        );

        var forums =
          category.querySelectorAll(
            ".litso-forum"
          );

        Array.prototype.forEach.call(
          forums,
          function (forum) {
            var badge =
              forum.querySelector(
                ".litso-forum_badge"
              );

            if (badge) {
              badge.textContent =
                forumBadges[
                  globalForumIndex
                ] || "Chapitre";
            }

            globalForumIndex += 1;

            setForumKicker(forum);
            moveForumImage(forum);
            initializeLastPost(forum);
          }
        );
      }
    );
  }


  /* =======================================================
     LANCEMENT
     ======================================================= */

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoIndexBox,
      { once: true }
    );
  } else {
    initializeLitsoIndexBox();
  }
})();
