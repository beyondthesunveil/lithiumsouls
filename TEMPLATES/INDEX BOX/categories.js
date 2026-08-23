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
     BADGES DES FORUMS
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

    if (!words.length) {
      return "INFERNI";
    }

    return words[
      words.length - 1
    ].toUpperCase();
  }


  /* =======================================================
     IDENTIFIANT ET KICKER DU FORUM
     ======================================================= */

  function getForumKey(forum) {
    var forumLink = forum.querySelector(
      ".litso-forum_title a"
    );

    if (!forumLink) {
      return "";
    }

    var href =
      forumLink.getAttribute("href") || "";

    var match = href.match(
      /\/f(\d+)(?:-|\/|$)/
    );

    return match
      ? "f" + match[1]
      : "";
  }


  function setForumKicker(forum) {
    var kicker = forum.querySelector(
      ".litso-forum_kicker"
    );

    if (!kicker) {
      return;
    }

    var forumKey = getForumKey(forum);

    kicker.textContent =
      forumKickers[forumKey] ||
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
     LIENS DU DERNIER MESSAGE
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

    var links = meta.querySelectorAll("a");
    var exactLink = null;
    var imageLink = null;

    Array.prototype.forEach.call(
      links,
      function (link) {
        if (isUserProfileLink(link)) {
          return;
        }

        var href =
          link.getAttribute("href") || "";

        if (
          !exactLink &&
          href.indexOf("#") !== -1
        ) {
          exactLink = link;
        }

        if (
          !imageLink &&
          link.querySelector("img")
        ) {
          imageLink = link;
        }
      }
    );

    return exactLink || imageLink;
  }


  /* =======================================================
     BADGE DE L’AUTEUR
     ======================================================= */

  function decorateLastPostAuthor(meta) {
    if (!meta) {
      return;
    }

    var links = meta.querySelectorAll("a");
    var authorLink = null;

    Array.prototype.some.call(
      links,
      function (link) {
        if (isUserProfileLink(link)) {
          authorLink = link;
          return true;
        }

        return false;
      }
    );

    if (!authorLink) {
      var coloredName = meta.querySelector(
        "strong[style*='color'], span[style*='color']"
      );

      if (coloredName) {
        authorLink =
          coloredName.closest("a") ||
          coloredName;
      }
    }

    if (!authorLink) {
      return;
    }

    var colorSource =
      authorLink.querySelector(
        "[style*='color']"
      ) ||
      authorLink;

    var groupColor =
      window.getComputedStyle(
        colorSource
      ).color;

    authorLink.style.setProperty(
      "--litso-author-color",
      groupColor
    );

    authorLink.classList.add(
      "litso-lastpost_author"
    );
  }


  /* =======================================================
     NETTOYAGE DES IMAGES NATIVES
     ======================================================= */

  function removeForumactifPostImages(meta) {
    if (!meta) {
      return;
    }

    var images = meta.querySelectorAll("img");

    Array.prototype.forEach.call(
      images,
      function (image) {
        var parentLink =
          image.closest("a");

        if (
          parentLink &&
          !parentLink.textContent.trim()
        ) {
          parentLink.remove();
          return;
        }

        image.remove();
      }
    );
  }


  /* =======================================================
     INITIALISATION DU DERNIER MESSAGE
     ======================================================= */

  function initializeLastPost(forum) {
    var meta = forum.querySelector(
      ".litso-lastpost_meta"
    );

    var arrow = forum.querySelector(
      ".litso-lastpost_arrow"
    );

    var title = forum.querySelector(
      ".litso-lastpost_title"
    );

    if (!meta) {
      return;
    }

    var lastMessageLink =
      findLastMessageLink(meta);

    var exactHref = lastMessageLink
      ? lastMessageLink.getAttribute("href")
      : "";

    if (exactHref) {
      if (arrow) {
        arrow.href = exactHref;
      }

      if (title) {
        title.href = exactHref;
      }
    }

    decorateLastPostAuthor(meta);
    removeForumactifPostImages(meta);
  }


  /* =======================================================
     COMPTEURS
     ======================================================= */

  function readForumCounters(forum) {
    var counters = forum.querySelectorAll(
      ".litso-stats strong"
    );

    function parseCounter(element) {
      if (!element) {
        return null;
      }

      var value = element.textContent
        .replace(/[^\d]/g, "");

      return value
        ? parseInt(value, 10)
        : 0;
    }

    return {
      topics: parseCounter(counters[0]),
      posts: parseCounter(counters[1])
    };
  }


  /* =======================================================
     FORUM SANS MESSAGE
     ======================================================= */

  function initializeEmptyForum(forum) {
    var counters =
      readForumCounters(forum);

    var isEmpty =
      counters.topics === 0 &&
      counters.posts === 0;

    forum.classList.toggle(
      "litso-forum_empty",
      isEmpty
    );

    if (!isEmpty) {
      return false;
    }

    var realAvatar = forum.querySelector(
      ".litso-lastpost_avatar--real"
    );

    var emptyAvatar = forum.querySelector(
      ".litso-lastpost_avatar--empty"
    );

    var realContent = forum.querySelector(
      ".litso-lastpost_content"
    );

    var emptyContent = forum.querySelector(
      ".litso-lastpost_empty"
    );

    var arrow = forum.querySelector(
      ".litso-lastpost_arrow"
    );

    if (realAvatar) {
      realAvatar.hidden = true;
    }

    if (emptyAvatar) {
      emptyAvatar.hidden = false;
    }

    if (realContent) {
      realContent.hidden = true;
    }

    if (emptyContent) {
      emptyContent.hidden = false;
    }

    if (arrow) {
      var forumUrl =
        arrow.getAttribute(
          "data-forum-url"
        );

      if (forumUrl) {
        arrow.href = forumUrl;
      }

      arrow.setAttribute(
        "aria-label",
        "Découvrir ce forum"
      );
    }

    return true;
  }


  /* =======================================================
     INITIALISATION GÉNÉRALE
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
        var categoryNumber = pad(
          categoryIndex + 1
        );

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
            categoryNumber;
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

            globalForumIndex++;

            if (badge) {
              badge.textContent =
                forumBadges[
                  globalForumIndex - 1
                ] || "Chapitre";
            }

            setForumKicker(forum);
            moveForumImage(forum);

            var forumIsEmpty =
              initializeEmptyForum(forum);

            if (!forumIsEmpty) {
              initializeLastPost(forum);
            }
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
