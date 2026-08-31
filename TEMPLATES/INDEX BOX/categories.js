(function () {
  "use strict";

  var categoryIntros = [
    "Toute éternité commence par un seuil. Les premiers fragments du royaume vous attendent ici.",
    "Au-delà des portes s’étendent les territoires où les âmes se cherchent, se rencontrent et se consument."
  ];

  var forumKickers = {
    "f1": "Phrase d'accroche",
    "f10": "Phrase d'accroche",
    "f4": "Phrase d'accroche",
    "f12": "Phrase d'accroche",
    "f13": "Phrase d'accroche",
    "f15": "Phrase d'accroche",
    "f3": "Royaume vermeille du Serpent",
    "f5": "Volcan Bigarade du Dragon",
    "f6": "Ruche dorée de la Louve",
    "f7": "Chapiteau Smaragdin du Scolopendre",
    "f8": "Cité étiolée de la Chimère",
    "f9": "Atlantide améthyste de la Siamoise",
    "f11": "Palais amarante de la Brebis",
    "f35": "Phrase d'accroche",
    "f20": "Phrase d'accroche",
    "f31": "Phrase d'accroche",
    "f19": "Phrase d'accroche",
    "f41": "Phrase d'accroche",
    "f29": "Phrase d'accroche",
    "f2": "Phrase d'accroche"
  };

  var forumBadges = {
    "f1": "Prémisses",
    "f10": "Espace membres",
    "f4": "Zone invitée",
    "f12": "Adoption",
    "f13": "Inscription",
    "f15": "Gestion personnage",
    "f3": "Superbia",
    "f5": "Ira",
    "f6": "Gula",
    "f7": "Avaritia",
    "f8": "Luxuria",
    "f9": "Invidia",
    "f11": "Acedia",
    "f35": "Dimensions",
    "f20": "Passé et alternatif",
    "f31": "Réseaux sociaux",
    "f19": "Parler",
    "f41": "S'amuser",
    "f29": "Galerie d'arts",
    "f2": "Conserver"
  };

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
