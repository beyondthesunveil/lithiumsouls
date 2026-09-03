/* =========================================================
   LITHIUM SOULS — REGISTRE DE VEILLE
   ========================================================= */

(function () {
  "use strict";

  function initializeFavoriteTopics() {
    if (!window.jQuery) {
      return;
    }

    var panelNode = document.getElementById("fa-pins-panel");

    if (!panelNode) {
      return;
    }

    if (
      panelNode.getAttribute("data-fa-pins-ready") === "true"
    ) {
      return;
    }

    panelNode.setAttribute(
      "data-fa-pins-ready",
      "true"
    );

    var $ = window.jQuery;
    var STORAGE_KEY = "fa_favorite_topics";
    var REFRESH_DELAY = 15 * 60 * 1000;
    var DATA_VERSION = 2;

    var DEFAULT_AVATAR =
      "https://zupimages.net/up/26/20/z3y2.jpg";

    var currentCategory = "all";
    var draggedIndex = null;
    var refreshPromise = null;

    var categories = {
      rp: "RP",
      lore: "Lore",
      fiche: "Fiches personnages",
      intrigue: "Réseaux sociaux"
    };

    var POST_SELECTORS = [
      ".post",
      "article[id^='p']",
      ".postbody"
    ];

    var AUTHOR_SELECTORS = [
      ".litso-msg_postname",
      ".lithium-vb_postname",
      ".litso-viewtopic_name",
      "[class*='utppVB_pseudo']",
      ".postprofile-name",
      ".postprofile-name a",
      ".username"
    ];

    var AVATAR_SELECTORS = [
      ".litso-msg_posteravatar img",
      ".lithium-vb_posteravatar img",
      ".litso-msg_avatar img",
      ".litso-viewtopic_avatar img",
      "[class*='utppVB_avatar'] img",
      ".postprofile-avatar img",
      ".postprofile img"
    ];

    var TITLE_SELECTORS = [
      ".litso-msg_titlemap",
      ".lithium-vb_titlemap",
      ".litso-msg_title h1",
      ".pathname-box h1",
      "h1.page-title",
      ".topic-title",
      "h1"
    ];

    var BREADCRUMB_SELECTORS = [
      ".litso-msg_brdcrmbtrail",
      ".lithium-vb_brdcrmbtrail",
      ".litso-msg_breadcrumb",
      ".pathname-box",
      ".breadcrumbs",
      ".nav"
    ];


    /* =====================================================
       STOCKAGE
       ===================================================== */

    function getFavorites() {
      try {
        var saved = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(saved)
          ? saved
          : [];
      } catch (error) {
        return [];
      }
    }


    function saveFavorites(items) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(items)
        );
      } catch (error) {
        console.warn(
          "[Lithium Souls — Favoris] Enregistrement impossible.",
          error
        );
      }
    }


    /* =====================================================
       OUTILS
       ===================================================== */

    function cleanText(text) {
      return String(text || "")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }


    function escapeHTML(value) {
      return String(
        value == null ? "" : value
      )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }


    function collapseRepeatedText(text) {
      var cleaned = cleanText(text);
      var words = cleaned.split(" ");

      for (
        var size = 1;
        size <= words.length / 2;
        size += 1
      ) {
        if (words.length % size !== 0) {
          continue;
        }

        var first = words
          .slice(0, size)
          .join(" ");

        var identical = true;

        for (
          var index = size;
          index < words.length;
          index += size
        ) {
          if (
            words
              .slice(index, index + size)
              .join(" ") !== first
          ) {
            identical = false;
            break;
          }
        }

        if (identical) {
          return first;
        }
      }

      return cleaned;
    }


    function fixUrl(url, baseUrl) {
      if (!url) {
        return DEFAULT_AVATAR;
      }

      try {
        return new URL(
          url,
          baseUrl || location.href
        ).href;
      } catch (error) {
        return url;
      }
    }


    function canonicalTopicUrl(url) {
      try {
        var parsed = new URL(
          url,
          location.href
        );

        parsed.pathname =
          parsed.pathname.replace(
            /(\/t\d+)p\d+(?=-|$)/i,
            "$1"
          );

        parsed.searchParams.delete("start");
        parsed.searchParams.delete("view");
        parsed.hash = "";

        return parsed.href;
      } catch (error) {
        return url;
      }
    }


    function isBadAvatar(src) {
      var value = String(
        src || ""
      ).toLowerCase();

      return (
        !value ||
        value.includes("/smiles/") ||
        value.includes("/emoji/") ||
        value.includes("/icon_") ||
        value.includes("/sprite") ||
        value.includes("empty.gif") ||
        value.includes("spacer.gif") ||
        value.includes("pixel")
      );
    }


    function queryFirstText(
      root,
      selectors
    ) {
      for (
        var index = 0;
        index < selectors.length;
        index += 1
      ) {
        var element = root.querySelector(
          selectors[index]
        );

        var text = element
          ? cleanText(element.textContent)
          : "";

        if (text) {
          return text;
        }
      }

      return "";
    }


    function queryFirstAvatar(
      root,
      baseUrl
    ) {
      for (
        var index = 0;
        index < AVATAR_SELECTORS.length;
        index += 1
      ) {
        var image = root.querySelector(
          AVATAR_SELECTORS[index]
        );

        var src = image
          ? image.getAttribute("src") ||
            image.getAttribute("data-src")
          : "";

        if (
          src &&
          !isBadAvatar(src)
        ) {
          return fixUrl(src, baseUrl);
        }
      }

      var fallbackImages =
        root.querySelectorAll("img");

      for (
        var imageIndex = 0;
        imageIndex < fallbackImages.length;
        imageIndex += 1
      ) {
        var fallbackSrc =
          fallbackImages[
            imageIndex
          ].getAttribute("src") || "";

        if (!isBadAvatar(fallbackSrc)) {
          return fixUrl(
            fallbackSrc,
            baseUrl
          );
        }
      }

      return DEFAULT_AVATAR;
    }


    /* =====================================================
       EXTRACTION DES MESSAGES
       ===================================================== */

    function getPostElements(root) {
      for (
        var index = 0;
        index < POST_SELECTORS.length;
        index += 1
      ) {
        var candidates =
          Array.prototype.slice.call(
            root.querySelectorAll(
              POST_SELECTORS[index]
            )
          );

        var posts = candidates.filter(
          function (candidate) {
            return (
              queryFirstText(
                candidate,
                AUTHOR_SELECTORS
              ) ||
              AVATAR_SELECTORS.some(
                function (selector) {
                  return candidate.querySelector(
                    selector
                  );
                }
              )
            );
          }
        );

        if (posts.length) {
          return posts;
        }
      }

      return [];
    }


    function getForumName(root) {
      for (
        var index = 0;
        index < BREADCRUMB_SELECTORS.length;
        index += 1
      ) {
        var breadcrumb =
          root.querySelector(
            BREADCRUMB_SELECTORS[index]
          );

        if (!breadcrumb) {
          continue;
        }

        var links =
          Array.prototype.slice
            .call(
              breadcrumb.querySelectorAll(
                "a[href]"
              )
            )
            .filter(function (link) {
              var text = cleanText(
                link.textContent
              );

              var href =
                link.getAttribute("href") ||
                "";

              if (
                !text ||
                /mod[ée]rer\s+ce\s+forum/i.test(
                  text
                ) ||
                /(?:modcp|modcp\.php)/i.test(
                  href
                ) ||
                /(?:\/|^)(?:t\d+|viewtopic\.php)/i.test(
                  href
                )
              ) {
                return false;
              }

              return (
                /\/f\d+(?:-|$)/i.test(
                  href
                ) ||
                /[?&]f=\d+/i.test(
                  href
                )
              );
            });

        if (links.length) {
          return cleanText(
            links[
              links.length - 1
            ].textContent
          );
        }
      }

      return "Forum";
    }


    function extractTopicData(
      root,
      topicUrl
    ) {
      var posts = getPostElements(root);

      var firstPost = posts.length
        ? posts[0]
        : root;

      var lastPost = posts.length
        ? posts[posts.length - 1]
        : root;

      var title =
        collapseRepeatedText(
          queryFirstText(
            root,
            TITLE_SELECTORS
          ) ||
          String(root.title || "")
            .replace(/ ::.*$/, "")
        );

      var author =
        queryFirstText(
          firstPost,
          AUTHOR_SELECTORS
        ) || "Auteur inconnu";

      var lastReplyAuthor =
        queryFirstText(
          lastPost,
          AUTHOR_SELECTORS
        ) || author;

      var authorAvatar =
        queryFirstAvatar(
          firstPost,
          topicUrl
        );

      var lastReplyAvatar =
        queryFirstAvatar(
          lastPost,
          topicUrl
        );

      return {
        title:
          title || "Sujet sans titre",

        url:
          canonicalTopicUrl(
            topicUrl ||
            location.href
          ),

        author: author,
        authorAvatar: authorAvatar,

        lastReplyAvatar:
          lastReplyAvatar,

        avatar: authorAvatar,

        forum:
          getForumName(root),

        lastReply:
          "Dernière réponse par " +
          lastReplyAuthor,

        lastReplyAuthor:
          lastReplyAuthor
      };
    }


    /* =====================================================
       NORMALISATION DES FAVORIS
       ===================================================== */

    function normalizeFavorite(item) {
      var favorite = item || {};

      var authorAvatar = fixUrl(
        favorite.authorAvatar ||
        favorite.avatar
      );

      var lastReplyAvatar = fixUrl(
        favorite.lastReplyAvatar ||
        favorite.avatar ||
        authorAvatar
      );

      return {
        title:
          collapseRepeatedText(
            favorite.title ||
            "Sujet sans titre"
          ),

        url:
          canonicalTopicUrl(
            favorite.url || "#"
          ),

        author:
          favorite.author ||
          "Auteur inconnu",

        authorAvatar:
          authorAvatar,

        lastReplyAvatar:
          lastReplyAvatar,

        avatar:
          authorAvatar,

        forum:
          favorite.forum ||
          "Forum",

        lastReply:
          favorite.lastReply ||
          "Dernière réponse",

        lastReplyAuthor:
          favorite.lastReplyAuthor ||
          "",

        seenReplyAuthor:
          favorite.seenReplyAuthor ||
          favorite.lastReplyAuthor ||
          "",

        category:
          favorite.category ||
          "rp",

        createdAt:
          favorite.createdAt ||
          Date.now(),

        updatedAt:
          favorite.updatedAt ||
          favorite.createdAt ||
          Date.now(),

        checkedAt:
          favorite.checkedAt ||
          0,

        dataVersion:
          Number(
            favorite.dataVersion || 0
          )
      };
    }


    function getCurrentTopic() {
      var data =
        extractTopicData(
          document,
          location.href
        );

      return Object.assign(
        {},
        data,
        {
          category: "rp",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          checkedAt: 0,
          dataVersion: DATA_VERSION,
          seenReplyAuthor:
            data.lastReplyAuthor
        }
      );
    }


    function needsRepair(item) {
      return (
        Number(
          item.dataVersion || 0
        ) !== DATA_VERSION ||

        !item.author ||
        /^auteur inconnu$/i.test(
          item.author
        ) ||

        !item.forum ||
        /^forum$/i.test(
          item.forum
        ) ||

        !item.lastReplyAuthor ||
        /^dernière réponse$/i.test(
          item.lastReplyAuthor
        ) ||

        /dernière réponse par dernière réponse/i.test(
          item.lastReply
        ) ||

        !item.authorAvatar ||
        item.authorAvatar ===
          DEFAULT_AVATAR
      );
    }


    /* =====================================================
       RÉCUPÉRATION DES PAGES
       ===================================================== */

    function requestDocument(url) {
      return fetch(url, {
        credentials: "same-origin"
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error(
              "HTTP " +
              response.status
            );
          }

          return response
            .text()
            .then(function (html) {
              var parser =
                new DOMParser();

              return {
                url:
                  response.url ||
                  url,

                document:
                  parser.parseFromString(
                    html,
                    "text/html"
                  )
              };
            });
        });
    }


    function findLastPageUrl(
      topicDocument,
      baseUrl
    ) {
      var bestUrl = baseUrl;
      var bestOffset = 0;

      var links =
        topicDocument.querySelectorAll(
          "a[href]"
        );

      var baseTopicMatch =
        new URL(baseUrl)
          .pathname
          .match(/\/t(\d+)/i);

      var baseTopicId =
        baseTopicMatch
          ? baseTopicMatch[1]
          : "";

      Array.prototype.forEach.call(
        links,
        function (link) {
          var candidate;

          try {
            candidate = new URL(
              link.getAttribute("href"),
              baseUrl
            );
          } catch (error) {
            return;
          }

          if (
            candidate.origin !==
            location.origin
          ) {
            return;
          }

          var candidateTopicMatch =
            candidate.pathname.match(
              /\/t(\d+)/i
            );

          if (
            baseTopicId &&
            (
              !candidateTopicMatch ||
              candidateTopicMatch[1] !==
                baseTopicId
            )
          ) {
            return;
          }

          var pathMatch =
            candidate.pathname.match(
              /\/t\d+p(\d+)(?:-|$)/i
            );

          var queryOffset = Number(
            candidate.searchParams.get(
              "start"
            ) || 0
          );

          var offset = pathMatch
            ? Number(pathMatch[1])
            : queryOffset;

          if (offset > bestOffset) {
            bestOffset = offset;
            bestUrl = candidate.href;
          }
        }
      );

      return bestUrl;
    }


    function fetchTopicData(item) {
      var topicUrl;

      try {
        topicUrl = new URL(
          canonicalTopicUrl(
            item.url
          ),
          location.href
        );
      } catch (error) {
        return Promise.resolve(null);
      }

      if (
        topicUrl.origin !==
        location.origin
      ) {
        return Promise.resolve(null);
      }

      return requestDocument(
        topicUrl.href
      )
        .then(function (firstPage) {
          var firstData =
            extractTopicData(
              firstPage.document,
              topicUrl.href
            );

          var lastPageUrl =
            findLastPageUrl(
              firstPage.document,
              topicUrl.href
            );

          if (
            lastPageUrl ===
            topicUrl.href
          ) {
            return firstData;
          }

          return requestDocument(
            lastPageUrl
          ).then(function (lastPage) {
            var lastData =
              extractTopicData(
                lastPage.document,
                lastPage.url
              );

            firstData.lastReplyAuthor =
              lastData.lastReplyAuthor;

            firstData.lastReplyAvatar =
              lastData.lastReplyAvatar;

            firstData.lastReply =
              "Dernière réponse par " +
              lastData.lastReplyAuthor;

            return firstData;
          });
        })
        .catch(function (error) {
          console.warn(
            "[Lithium Souls — Favoris] Sujet non actualisé :",
            topicUrl.href,
            error
          );

          return null;
        });
    }


    function refreshFavorites(
      forceRepair
    ) {
      if (refreshPromise) {
        return refreshPromise;
      }

      var favorites =
        getFavorites().map(
          normalizeFavorite
        );

      var now = Date.now();
      var indexes = [];

      favorites.forEach(
        function (item, index) {
          var stale =
            now -
            item.checkedAt >=
            REFRESH_DELAY;

          if (
            (
              forceRepair &&
              needsRepair(item)
            ) ||
            stale
          ) {
            indexes.push(index);
          }
        }
      );

      if (!indexes.length) {
        return Promise.resolve(
          favorites
        );
      }

      var cursor = 0;

      function worker() {
        function next() {
          if (
            cursor >=
            indexes.length
          ) {
            return Promise.resolve();
          }

          var favoriteIndex =
            indexes[cursor];

          cursor += 1;

          return fetchTopicData(
            favorites[
              favoriteIndex
            ]
          )
            .then(
              function (freshData) {
                if (freshData) {
                  var previousSeen =
                    favorites[
                      favoriteIndex
                    ].seenReplyAuthor;

                  favorites[
                    favoriteIndex
                  ] = Object.assign(
                    {},
                    favorites[
                      favoriteIndex
                    ],
                    freshData,
                    {
                      seenReplyAuthor:
                        previousSeen,

                      checkedAt:
                        Date.now(),

                      updatedAt:
                        Date.now(),

                      dataVersion:
                        DATA_VERSION
                    }
                  );
                } else {
                  favorites[
                    favoriteIndex
                  ].checkedAt =
                    Date.now();
                }
              }
            )
            .then(next);
        }

        return next();
      }

      refreshPromise =
        Promise.all([
          worker(),
          worker(),
          worker()
        ])
          .then(function () {
            saveFavorites(
              favorites
            );

            renderFavorites();
            syncTopicButton();

            return favorites;
          })
          .finally(function () {
            refreshPromise = null;
          });

      return refreshPromise;
    }


    /* =====================================================
       COMPTEUR ET BOUTON DU SUJET
       ===================================================== */

    function updateCount() {
      var count =
        getFavorites().length;

      $("#fa-pins-count")
        .text(count || "")
        .attr(
          "aria-label",
          count === 1
            ? "1 sujet favori"
            : count +
              " sujets favoris"
        );
    }


    function syncTopicButton() {
      var button =
        $("#fa-topic-fav-button");

      if (!button.length) {
        return;
      }

      var currentUrl =
        location.origin +
        location.pathname;

      var exists =
        getFavorites().some(
          function (item) {
            try {
              var savedUrl =
                new URL(
                  item.url,
                  location.href
                );

              return (
                savedUrl.origin +
                savedUrl.pathname ===
                currentUrl
              );
            } catch (error) {
              return false;
            }
          }
        );

      var label = exists
        ? "Retirer des favoris"
        : "Ajouter aux favoris";

      button
        .toggleClass(
          "is-faved",
          exists
        )
        .attr({
          "aria-pressed":
            String(exists),

          "aria-label":
            label,

          title:
            label
        })
        .find("span")
        .text(label);

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }


    /* =====================================================
       BOUTON DE LA SIDEBAR
       ===================================================== */

    function preparePanelAccessibility() {
      var isOpen =
        $("#fa-pins-panel")
          .hasClass("open");

      $("#fa-pins-panel")
        .attr(
          "aria-hidden",
          String(!isOpen)
        );

      $("#fa-pins-button")
        .attr({
          "aria-controls":
            "fa-pins-panel",

          "aria-expanded":
            String(isOpen)
        });
    }


    function preserveSidebarButton() {
      var buttons =
        document.querySelectorAll(
          "#fa-pins-button"
        );

      Array.prototype.forEach.call(
        buttons,
        function (button, index) {
          button.classList.toggle(
            "fa-pins-duplicate",
            index > 0
          );

          button.setAttribute(
            "aria-hidden",
            index > 0
              ? "true"
              : "false"
          );

          if (index > 0) {
            button.setAttribute(
              "tabindex",
              "-1"
            );
          }
        }
      );

      return buttons.length
        ? buttons[0]
        : null;
    }


    function observeDuplicateButtons() {
      if (
        !(
          "MutationObserver" in
          window
        ) ||
        document.documentElement
          .getAttribute(
            "data-fa-pins-button-observer"
          ) === "true"
      ) {
        return;
      }

      document.documentElement
        .setAttribute(
          "data-fa-pins-button-observer",
          "true"
        );

      var frame = null;

      var observer =
        new MutationObserver(
          function (mutations) {
            var buttonWasAdded =
              mutations.some(
                function (mutation) {
                  return Array.prototype
                    .some.call(
                      mutation.addedNodes,
                      function (node) {
                        return (
                          node.nodeType ===
                            1 &&
                          (
                            node.id ===
                              "fa-pins-button" ||
                            (
                              node.querySelector &&
                              node.querySelector(
                                "#fa-pins-button"
                              )
                            )
                          )
                        );
                      }
                    );
                }
              );

            if (!buttonWasAdded) {
              return;
            }

            if (frame !== null) {
              cancelAnimationFrame(
                frame
              );
            }

            frame =
              requestAnimationFrame(
                function () {
                  preserveSidebarButton();
                  preparePanelAccessibility();
                  frame = null;
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


    /* =====================================================
       ONGLETS ET CATÉGORIES
       ===================================================== */

    function renderCategoryTabs() {
      var panel =
        document.getElementById(
          "fa-pins-panel"
        );

      if (!panel) {
        return;
      }

      var container =
        panel.querySelector(
          ".fa-pins-cats"
        );

      if (!container) {
        container =
          document.createElement(
            "div"
          );

        container.className =
          "fa-pins-cats";

        var list =
          panel.querySelector(
            "#fa-pinned-list"
          );

        if (list) {
          list.parentNode
            .insertBefore(
              container,
              list
            );
        } else {
          panel.appendChild(
            container
          );
        }
      }

      var tabs = [
        {
          value: "all",
          label: "Tous"
        }
      ];

      Object.keys(categories)
        .forEach(function (value) {
          tabs.push({
            value: value,
            label:
              categories[value]
          });
        });

      container.innerHTML =
        tabs
          .map(function (tab) {
            return (
              '<button type="button" data-cat="' +
              escapeHTML(
                tab.value
              ) +
              '"' +
              (
                tab.value ===
                currentCategory
                  ? ' class="active"'
                  : ""
              ) +
              ' aria-pressed="' +
              String(
                tab.value ===
                currentCategory
              ) +
              '">' +
              escapeHTML(
                tab.label
              ) +
              "</button>"
            );
          })
          .join("");
    }


    /* =====================================================
       OUVERTURE ET FERMETURE
       ===================================================== */

    function updatePanelState(
      isOpen
    ) {
      $("#fa-pins-panel")
        .toggleClass(
          "open",
          isOpen
        )
        .removeClass("active")
        .attr(
          "aria-hidden",
          String(!isOpen)
        );

      $("#fa-pins-button")
        .toggleClass(
          "is-active",
          isOpen
        )
        .removeClass(
          "open active"
        )
        .attr(
          "aria-expanded",
          String(isOpen)
        );
    }


    function closeCompetingPanels() {
      $("#KRSN-panel")
        .removeClass(
          "open active"
        )
        .attr(
          "aria-hidden",
          "true"
        );

      $("#KRSN-button")
        .removeClass(
          "open active is-active"
        )
        .attr(
          "aria-expanded",
          "false"
        );

      $("#notiffi_panel")
        .removeClass(
          "open active"
        )
        .attr(
          "aria-hidden",
          "true"
        );

      $("#notiffi_button")
        .removeClass(
          "open active is-active"
        )
        .attr(
          "aria-expanded",
          "false"
        );
    }


    function openPanel() {
      closeCompetingPanels();
      updatePanelState(true);

      refreshFavorites(false);
    }


    function closePanel() {
      updatePanelState(false);
    }


    function togglePanel() {
      if (
        $("#fa-pins-panel")
          .hasClass("open")
      ) {
        closePanel();
      } else {
        openPanel();
      }
    }


    /* =====================================================
       AJOUT ET SUPPRESSION D’UN FAVORI
       ===================================================== */

    function toggleCurrentTopicFavorite() {
      var topic =
        getCurrentTopic();

      var favorites =
        getFavorites().map(
          normalizeFavorite
        );

      var wasAdded = false;

      var existingIndex =
        favorites.findIndex(
          function (item) {
            try {
              return (
                new URL(
                  item.url,
                  location.href
                ).pathname ===
                new URL(
                  topic.url,
                  location.href
                ).pathname
              );
            } catch (error) {
              return (
                item.url ===
                topic.url
              );
            }
          }
        );

      if (existingIndex !== -1) {
        favorites.splice(
          existingIndex,
          1
        );
      } else {
        favorites.unshift(
          topic
        );

        wasAdded = true;
      }

      saveFavorites(favorites);
      renderFavorites();
      syncTopicButton();

      if (wasAdded) {
        openPanel();
        refreshFavorites(true);
      }
    }


    function markAsSeen(index) {
      var favorites =
        getFavorites().map(
          normalizeFavorite
        );

      if (!favorites[index]) {
        return;
      }

      favorites[
        index
      ].seenReplyAuthor =
        favorites[
          index
        ].lastReplyAuthor;

      saveFavorites(favorites);
      renderFavorites();
    }


    /* =====================================================
       AFFICHAGE DES FAVORIS
       ===================================================== */

    function renderFavorites() {
      var list =
        $("#fa-pinned-list");

      if (!list.length) {
        updateCount();
        return;
      }

      var favorites =
        getFavorites().map(
          normalizeFavorite
        );

      saveFavorites(favorites);
      renderCategoryTabs();

      var filtered =
        currentCategory === "all"
          ? favorites
          : favorites.filter(
              function (item) {
                return (
                  item.category ===
                  currentCategory
                );
              }
            );

      list.empty();

      if (!filtered.length) {
        list.append(
          '<li class="fa-pin-empty">' +
            "<span>" +
              "Aucun favori dans cette catégorie." +
            "</span>" +
          "</li>"
        );

        updateCount();
        return;
      }

      filtered.forEach(
        function (item) {
          var realIndex =
            favorites.findIndex(
              function (favorite) {
                return (
                  favorite.url ===
                  item.url
                );
              }
            );

          var isNew = Boolean(
            item.lastReplyAuthor &&
            item.seenReplyAuthor &&
            item.lastReplyAuthor !==
              item.seenReplyAuthor
          );

          var options =
            Object.keys(categories)
              .map(function (value) {
                return (
                  '<option value="' +
                  escapeHTML(value) +
                  '"' +
                  (
                    item.category ===
                    value
                      ? " selected"
                      : ""
                  ) +
                  ">" +
                  escapeHTML(
                    categories[value]
                  ) +
                  "</option>"
                );
              })
              .join("");

          list.append(
            '<li class="fa-pin-item' +
              (
                isNew
                  ? " is-new"
                  : ""
              ) +
              '"' +
              ' draggable="true"' +
              ' data-index="' +
              realIndex +
              '">' +

              '<div class="fa-pin-avatar-wrap">' +
                '<div class="fa-pin-avatar-inner">' +

                  '<div class="fa-pin-avatar-front">' +
                    '<img class="fa-pin-avatar"' +
                      ' src="' +
                      escapeHTML(
                        item.authorAvatar
                      ) +
                      '"' +
                      ' alt=""' +
                      ' title="Auteur : ' +
                      escapeHTML(
                        item.author
                      ) +
                      '">' +
                  "</div>" +

                  '<div class="fa-pin-avatar-back">' +
                    '<img class="fa-pin-avatar"' +
                      ' src="' +
                      escapeHTML(
                        item.lastReplyAvatar
                      ) +
                      '"' +
                      ' alt=""' +
                      ' title="Dernière réponse : ' +
                      escapeHTML(
                        item.lastReplyAuthor
                      ) +
                      '">' +
                  "</div>" +

                "</div>" +
              "</div>" +

              '<div class="fa-pin-content">' +

                '<a class="fa-pin-title"' +
                  ' href="' +
                  escapeHTML(
                    item.url
                  ) +
                  '"' +
                  ' data-index="' +
                  realIndex +
                  '">' +
                  escapeHTML(
                    item.title
                  ) +
                "</a>" +

                '<div class="fa-pin-meta">' +

                  '<span class="fa-pin-author">' +
                    "par " +
                    escapeHTML(
                      item.author
                    ) +
                  "</span>" +

                  '<span class="fa-pin-forum">' +
                    "#" +
                    escapeHTML(
                      item.forum
                    ) +
                  "</span>" +

                  '<span class="fa-pin-last">' +
                    "Dernière réponse par " +
                    escapeHTML(
                      item.lastReplyAuthor ||
                      item.author
                    ) +
                  "</span>" +

                  (
                    isNew
                      ? '<span class="fa-pin-new">Nouveau</span>'
                      : ""
                  ) +

                "</div>" +

                '<select class="fa-pin-cat-select"' +
                  ' data-index="' +
                  realIndex +
                  '">' +
                  options +
                "</select>" +

              "</div>" +

              '<button class="fa-remove-pin"' +
                ' type="button"' +
                ' data-index="' +
                realIndex +
                '"' +
                ' aria-label="Retirer ce sujet des favoris">' +
                "×" +
              "</button>" +

            "</li>"
          );
        }
      );

      updateCount();

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }


    /* =====================================================
       ÉVÉNEMENTS
       ===================================================== */

    preserveSidebarButton();
    observeDuplicateButtons();

    $(document)
      .off(
        "click.faPinsOpen",
        "#fa-pins-button"
      )
      .on(
        "click.faPinsOpen",
        "#fa-pins-button",
        function (event) {
          event.preventDefault();
          event.stopPropagation();

          togglePanel();
        }
      );


    $(panelNode)
      .off(
        "click.faPinsClose",
        "#fa-pins-close"
      )
      .on(
        "click.faPinsClose",
        "#fa-pins-close",
        function (event) {
          event.preventDefault();
          closePanel();
        }
      );


    $(panelNode)
      .off(
        "click.faPinsFavorite",
        "#fa-add-current-topic"
      )
      .on(
        "click.faPinsFavorite",
        "#fa-add-current-topic",
        function (event) {
          event.preventDefault();

          toggleCurrentTopicFavorite();
        }
      );


    $(document)
      .off(
        "click.faPinsTopicFavorite",
        "#fa-topic-fav-button"
      )
      .on(
        "click.faPinsTopicFavorite",
        "#fa-topic-fav-button",
        function (event) {
          event.preventDefault();
          event.stopPropagation();

          toggleCurrentTopicFavorite();
        }
      );


    /*
     * Un clic à l’intérieur du panneau ne doit
     * jamais provoquer sa fermeture.
     */
    $(panelNode)
      .off("click.faPinsContain")
      .on(
        "click.faPinsContain",
        function (event) {
          event.stopPropagation();
        }
      );


    /*
     * Seul un véritable clic à l’extérieur ferme
     * le panneau.
     */
    $(document)
      .off("click.faPinsOutside")
      .on(
        "click.faPinsOutside",
        function (event) {
          if (
            !$("#fa-pins-panel")
              .hasClass("open")
          ) {
            return;
          }

          if (
            $(event.target)
              .closest(
                "#fa-pins-panel, " +
                "#fa-pins-button, " +
                "#fa-topic-fav-button"
              )
              .length
          ) {
            return;
          }

          closePanel();
        }
      );


    $(document)
      .off("keydown.faPins")
      .on(
        "keydown.faPins",
        function (event) {
          if (
            event.key === "Escape" &&
            $("#fa-pins-panel")
              .hasClass("open")
          ) {
            closePanel();

            $("#fa-pins-button")
              .trigger("focus");
          }
        }
      );


    $(document)
      .off(
        "click.faPinsNotiffi",
        "#notiffi_button"
      )
      .on(
        "click.faPinsNotiffi",
        "#notiffi_button",
        closePanel
      );


    $(document)
      .off(
        "click.faPinsKRSN",
        "#KRSN-button"
      )
      .on(
        "click.faPinsKRSN",
        "#KRSN-button",
        closePanel
      );


    $(panelNode)
      .off(
        "click.faPinsCategories",
        ".fa-pins-cats button"
      )
      .on(
        "click.faPinsCategories",
        ".fa-pins-cats button",
        function () {
          $(".fa-pins-cats button")
            .removeClass("active")
            .attr(
              "aria-pressed",
              "false"
            );

          $(this)
            .addClass("active")
            .attr(
              "aria-pressed",
              "true"
            );

          currentCategory =
            $(this).data("cat") ||
            "all";

          renderFavorites();
        }
      );


    $(panelNode)
      .off(
        "change.faPinsCategory",
        ".fa-pin-cat-select"
      )
      .on(
        "change.faPinsCategory",
        ".fa-pin-cat-select",
        function () {
          var favorites =
            getFavorites().map(
              normalizeFavorite
            );

          var index = Number(
            $(this).data("index")
          );

          if (!favorites[index]) {
            return;
          }

          favorites[
            index
          ].category =
            $(this).val();

          saveFavorites(favorites);
          renderFavorites();
        }
      );


    $(panelNode)
      .off(
        "click.faPinsSeen",
        ".fa-pin-title"
      )
      .on(
        "click.faPinsSeen",
        ".fa-pin-title",
        function () {
          markAsSeen(
            Number(
              $(this).data("index")
            )
          );
        }
      );


    $(panelNode)
      .off(
        "click.faPinsRemove",
        ".fa-remove-pin"
      )
      .on(
        "click.faPinsRemove",
        ".fa-remove-pin",
        function (event) {
          event.preventDefault();

          var favorites =
            getFavorites().map(
              normalizeFavorite
            );

          var index = Number(
            $(this).data("index")
          );

          if (!favorites[index]) {
            return;
          }

          favorites.splice(index, 1);

          saveFavorites(favorites);
          renderFavorites();
          syncTopicButton();
        }
      );


    /* =====================================================
       GLISSER-DÉPOSER
       ===================================================== */

    $(panelNode)
      .off(
        "dragstart.faPins",
        ".fa-pin-item"
      )
      .on(
        "dragstart.faPins",
        ".fa-pin-item",
        function () {
          draggedIndex = Number(
            $(this).data("index")
          );

          $(this).addClass(
            "dragging"
          );
        }
      );


    $(panelNode)
      .off(
        "dragend.faPins",
        ".fa-pin-item"
      )
      .on(
        "dragend.faPins",
        ".fa-pin-item",
        function () {
          draggedIndex = null;

          $(".fa-pin-item")
            .removeClass(
              "dragging"
            );
        }
      );


    $(panelNode)
      .off(
        "dragover.faPins",
        ".fa-pin-item"
      )
      .on(
        "dragover.faPins",
        ".fa-pin-item",
        function (event) {
          event.preventDefault();
        }
      );


    $(panelNode)
      .off(
        "drop.faPins",
        ".fa-pin-item"
      )
      .on(
        "drop.faPins",
        ".fa-pin-item",
        function (event) {
          event.preventDefault();

          var droppedIndex =
            Number(
              $(this).data("index")
            );

          if (
            draggedIndex === null ||
            draggedIndex ===
              droppedIndex
          ) {
            return;
          }

          var favorites =
            getFavorites().map(
              normalizeFavorite
            );

          if (
            !favorites[
              draggedIndex
            ] ||
            !favorites[
              droppedIndex
            ]
          ) {
            return;
          }

          var moved =
            favorites.splice(
              draggedIndex,
              1
            )[0];

          favorites.splice(
            droppedIndex,
            0,
            moved
          );

          draggedIndex = null;

          saveFavorites(favorites);
          renderFavorites();
        }
      );


    /* =====================================================
       PREMIER AFFICHAGE
       ===================================================== */

    preparePanelAccessibility();
    renderCategoryTabs();
    renderFavorites();
    syncTopicButton();
    refreshFavorites(true);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }


  function startFavoriteTopics() {
    initializeFavoriteTopics();

    window.addEventListener(
      "load",
      initializeFavoriteTopics,
      { once: true }
    );
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      startFavoriteTopics,
      { once: true }
    );
  } else {
    startFavoriteTopics();
  }
})();
