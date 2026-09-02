(function () {
  "use strict";

  /* =========================================================
     SCRAPBOOK — SUJETS FAVORIS
     ========================================================= */

  var STORAGE_KEY = "fa_favorite_topics";
  var CACHE_DURATION = 15 * 60 * 1000;
  var DEFAULT_AVATAR =
    "https://zupimages.net/up/26/20/z3y2.jpg";

  var PANEL_SELECTOR = "#fa-pins-panel";
  var BUTTON_SELECTOR = "#fa-pins-button";
  var LIST_SELECTOR = "#fa-pinned-list";
  var COUNT_SELECTOR = "#fa-pins-count";
  var CLOSE_SELECTOR = "#fa-pins-close";
  var ADD_SELECTOR = "#fa-add-current-topic";
  var CATEGORIES_SELECTOR = ".fa-pins-cats";

  var UNKNOWN_AUTHOR = "Auteur inconnu";
  var UNKNOWN_FORUM = "Forum";
  var UNKNOWN_LAST_AUTHOR = "Dernière réponse";

  var selectors = {
    posts: [
      ".post",
      "article[id^='p']",
      ".postbody"
    ],

    authors: [
      ".lithium-vb_postname",
      ".litso-msg_postname",
      ".litso-viewtopic_name",
      "[class*='utppVB_pseudo']",
      ".postprofile-name",
      ".postprofile-name a",
      ".username"
    ],

    avatars: [
      ".lithium-vb_posteravatar img",
      ".litso-msg_avatar img",
      ".litso-viewtopic_avatar img",
      "[class*='utppVB_avatar'] img",
      ".postprofile-avatar img",
      ".postprofile img"
    ],

    topicTitles: [
      "h1.page-title",
      ".topic-title",
      ".lithium-vb_topictitle",
      ".litso-viewtopic_title",
      "[class*='utppVB_title']",
      "h1",
      "h2"
    ],

    breadcrumbs: [
      ".breadcrumbs",
      ".nav",
      ".pathname-box",
      ".topic-actions + .breadcrumbs",
      "[class*='breadcrumb']",
      "[class*='path']"
    ]
  };


  /* =========================================================
     OUTILS GÉNÉRAUX
     ========================================================= */

  function normalizeText(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }


  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function collapseRepeatedText(value) {
    var text = normalizeText(value);

    if (!text) {
      return "";
    }

    var words = text.split(" ");

    if (words.length < 2) {
      return text;
    }

    /*
     * Corrige notamment :
     * "bottins bottins bottins bottins"
     */
    var firstWord = words[0].toLowerCase();

    var allIdentical = words.every(function (word) {
      return word.toLowerCase() === firstWord;
    });

    if (allIdentical) {
      return words[0];
    }

    /*
     * Corrige également une phrase entière répétée
     * exactement deux, trois ou quatre fois.
     */
    var repetitionCount;

    for (
      repetitionCount = 2;
      repetitionCount <= 4;
      repetitionCount += 1
    ) {
      if (words.length % repetitionCount !== 0) {
        continue;
      }

      var segmentLength =
        words.length / repetitionCount;

      var firstSegment = words
        .slice(0, segmentLength)
        .join(" ");

      var repeated = true;
      var index;

      for (
        index = 1;
        index < repetitionCount;
        index += 1
      ) {
        var segment = words
          .slice(
            index * segmentLength,
            (index + 1) * segmentLength
          )
          .join(" ");

        if (
          segment.toLowerCase() !==
          firstSegment.toLowerCase()
        ) {
          repeated = false;
          break;
        }
      }

      if (repeated) {
        return firstSegment;
      }
    }

    return text;
  }


  function queryFirst(root, selectorList) {
    if (!root) {
      return null;
    }

    var index;

    for (
      index = 0;
      index < selectorList.length;
      index += 1
    ) {
      var result = root.querySelector(
        selectorList[index]
      );

      if (result) {
        return result;
      }
    }

    return null;
  }


  function queryAllUnique(root, selectorList) {
    if (!root) {
      return [];
    }

    var elements = [];

    selectorList.forEach(function (selector) {
      var matches = root.querySelectorAll(selector);

      Array.prototype.forEach.call(
        matches,
        function (element) {
          if (elements.indexOf(element) === -1) {
            elements.push(element);
          }
        }
      );
    });

    return elements;
  }


  function extractImageSource(image) {
    if (!image) {
      return "";
    }

    return (
      image.getAttribute("src") ||
      image.getAttribute("data-src") ||
      image.getAttribute("data-original") ||
      ""
    ).trim();
  }


  function isDefaultValue(value, defaults) {
    var normalized = normalizeText(value).toLowerCase();

    return defaults.some(function (defaultValue) {
      return (
        normalized ===
        normalizeText(defaultValue).toLowerCase()
      );
    });
  }


  function getTopicId(value) {
    var text = String(value || "");

    var match = text.match(
      /(?:\/|^)(?:t|viewtopic\.php\?t=)(\d+)/i
    );

    if (!match) {
      match = text.match(/[?&]t=(\d+)/i);
    }

    return match ? match[1] : "";
  }


  function canonicalTopicUrl(value) {
    var url;

    try {
      url = new URL(
        value || window.location.href,
        window.location.origin
      );
    } catch (error) {
      return String(value || "");
    }

    url.hash = "";

    [
      "start",
      "view",
      "watch",
      "unwatch",
      "mark",
      "postdays",
      "postorder"
    ].forEach(function (parameter) {
      url.searchParams.delete(parameter);
    });

    /*
     * Forumactif ajoute parfois la pagination dans
     * l’adresse sous la forme :
     * /t123p25-titre-du-sujet
     */
    url.pathname = url.pathname.replace(
      /(\/t\d+)p\d+(-|$)/i,
      "$1$2"
    );

    return url.href;
  }


  function isTopicPage() {
    return Boolean(
      getTopicId(window.location.href)
    );
  }


  function getStoredTopics() {
    var stored;

    try {
      stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
    } catch (error) {
      stored = [];
    }

    if (!Array.isArray(stored)) {
      stored = [];
    }

    return stored
      .map(normalizeStoredTopic)
      .filter(function (topic) {
        return topic.url && topic.title;
      });
  }


  function saveStoredTopics(topics) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(topics)
      );
    } catch (error) {
      /*
       * Le panneau reste utilisable pour la session,
       * même si le navigateur refuse localStorage.
       */
    }
  }


  function normalizeStoredTopic(topic, index) {
    var item =
      topic && typeof topic === "object"
        ? topic
        : {};

    var url = canonicalTopicUrl(
      item.url || item.href || ""
    );

    var title = collapseRepeatedText(
      item.title ||
      item.name ||
      "Sujet sans titre"
    );

    var author = normalizeText(
      item.author ||
      item.authorName ||
      item.poster ||
      UNKNOWN_AUTHOR
    );

    var lastAuthor = normalizeText(
      item.lastAuthor ||
      item.lastPoster ||
      item.lastReplyAuthor ||
      UNKNOWN_LAST_AUTHOR
    );

    var forum = normalizeText(
      item.forum ||
      item.forumName ||
      item.category ||
      UNKNOWN_FORUM
    );

    return {
      id:
        item.id ||
        getTopicId(url) ||
        String(Date.now()) + "-" + String(index || 0),

      url: url,
      title: title,
      author: author,
      authorAvatar:
        item.authorAvatar ||
        item.avatar ||
        DEFAULT_AVATAR,

      forum: forum,

      lastAuthor: lastAuthor,
      lastAvatar:
        item.lastAvatar ||
        item.lastPosterAvatar ||
        item.authorAvatar ||
        item.avatar ||
        DEFAULT_AVATAR,

      category:
        normalizeText(item.categoryName) ||
        normalizeText(item.pinCategory) ||
        normalizeText(item.type) ||
        "RP",

      checkedAt:
        Number(
          item.checkedAt ||
          item.updatedAt ||
          0
        ) || 0,

      addedAt:
        Number(item.addedAt || 0) ||
        Date.now(),

      isNew: Boolean(item.isNew)
    };
  }


  /* =========================================================
     EXTRACTION DES INFORMATIONS D’UN SUJET
     ========================================================= */

  function extractAuthor(post) {
    var element = queryFirst(
      post,
      selectors.authors
    );

    if (!element) {
      return "";
    }

    var link = element.matches("a")
      ? element
      : element.querySelector("a");

    return normalizeText(
      link
        ? link.textContent
        : element.textContent
    );
  }


  function extractAvatar(post) {
    var image = queryFirst(
      post,
      selectors.avatars
    );

    return extractImageSource(image);
  }


  function extractTitle(documentRoot) {
    var titleElement = queryFirst(
      documentRoot,
      selectors.topicTitles
    );

    var title = titleElement
      ? titleElement.textContent
      : documentRoot.title;

    title = normalizeText(title)
      .replace(/\s*-\s*[^-]+$/, "")
      .trim();

    return collapseRepeatedText(title);
  }


  function isUtilityBreadcrumbLink(link) {
    var text = normalizeText(
      link.textContent
    ).toLowerCase();

    var href =
      link.getAttribute("href") || "";

    return (
      !text ||
      text === "accueil" ||
      text === "index" ||
      text === "forum" ||
      text === "forums" ||
      text === "portail" ||
      /\/?(?:index|portal)\.php/i.test(href) ||
      href === "/" ||
      href === "#"
    );
  }


  function extractForum(documentRoot) {
    var breadcrumbContainers =
      queryAllUnique(
        documentRoot,
        selectors.breadcrumbs
      );

    var candidates = [];

    breadcrumbContainers.forEach(
      function (container) {
        var links = container.querySelectorAll(
          "a[href]"
        );

        Array.prototype.forEach.call(
          links,
          function (link) {
            var href =
              link.getAttribute("href") || "";

            var text = normalizeText(
              link.textContent
            );

            if (
              !text ||
              isUtilityBreadcrumbLink(link) ||
              getTopicId(href)
            ) {
              return;
            }

            /*
             * Les liens de sous-forums Forumactif
             * possèdent généralement /fXX-...
             */
            if (
              /\/f\d+(?:-|$)/i.test(href) ||
              /[?&]f=\d+/i.test(href)
            ) {
              candidates.push(text);
            }
          }
        );
      }
    );

    if (candidates.length) {
      return candidates[candidates.length - 1];
    }

    /*
     * Solution de secours pour les thèmes dont le
     * fil d’Ariane utilise une structure différente.
     */
    var forumLinks =
      documentRoot.querySelectorAll(
        "a[href*='/f'], a[href*='?f='], a[href*='&f=']"
      );

    Array.prototype.forEach.call(
      forumLinks,
      function (link) {
        var href =
          link.getAttribute("href") || "";

        if (
          /\/f\d+(?:-|$)/i.test(href) ||
          /[?&]f=\d+/i.test(href)
        ) {
          var text = normalizeText(
            link.textContent
          );

          if (text) {
            candidates.push(text);
          }
        }
      }
    );

    return candidates.length
      ? candidates[candidates.length - 1]
      : "";
  }


  function extractTopicData(documentRoot) {
    var posts = queryAllUnique(
      documentRoot,
      selectors.posts
    );

    /*
     * Évite de considérer plusieurs descendants du
     * même message comme plusieurs publications.
     */
    posts = posts.filter(function (post) {
      return !posts.some(function (otherPost) {
        return (
          otherPost !== post &&
          otherPost.contains(post)
        );
      });
    });

    var firstPost = posts.length
      ? posts[0]
      : documentRoot;

    var lastPost = posts.length
      ? posts[posts.length - 1]
      : documentRoot;

    var author = extractAuthor(firstPost);
    var authorAvatar =
      extractAvatar(firstPost);

    var lastAuthor =
      extractAuthor(lastPost);

    var lastAvatar =
      extractAvatar(lastPost);

    return {
      title: extractTitle(documentRoot),

      author:
        author || UNKNOWN_AUTHOR,

      authorAvatar:
        authorAvatar || DEFAULT_AVATAR,

      forum:
        extractForum(documentRoot) ||
        UNKNOWN_FORUM,

      lastAuthor:
        lastAuthor ||
        author ||
        UNKNOWN_LAST_AUTHOR,

      lastAvatar:
        lastAvatar ||
        authorAvatar ||
        DEFAULT_AVATAR
    };
  }


  /* =========================================================
     RÉCUPÉRATION DE LA PREMIÈRE ET DERNIÈRE PAGE
     ========================================================= */

  function parseHTML(content) {
    return new DOMParser().parseFromString(
      content,
      "text/html"
    );
  }


  function fetchDocument(url) {
    return fetch(url, {
      credentials: "same-origin",
      cache: "no-store"
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error(
            "Erreur HTTP " + response.status
          );
        }

        return response.text();
      })
      .then(parseHTML);
  }


  function paginationValue(url) {
    var match = String(url || "").match(
      /\/t\d+p(\d+)(?:-|$)/i
    );

    if (match) {
      return Number(match[1]) || 0;
    }

    try {
      var parsed = new URL(
        url,
        window.location.origin
      );

      return Number(
        parsed.searchParams.get("start")
      ) || 0;
    } catch (error) {
      return 0;
    }
  }


  function findLastPageUrl(
    documentRoot,
    baseUrl
  ) {
    var topicId = getTopicId(baseUrl);

    if (!topicId) {
      return baseUrl;
    }

    var links = documentRoot.querySelectorAll(
      "a[href]"
    );

    var lastUrl = baseUrl;
    var highestPage = 0;

    Array.prototype.forEach.call(
      links,
      function (link) {
        var href =
          link.getAttribute("href") || "";

        var absoluteUrl;

        try {
          absoluteUrl = new URL(
            href,
            baseUrl
          ).href;
        } catch (error) {
          return;
        }

        if (
          getTopicId(absoluteUrl) !== topicId
        ) {
          return;
        }

        var page =
          paginationValue(absoluteUrl);

        if (page > highestPage) {
          highestPage = page;
          lastUrl = absoluteUrl;
        }
      }
    );

    return lastUrl;
  }


  function fetchTopicData(url) {
    var canonicalUrl =
      canonicalTopicUrl(url);

    return fetchDocument(canonicalUrl)
      .then(function (firstDocument) {
        var firstPageData =
          extractTopicData(firstDocument);

        var lastPageUrl =
          findLastPageUrl(
            firstDocument,
            canonicalUrl
          );

        if (
          canonicalTopicUrl(lastPageUrl) ===
            canonicalUrl &&
          paginationValue(lastPageUrl) === 0
        ) {
          return firstPageData;
        }

        return fetchDocument(lastPageUrl)
          .then(function (lastDocument) {
            var lastPageData =
              extractTopicData(lastDocument);

            return {
              title:
                firstPageData.title,

              author:
                firstPageData.author,

              authorAvatar:
                firstPageData.authorAvatar,

              forum:
                firstPageData.forum,

              lastAuthor:
                lastPageData.lastAuthor,

              lastAvatar:
                lastPageData.lastAvatar
            };
          });
      });
  }


  function topicNeedsRepair(topic) {
    return (
      !topic ||
      !topic.author ||
      !topic.forum ||
      !topic.lastAuthor ||
      !topic.authorAvatar ||
      !topic.lastAvatar ||

      isDefaultValue(
        topic.author,
        [
          UNKNOWN_AUTHOR,
          "Inconnu",
          "Auteur"
        ]
      ) ||

      isDefaultValue(
        topic.forum,
        [
          UNKNOWN_FORUM,
          "#Forum",
          "Sous-forum"
        ]
      ) ||

      isDefaultValue(
        topic.lastAuthor,
        [
          UNKNOWN_LAST_AUTHOR,
          "Dernière réponse par Dernière réponse",
          "Inconnu"
        ]
      ) ||

      collapseRepeatedText(topic.title) !==
        normalizeText(topic.title)
    );
  }


  function topicCacheExpired(topic) {
    return (
      !topic.checkedAt ||
      Date.now() - topic.checkedAt >
        CACHE_DURATION
    );
  }


  function mergeTopicData(
    topic,
    extractedData
  ) {
    var previousLastAuthor =
      normalizeText(topic.lastAuthor);

    var nextLastAuthor =
      normalizeText(
        extractedData.lastAuthor
      );

    var hasNewResponse =
      previousLastAuthor &&
      nextLastAuthor &&
      !isDefaultValue(
        previousLastAuthor,
        [
          UNKNOWN_LAST_AUTHOR,
          UNKNOWN_AUTHOR
        ]
      ) &&
      previousLastAuthor !== nextLastAuthor;

    topic.title = collapseRepeatedText(
      extractedData.title ||
      topic.title
    );

    topic.author = normalizeText(
      extractedData.author ||
      topic.author ||
      UNKNOWN_AUTHOR
    );

    topic.authorAvatar =
      extractedData.authorAvatar ||
      topic.authorAvatar ||
      DEFAULT_AVATAR;

    topic.forum = normalizeText(
      extractedData.forum ||
      topic.forum ||
      UNKNOWN_FORUM
    );

    topic.lastAuthor = normalizeText(
      extractedData.lastAuthor ||
      topic.lastAuthor ||
      topic.author ||
      UNKNOWN_LAST_AUTHOR
    );

    topic.lastAvatar =
      extractedData.lastAvatar ||
      topic.lastAvatar ||
      topic.authorAvatar ||
      DEFAULT_AVATAR;

    topic.checkedAt = Date.now();
    topic.isNew =
      Boolean(topic.isNew) ||
      hasNewResponse;

    return topic;
  }


  /* =========================================================
     CRÉATION DU PANNEAU
     ========================================================= */

  function createPanel() {
    var existingPanel =
      document.querySelector(PANEL_SELECTOR);

    if (existingPanel) {
      return existingPanel;
    }

    var panel = document.createElement("aside");

    panel.id = "fa-pins-panel";
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute(
      "aria-label",
      "Sujets favoris"
    );

    panel.innerHTML =
      '<div class="fa-pins-head">' +
        '<span>' +
          '<i data-lucide="bookmark"></i>' +
          "Sujets favoris" +
        "</span>" +
        '<button id="fa-pins-close" type="button" aria-label="Fermer le panneau">×</button>' +
      "</div>" +

      '<button id="fa-add-current-topic" type="button">' +
        '<i data-lucide="bookmark-plus"></i>' +
        "<span>Ajouter le sujet actuel</span>" +
      "</button>" +

      '<div class="fa-pins-cats" aria-label="Filtrer les favoris"></div>' +

      '<ul id="fa-pinned-list"></ul>';

    document.body.appendChild(panel);

    return panel;
  }


  function createButton() {
    var existingButton =
      document.querySelector(BUTTON_SELECTOR);

    if (existingButton) {
      return existingButton;
    }

    var button = document.createElement("button");

    button.id = "fa-pins-button";
    button.type = "button";
    button.setAttribute(
      "aria-label",
      "Ouvrir les sujets favoris"
    );
    button.setAttribute(
      "aria-expanded",
      "false"
    );

    button.innerHTML =
      '<i data-lucide="bookmark"></i>' +
      '<span id="fa-pins-count"></span>';

    var navbarHome =
      document.querySelector(
        ".litso-nav_home"
      );

    var notiffiButton =
      document.getElementById(
        "notiffi_button"
      );

    if (notiffiButton) {
      notiffiButton.insertAdjacentElement(
        "afterend",
        button
      );
    } else if (navbarHome) {
      navbarHome.insertAdjacentElement(
        "afterend",
        button
      );
    } else {
      document.body.appendChild(button);
    }

    return button;
  }


  function refreshIcons() {
    if (
      window.lucide &&
      typeof window.lucide.createIcons ===
        "function"
    ) {
      window.lucide.createIcons();
    }
  }


  /* =========================================================
     OUVERTURE ET FERMETURE
     ========================================================= */

  function closeNotiffiPanel() {
    var notiffiPanel =
      document.getElementById(
        "notiffi_container"
      ) ||
      document.getElementById(
        "notiffi_panel"
      ) ||
      document.querySelector(
        ".notiffi-panel.open, .notiffi_container.open"
      );

    var notiffiButton =
      document.getElementById(
        "notiffi_button"
      );

    if (notiffiPanel) {
      notiffiPanel.classList.remove("open");
      notiffiPanel.classList.remove("active");
      notiffiPanel.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    if (notiffiButton) {
      notiffiButton.classList.remove("open");
      notiffiButton.classList.remove("active");
      notiffiButton.setAttribute(
        "aria-expanded",
        "false"
      );
    }
  }


  function closeKrsnPanel() {
    var krsnPanel =
      document.getElementById("KRSN-panel");

    var krsnButton =
      document.getElementById("KRSN-button");

    if (krsnPanel) {
      krsnPanel.classList.remove("open");
      krsnPanel.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    if (krsnButton) {
      krsnButton.classList.remove("open");
      krsnButton.setAttribute(
        "aria-expanded",
        "false"
      );
    }
  }


  function openPanel(panel, button) {
    closeNotiffiPanel();
    closeKrsnPanel();

    panel.classList.add("open");
    panel.setAttribute(
      "aria-hidden",
      "false"
    );

    button.classList.add("open");
    button.setAttribute(
      "aria-expanded",
      "true"
    );
  }


  function closePanel(panel, button) {
    panel.classList.remove("open");
    panel.setAttribute(
      "aria-hidden",
      "true"
    );

    button.classList.remove("open");
    button.setAttribute(
      "aria-expanded",
      "false"
    );
  }


  function togglePanel(panel, button) {
    if (panel.classList.contains("open")) {
      closePanel(panel, button);
    } else {
      openPanel(panel, button);
    }
  }


  /* =========================================================
     AFFICHAGE DES FAVORIS
     ========================================================= */

  function getCategories(topics) {
    var categories = ["Tous"];

    topics.forEach(function (topic) {
      var category =
        normalizeText(topic.category) || "RP";

      if (categories.indexOf(category) === -1) {
        categories.push(category);
      }
    });

    return categories;
  }


  function renderCategories(
    panel,
    topics,
    activeCategory
  ) {
    var container = panel.querySelector(
      CATEGORIES_SELECTOR
    );

    if (!container) {
      return;
    }

    var categories =
      getCategories(topics);

    container.innerHTML = "";

    categories.forEach(function (category) {
      var button =
        document.createElement("button");

      button.type = "button";
      button.textContent = category;
      button.setAttribute(
        "data-fa-pin-category",
        category
      );

      if (category === activeCategory) {
        button.classList.add("active");
      }

      container.appendChild(button);
    });
  }


  function createAvatarMarkup(topic) {
    var authorAvatar =
      topic.authorAvatar || DEFAULT_AVATAR;

    var lastAvatar =
      topic.lastAvatar ||
      authorAvatar ||
      DEFAULT_AVATAR;

    return (
      '<div class="fa-pin-avatar-wrap">' +
        '<div class="fa-pin-avatar-inner">' +

          '<div class="fa-pin-avatar-front">' +
            '<img class="fa-pin-avatar" src="' +
              escapeHTML(authorAvatar) +
              '" alt="Avatar de ' +
              escapeHTML(topic.author) +
              '">' +
          "</div>" +

          '<div class="fa-pin-avatar-back">' +
            '<img class="fa-pin-avatar" src="' +
              escapeHTML(lastAvatar) +
              '" alt="Avatar de ' +
              escapeHTML(topic.lastAuthor) +
              '">' +
          "</div>" +

        "</div>" +
      "</div>"
    );
  }


  function createTopicMarkup(topic) {
    var newBadge = topic.isNew
      ? '<span class="fa-pin-new">Nouveau</span>'
      : "";

    return (
      createAvatarMarkup(topic) +

      '<div class="fa-pin-content">' +

        '<a class="fa-pin-title" href="' +
          escapeHTML(topic.url) +
          '">' +
          escapeHTML(
            collapseRepeatedText(topic.title)
          ) +
        "</a>" +

        '<div class="fa-pin-meta">' +

          '<span class="fa-pin-author">' +
            "par " +
            escapeHTML(
              topic.author || UNKNOWN_AUTHOR
            ) +
          "</span>" +

          '<span class="fa-pin-forum">' +
            "#" +
            escapeHTML(
              topic.forum || UNKNOWN_FORUM
            ) +
          "</span>" +

          '<span class="fa-pin-last">' +
            "Dernière réponse par " +
            escapeHTML(
              topic.lastAuthor ||
              UNKNOWN_LAST_AUTHOR
            ) +
          "</span>" +

          newBadge +

        "</div>" +

        '<select class="fa-pin-cat-select" aria-label="Catégorie du favori">' +
          '<option value="RP"' +
            (topic.category === "RP"
              ? " selected"
              : "") +
          ">RP</option>" +

          '<option value="Administration"' +
            (topic.category === "Administration"
              ? " selected"
              : "") +
          ">Administration</option>" +

          '<option value="Recherches"' +
            (topic.category === "Recherches"
              ? " selected"
              : "") +
          ">Recherches</option>" +

          '<option value="Archives"' +
            (topic.category === "Archives"
              ? " selected"
              : "") +
          ">Archives</option>" +
        "</select>" +

      "</div>" +

      '<button class="fa-remove-pin" type="button" aria-label="Retirer ce sujet">×</button>'
    );
  }


  function renderTopics(
    panel,
    topics,
    activeCategory
  ) {
    var list = panel.querySelector(
      LIST_SELECTOR
    );

    var count = document.querySelector(
      COUNT_SELECTOR
    );

    if (count) {
      count.textContent = topics.length
        ? String(topics.length)
        : "";
    }

    renderCategories(
      panel,
      topics,
      activeCategory
    );

    if (!list) {
      return;
    }

    list.innerHTML = "";

    var visibleTopics =
      activeCategory === "Tous"
        ? topics
        : topics.filter(function (topic) {
            return (
              topic.category === activeCategory
            );
          });

    if (!visibleTopics.length) {
      var emptyItem =
        document.createElement("li");

      emptyItem.className = "fa-pins-empty";

      emptyItem.textContent =
        topics.length
          ? "Aucun favori dans cette catégorie."
          : "Aucun sujet favori pour le moment.";

      list.appendChild(emptyItem);
      return;
    }

    visibleTopics.forEach(function (topic) {
      var item = document.createElement("li");

      item.className = "fa-pin-item";
      item.draggable = true;
      item.setAttribute(
        "data-fa-pin-id",
        topic.id
      );

      if (topic.isNew) {
        item.classList.add("is-new");
      }

      item.innerHTML =
        createTopicMarkup(topic);

      list.appendChild(item);
    });
  }


  /* =========================================================
     AJOUT DU SUJET ACTUEL
     ========================================================= */

  function createCurrentTopic() {
    var extracted =
      extractTopicData(document);

    return {
      id:
        getTopicId(window.location.href) ||
        String(Date.now()),

      url:
        canonicalTopicUrl(
          window.location.href
        ),

      title:
        extracted.title ||
        collapseRepeatedText(
          document.title
        ) ||
        "Sujet sans titre",

      author:
        extracted.author,

      authorAvatar:
        extracted.authorAvatar,

      forum:
        extracted.forum,

      lastAuthor:
        extracted.lastAuthor,

      lastAvatar:
        extracted.lastAvatar,

      category: "RP",
      checkedAt: 0,
      addedAt: Date.now(),
      isNew: false
    };
  }


  function addCurrentTopic(
    panel,
    activeCategory
  ) {
    if (!isTopicPage()) {
      return;
    }

    var topics = getStoredTopics();
    var currentTopic =
      createCurrentTopic();

    var existingIndex =
      topics.findIndex(function (topic) {
        return (
          topic.id === currentTopic.id ||
          canonicalTopicUrl(topic.url) ===
            currentTopic.url
        );
      });

    if (existingIndex !== -1) {
      topics[existingIndex] =
        Object.assign(
          {},
          topics[existingIndex],
          currentTopic,
          {
            addedAt:
              topics[existingIndex].addedAt ||
              Date.now()
          }
        );
    } else {
      topics.unshift(currentTopic);
    }

    saveStoredTopics(topics);

    renderTopics(
      panel,
      topics,
      activeCategory
    );

    refreshTopicMetadata(
      panel,
      activeCategory,
      true
    );
  }


  /* =========================================================
     ACTUALISATION DES MÉTADONNÉES
     ========================================================= */

  function refreshTopicMetadata(
    panel,
    activeCategory,
    force
  ) {
    var topics = getStoredTopics();

    var indexesToRefresh = [];

    topics.forEach(function (topic, index) {
      if (
        force ||
        topicNeedsRepair(topic) ||
        topicCacheExpired(topic)
      ) {
        indexesToRefresh.push(index);
      }
    });

    if (!indexesToRefresh.length) {
      renderTopics(
        panel,
        topics,
        activeCategory
      );

      return Promise.resolve(topics);
    }

    var nextIndex = 0;
    var workerCount = Math.min(
      3,
      indexesToRefresh.length
    );

    function worker() {
      if (nextIndex >= indexesToRefresh.length) {
        return Promise.resolve();
      }

      var topicIndex =
        indexesToRefresh[nextIndex];

      nextIndex += 1;

      var topic = topics[topicIndex];

      return fetchTopicData(topic.url)
        .then(function (data) {
          topics[topicIndex] =
            mergeTopicData(
              topic,
              data
            );

          saveStoredTopics(topics);

          renderTopics(
            panel,
            topics,
            activeCategory
          );
        })
        .catch(function () {
          /*
           * On conserve le favori même si Forumactif
           * refuse temporairement la requête.
           */
          topic.checkedAt = Date.now();
          topics[topicIndex] = topic;
          saveStoredTopics(topics);
        })
        .then(worker);
    }

    var workers = [];

    while (workers.length < workerCount) {
      workers.push(worker());
    }

    return Promise.all(workers)
      .then(function () {
        saveStoredTopics(topics);

        renderTopics(
          panel,
          topics,
          activeCategory
        );

        return topics;
      });
  }


  /* =========================================================
     SUPPRESSION ET CATÉGORIES
     ========================================================= */

  function removeTopic(topicId) {
    var topics = getStoredTopics()
      .filter(function (topic) {
        return topic.id !== topicId;
      });

    saveStoredTopics(topics);

    return topics;
  }


  function updateTopicCategory(
    topicId,
    category
  ) {
    var topics = getStoredTopics();

    topics.forEach(function (topic) {
      if (topic.id === topicId) {
        topic.category =
          normalizeText(category) || "RP";
      }
    });

    saveStoredTopics(topics);

    return topics;
  }


  function markTopicAsRead(topicId) {
    var topics = getStoredTopics();

    topics.forEach(function (topic) {
      if (topic.id === topicId) {
        topic.isNew = false;
      }
    });

    saveStoredTopics(topics);
  }


  /* =========================================================
     GLISSER-DÉPOSER
     ========================================================= */

  function initializeDragAndDrop(
    panel,
    getActiveCategory
  ) {
    var draggedItem = null;

    panel.addEventListener(
      "dragstart",
      function (event) {
        var item = event.target.closest(
          ".fa-pin-item"
        );

        if (!item) {
          return;
        }

        draggedItem = item;
        item.classList.add("dragging");

        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed =
            "move";

          event.dataTransfer.setData(
            "text/plain",
            item.getAttribute(
              "data-fa-pin-id"
            )
          );
        }
      }
    );


    panel.addEventListener(
      "dragend",
      function () {
        if (draggedItem) {
          draggedItem.classList.remove(
            "dragging"
          );
        }

        draggedItem = null;
      }
    );


    panel.addEventListener(
      "dragover",
      function (event) {
        if (!draggedItem) {
          return;
        }

        var target = event.target.closest(
          ".fa-pin-item"
        );

        if (
          !target ||
          target === draggedItem
        ) {
          return;
        }

        event.preventDefault();

        var rectangle =
          target.getBoundingClientRect();

        var insertAfter =
          event.clientY >
          rectangle.top +
            rectangle.height / 2;

        target.parentElement.insertBefore(
          draggedItem,
          insertAfter
            ? target.nextSibling
            : target
        );
      }
    );


    panel.addEventListener(
      "drop",
      function (event) {
        if (!draggedItem) {
          return;
        }

        event.preventDefault();

        var visibleIds =
          Array.prototype.map.call(
            panel.querySelectorAll(
              ".fa-pin-item"
            ),
            function (item) {
              return item.getAttribute(
                "data-fa-pin-id"
              );
            }
          );

        var topics = getStoredTopics();

        var activeCategory =
          getActiveCategory();

        var reordered = [];
        var visibleIndex = 0;

        topics.forEach(function (topic) {
          var isVisible =
            activeCategory === "Tous" ||
            topic.category ===
              activeCategory;

          if (!isVisible) {
            reordered.push(topic);
            return;
          }

          var nextId =
            visibleIds[visibleIndex];

          visibleIndex += 1;

          var matchingTopic =
            topics.find(function (candidate) {
              return candidate.id === nextId;
            });

          if (matchingTopic) {
            reordered.push(matchingTopic);
          }
        });

        saveStoredTopics(reordered);

        renderTopics(
          panel,
          reordered,
          activeCategory
        );
      }
    );
  }


  /* =========================================================
     ÉVÉNEMENTS DU PANNEAU
     ========================================================= */

  function initializePanelEvents(
    panel,
    button
  ) {
    var activeCategory = "Tous";

    function getActiveCategory() {
      return activeCategory;
    }

    button.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        event.stopPropagation();

        togglePanel(panel, button);

        if (
          panel.classList.contains("open")
        ) {
          refreshTopicMetadata(
            panel,
            activeCategory,
            false
          );
        }
      }
    );


    var closeButton =
      panel.querySelector(CLOSE_SELECTOR);

    if (closeButton) {
      closeButton.addEventListener(
        "click",
        function () {
          closePanel(panel, button);
          button.focus();
        }
      );
    }


    var addButton =
      panel.querySelector(ADD_SELECTOR);

    if (addButton) {
      if (!isTopicPage()) {
        addButton.hidden = true;
      }

      addButton.addEventListener(
        "click",
        function () {
          addCurrentTopic(
            panel,
            activeCategory
          );
        }
      );
    }


    panel.addEventListener(
      "click",
      function (event) {
        var categoryButton =
          event.target.closest(
            "[data-fa-pin-category]"
          );

        if (categoryButton) {
          activeCategory =
            categoryButton.getAttribute(
              "data-fa-pin-category"
            ) || "Tous";

          renderTopics(
            panel,
            getStoredTopics(),
            activeCategory
          );

          return;
        }

        var removeButton =
          event.target.closest(
            ".fa-remove-pin"
          );

        if (removeButton) {
          var removeItem =
            removeButton.closest(
              ".fa-pin-item"
            );

          if (!removeItem) {
            return;
          }

          var removeId =
            removeItem.getAttribute(
              "data-fa-pin-id"
            );

          var updatedTopics =
            removeTopic(removeId);

          renderTopics(
            panel,
            updatedTopics,
            activeCategory
          );

          return;
        }

        var topicLink =
          event.target.closest(
            ".fa-pin-title"
          );

        if (topicLink) {
          var topicItem =
            topicLink.closest(
              ".fa-pin-item"
            );

          if (topicItem) {
            markTopicAsRead(
              topicItem.getAttribute(
                "data-fa-pin-id"
              )
            );
          }
        }
      }
    );


    panel.addEventListener(
      "change",
      function (event) {
        if (
          !event.target.matches(
            ".fa-pin-cat-select"
          )
        ) {
          return;
        }

        var item = event.target.closest(
          ".fa-pin-item"
        );

        if (!item) {
          return;
        }

        var topicId =
          item.getAttribute(
            "data-fa-pin-id"
          );

        var topics =
          updateTopicCategory(
            topicId,
            event.target.value
          );

        renderTopics(
          panel,
          topics,
          activeCategory
        );
      }
    );


    document.addEventListener(
      "click",
      function (event) {
        if (
          !panel.classList.contains("open")
        ) {
          return;
        }

        if (
          panel.contains(event.target) ||
          button.contains(event.target)
        ) {
          return;
        }

        closePanel(panel, button);
      }
    );


    document.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key !== "Escape" ||
          !panel.classList.contains("open")
        ) {
          return;
        }

        closePanel(panel, button);
        button.focus();
      }
    );


    /*
     * Si Notiffi est ouvert, le panneau de favoris
     * se referme automatiquement.
     */
    var notiffiButton =
      document.getElementById(
        "notiffi_button"
      );

    if (notiffiButton) {
      notiffiButton.addEventListener(
        "click",
        function () {
          if (
            panel.classList.contains("open")
          ) {
            closePanel(panel, button);
          }
        }
      );
    }


    var krsnButton =
      document.getElementById(
        "KRSN-button"
      );

    if (krsnButton) {
      krsnButton.addEventListener(
        "click",
        function () {
          if (
            panel.classList.contains("open")
          ) {
            closePanel(panel, button);
          }
        }
      );
    }


    initializeDragAndDrop(
      panel,
      getActiveCategory
    );

    renderTopics(
      panel,
      getStoredTopics(),
      activeCategory
    );

    refreshTopicMetadata(
      panel,
      activeCategory,
      false
    );
  }


  /* =========================================================
     PLACEMENT DU BOUTON DANS LA NAVBAR
     ========================================================= */

  function placeFavoriteButton(button) {
    var homeButton =
      document.querySelector(
        ".litso-nav_home"
      );

    var notiffiButton =
      document.getElementById(
        "notiffi_button"
      );

    if (notiffiButton) {
      if (
        notiffiButton.nextElementSibling !==
          button
      ) {
        notiffiButton.insertAdjacentElement(
          "afterend",
          button
        );
      }

      return true;
    }

    if (homeButton) {
      if (
        homeButton.nextElementSibling !==
          button
      ) {
        homeButton.insertAdjacentElement(
          "afterend",
          button
        );
      }

      return true;
    }

    return false;
  }


  function observeNavbar(button) {
    if (
      !("MutationObserver" in window) ||
      document.documentElement.getAttribute(
        "data-fa-pins-navbar-observer"
      ) === "true"
    ) {
      return;
    }

    document.documentElement.setAttribute(
      "data-fa-pins-navbar-observer",
      "true"
    );

    var scheduledFrame = null;

    var observer = new MutationObserver(
      function (mutations) {
        var shouldCheck = false;

        mutations.forEach(function (mutation) {
          Array.prototype.forEach.call(
            mutation.addedNodes,
            function (node) {
              if (
                shouldCheck ||
                node.nodeType !== 1
              ) {
                return;
              }

              if (
                node.id === "notiffi_button" ||
                node.matches &&
                  node.matches(
                    "[data-litso-nav]"
                  ) ||
                node.querySelector &&
                  node.querySelector(
                    "#notiffi_button, [data-litso-nav]"
                  )
              ) {
                shouldCheck = true;
              }
            }
          );
        });

        if (!shouldCheck) {
          return;
        }

        if (scheduledFrame !== null) {
          cancelAnimationFrame(
            scheduledFrame
          );
        }

        scheduledFrame =
          requestAnimationFrame(
            function () {
              placeFavoriteButton(button);
              scheduledFrame = null;
            }
          );
      }
    );

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );
  }


  /* =========================================================
     INITIALISATION
     ========================================================= */

  function initializeFavoriteTopics() {
    var existingPanel =
      document.querySelector(
        PANEL_SELECTOR
      );

    if (
      existingPanel &&
      existingPanel.getAttribute(
        "data-fa-pins-ready"
      ) === "true"
    ) {
      return;
    }

    var panel = createPanel();
    var button = createButton();

    if (!panel || !button) {
      return;
    }

    panel.setAttribute(
      "data-fa-pins-ready",
      "true"
    );

    placeFavoriteButton(button);
    observeNavbar(button);

    initializePanelEvents(
      panel,
      button
    );

    refreshIcons();
  }


  function startFavoriteTopics() {
    initializeFavoriteTopics();

    window.addEventListener(
      "load",
      initializeFavoriteTopics,
      { once: true }
    );
  }


  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startFavoriteTopics,
      { once: true }
    );
  } else {
    startFavoriteTopics();
  }

})();
