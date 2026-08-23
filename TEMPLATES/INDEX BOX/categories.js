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
     KICKERS PERSONNALISÉS DES FORUMS

     Exemple :
     /f12-nom-du-forum correspond à la clé "f12".
     ======================================================= */

  var forumKickers = {
    "f1": "Les premières lois gravées dans la pierre",
    "f2": "Les nouvelles portées par-delà les portes",
    "f3": "Les âmes qui attendent encore un visage",
    "f4": "Là où commencent les territoires du royaume"
  };


  /* =======================================================
     BADGES DES FORUMS

     Même principe que pour les kickers :
     le badge dépend directement de l’identifiant du forum.
     ======================================================= */

  var forumBadges = {
    "f1": "Administration",
    "f2": "Actualités",
    "f3": "Personnages",
    "f4": "Territoire"
  };


  /* =======================================================
     OUTILS GÉNÉRAUX
     ======================================================= */

  function cleanText(element) {
    if (!element) {
      return "";
    }

    return element.textContent
      .replace(/\s+/g, " ")
      .trim();
  }


  function parseCounter(value) {
    var cleanedValue = String(value || "")
      .replace(/[^\d]/g, "");

    return cleanedValue
      ? parseInt(cleanedValue, 10)
      : 0;
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

    return words[words.length - 1].toUpperCase();
  }


  /* =======================================================
     IDENTIFIANT DU FORUM
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


  /* =======================================================
     TEXTES PERSONNALISÉS DU FORUM
     ======================================================= */

  function initializeForumTexts(forum) {
    var forumKey = getForumKey(forum);

    var kicker = forum.querySelector(
      ".litso-forum_kicker"
    );

    var badge = forum.querySelector(
      ".litso-forum_badge"
    );

    if (kicker) {
      kicker.textContent =
        forumKickers[forumKey] ||
        "Fragments d’un royaume sans fin";
    }

    if (badge) {
      badge.textContent =
        forumBadges[forumKey] ||
        "Chapitre";
    }
  }


  /* =======================================================
     IMAGE ET DISPOSITION DU FORUM
     ======================================================= */

  function initializeForumImage(forum) {
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

    forum.classList.remove(
      "litso-forum_no-image"
    );

    image.removeAttribute("width");
    image.removeAttribute("height");

    visual.appendChild(image);
  }


  /* =======================================================
     LIENS FORUMACTIF
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
     AUTEUR DU DERNIER MESSAGE
     ======================================================= */

  function decorateLastPostAuthor(meta) {
    if (!meta) {
      return;
    }

    var links = meta.querySelectorAll("a");
    var authorElement = null;

    Array.prototype.some.call(
      links,
      function (link) {
        if (isUserProfileLink(link)) {
          authorElement = link;
          return true;
        }

        return false;
      }
    );

    if (!authorElement) {
      var coloredName = meta.querySelector(
        "strong[style*='color'], span[style*='color']"
      );

      if (coloredName) {
        authorElement =
          coloredName.closest("a") ||
          coloredName;
      }
    }

    if (!authorElement) {
      return;
    }

    var colorSource =
      authorElement.querySelector(
        "[style*='color']"
      ) ||
      authorElement;

    var groupColor =
      window.getComputedStyle(
        colorSource
      ).color;

    authorElement.style.setProperty(
      "--litso-author-color",
      groupColor
    );

    authorElement.classList.add(
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
     FORUM SANS MESSAGE
     ======================================================= */

  function initializeEmptyForum(forum) {
    var topics = parseCounter(
      forum.getAttribute("data-topics")
    );

    var posts = parseCounter(
      forum.getAttribute("data-posts")
    );

    var isEmpty =
      topics === 0 &&
      posts === 0;

    forum.classList.toggle(
      "litso-forum_empty",
      isEmpty
    );

    return isEmpty;
  }


  /* =======================================================
     DERNIER MESSAGE
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
     CATÉGORIE
     ======================================================= */

  function initializeCategory(category, categoryIndex) {
    var titleElement = category.querySelector(
      ".litso-cat_title"
    );

    var introElement = category.querySelector(
      ".litso-cat_intro"
    );

    if (introElement) {
      introElement.textContent =
        categoryIntros[categoryIndex] ||
        "";
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
        initializeForumTexts(forum);
        initializeForumImage(forum);

        var isEmpty =
          initializeEmptyForum(forum);

        if (!isEmpty) {
          initializeLastPost(forum);
        }
      }
    );
  }


  /* =======================================================
     INITIALISATION GÉNÉRALE
     ======================================================= */

  function initializeLitsoIndexBox() {
    var categories = document.querySelectorAll(
      ".litso-cat"
    );

    Array.prototype.forEach.call(
      categories,
      function (category, categoryIndex) {
        initializeCategory(
          category,
          categoryIndex
        );
      }
    );
  }


  /* =======================================================
     LANCEMENT
     ======================================================= */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoIndexBox,
      { once: true }
    );
  } else {
    initializeLitsoIndexBox();
  }
})();
