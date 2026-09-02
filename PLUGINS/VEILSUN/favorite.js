/* =========================================================
   LITHIUM SOULS — REGISTRE DE VEILLE
   ========================================================= */

(function () {
  "use strict";


  function initializeFavoriteTopics() {
    const STORAGE_KEY = "fa_favorite_topics";

    const DEFAULT_AVATAR =
      "https://zupimages.net/up/26/20/z3y2.jpg";

    let currentCategory = "all";
    let draggedIndex = null;

    const categories = {
      rp: "RP",
      lore: "Lore",
      fiche: "Fiches personnages",
      intrigue: "Réseaux sociaux"
    };


    /* =====================================================
       OUTILS GÉNÉRAUX
       ===================================================== */

    function syncSidebarPush() {
      if (
        typeof window.KRSN_syncPanelsSidebar ===
        "function"
      ) {
        window.KRSN_syncPanelsSidebar();
      }
    }


    function getFavorites() {
      try {
        const savedFavorites = JSON.parse(
          localStorage.getItem(STORAGE_KEY) ||
          "[]"
        );

        return Array.isArray(savedFavorites)
          ? savedFavorites
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
          "[Lithium Souls — Favoris]",
          "Impossible d’enregistrer les favoris.",
          error
        );
      }
    }


    function cleanText(text) {
      return String(text || "")
        .replace(/\s+/g, " ")
        .trim();
    }


    function fixUrl(url) {
      if (!url) {
        return DEFAULT_AVATAR;
      }

      if (url.startsWith("//")) {
        return location.protocol + url;
      }

      if (url.startsWith("/")) {
        return location.origin + url;
      }

      return url;
    }


    function isBadAvatar(src) {
      return (
        !src ||
        src.includes("/smiles/") ||
        src.includes("/emoji/") ||
        src.includes("/icon_") ||
        src.includes("/sprite") ||
        src.includes("empty.gif") ||
        src.includes("spacer.gif") ||
        src.includes("pixel")
      );
    }


    /* =====================================================
       RÉCUPÉRATION DU SUJET ACTUEL
       ===================================================== */

    function getTopicPosts() {
      return $(".post").filter(function () {
        return $(this)
          .find(
            ".lithium-vb_posteravatar, " +
            ".lithium-vb_postname"
          )
          .length;
      });
    }


    function findAvatar(post) {
      let avatar =
        post
          .find(".lithium-vb_posteravatar img")
          .first()
          .attr("src") ||

        post
          .find(".ls-pfb_avatar img")
          .first()
          .attr("src") ||

        post
          .find("#ls-avalastmember img")
          .first()
          .attr("src");

      if (
        avatar &&
        !isBadAvatar(avatar)
      ) {
        return fixUrl(avatar);
      }

      avatar = post
        .find("img")
        .filter(function () {
          const src =
            $(this).attr("src") || "";

          return !isBadAvatar(src);
        })
        .first()
        .attr("src");

      return fixUrl(
        avatar || DEFAULT_AVATAR
      );
    }


    function getPostAuthor(post) {
      return (
        cleanText(
          post
            .find(".lithium-vb_postname")
            .first()
            .text()
        ) ||

        cleanText(
          post
            .find(".postprofile-name a")
            .first()
            .text()
        ) ||

        cleanText(
          post
            .find(".username")
            .first()
            .text()
        ) ||

        "Auteur inconnu"
      );
    }


    function getTopicTitle() {
      return (
        cleanText(
          $(".lithium-vb_titlemap")
            .first()
            .text()
        ) ||

        cleanText(
          $(
            ".pathname-box h1, " +
            "h1.page-title, " +
            "h1, " +
            ".topic-title"
          )
            .first()
            .text()
        ) ||

        cleanText(
          document.title.replace(
            / ::.*$/,
            ""
          )
        ) ||

        "Sujet sans titre"
      );
    }


    function getTopicForum() {
      return (
        cleanText(
          $(".lithium-vb_brdcrmbtrail a")
            .not(":first")
            .last()
            .text()
        ) ||

        cleanText(
          $(
            ".pathname-box a, " +
            ".breadcrumbs a, " +
            ".nav a"
          )
            .not(":first")
            .last()
            .text()
        ) ||

        "Forum"
      );
    }


    function getCurrentTopic() {
      const posts = getTopicPosts();

      const firstPost = posts.first();
      const lastPost = posts.last();

      const title = getTopicTitle();

      const url =
        location.origin +
        location.pathname;

      const forum = getTopicForum();

      const author = firstPost.length
        ? getPostAuthor(firstPost)
        : "Auteur inconnu";

      const authorAvatar = firstPost.length
        ? findAvatar(firstPost)
        : DEFAULT_AVATAR;

      const lastReplyAuthor = lastPost.length
        ? getPostAuthor(lastPost)
        : "Dernière réponse";

      const lastReplyAvatar = lastPost.length
        ? findAvatar(lastPost)
        : DEFAULT_AVATAR;

      return {
        title: title,
        url: url,
        author: author,
        authorAvatar: authorAvatar,
        avatar: lastReplyAvatar,
        forum: forum,
        lastReply:
          "Dernière réponse par " +
          lastReplyAuthor,
        lastReplyAuthor: lastReplyAuthor,
        category: "rp",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        seenReplyAuthor: lastReplyAuthor
      };
    }


    function normalizeFavorite(item) {
      return {
        title:
          item.title ||
          "Sujet sans titre",

        url:
          item.url ||
          "#",

        author:
          item.author ||
          "Auteur inconnu",

        authorAvatar:
          fixUrl(
            item.authorAvatar ||
            item.avatar
          ),

        avatar:
          fixUrl(item.avatar),

        forum:
          item.forum ||
          "Forum",

        lastReply:
          item.lastReply ||
          "Dernière réponse",

        lastReplyAuthor:
          item.lastReplyAuthor ||
          "",

        seenReplyAuthor:
          item.seenReplyAuthor ||
          item.lastReplyAuthor ||
          "",

        category:
          item.category ||
          "rp",

        createdAt:
          item.createdAt ||
          Date.now(),

        updatedAt:
          item.updatedAt ||
          item.createdAt ||
          Date.now()
      };
    }


    /* =====================================================
       COMPTEUR ET BOUTON DU SUJET
       ===================================================== */

    function updateCount() {
      const count = getFavorites().length;

      $("#fa-pins-count")
        .text(count || "")
        .attr(
          "aria-label",
          count === 1
            ? "1 sujet favori"
            : count + " sujets favoris"
        );
    }


    function syncTopicButton() {
      const button =
        $("#fa-topic-fav-button");

      if (!button.length) {
        return;
      }

      const currentUrl =
        location.origin +
        location.pathname;

      const exists = getFavorites().some(
        function (item) {
          return item.url === currentUrl;
        }
      );

      const label = exists
        ? "Retirer des favoris"
        : "Ajouter aux favoris";

      button
        .toggleClass(
          "is-faved",
          exists
        )
        .attr({
          "aria-pressed": String(exists),
          "aria-label": label,
          "title": label
        });

      button
        .find("span")
        .text(label);

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }


    /* =====================================================
       ÉTAT DU PANNEAU
       ===================================================== */

    function preparePanelAccessibility() {
      $("#fa-pins-panel")
        .attr(
          "aria-hidden",
          $("#fa-pins-panel")
            .hasClass("open")
            ? "false"
            : "true"
        );

      $("#fa-pins-button")
        .attr({
          "aria-controls":
            "fa-pins-panel",

          "aria-expanded":
            $("#fa-pins-panel")
              .hasClass("open")
              ? "true"
              : "false"
        });
    }


    function updatePanelState(isOpen) {
      const panel =
        $("#fa-pins-panel");

      const button =
        $("#fa-pins-button");

      panel
        .toggleClass(
          "open",
          isOpen
        )
        .removeClass("active")
        .attr(
          "aria-hidden",
          String(!isOpen)
        );

      button
        .toggleClass(
          "is-active",
          isOpen
        )
        .removeClass("open active")
        .attr(
          "aria-expanded",
          String(isOpen)
        );

      syncSidebarPush();
    }


    function closeCompetingPanels() {
      /*
       * Sujets récents KRSN.
       */
      $("#KRSN-panel")
        .removeClass("open active")
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

      /*
       * Notifications Notiffi.
       */
      $("#notiffi_panel")
        .removeClass("open active")
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
    }


    function closePanel() {
      updatePanelState(false);
    }


    function togglePanel() {
      const isOpen =
        $("#fa-pins-panel")
          .hasClass("open");

      if (isOpen) {
        closePanel();
      } else {
        openPanel();
      }
    }


    /* =====================================================
       AJOUT ET SUPPRESSION DU SUJET ACTUEL
       ===================================================== */

    function toggleCurrentTopicFavorite() {
      const topic =
        getCurrentTopic();

      let favorites = getFavorites()
        .map(normalizeFavorite);

      const existingIndex =
        favorites.findIndex(
          function (item) {
            return item.url === topic.url;
          }
        );

      if (existingIndex !== -1) {
        favorites.splice(
          existingIndex,
          1
        );
      } else {
        favorites.unshift(topic);
        openPanel();
      }

      saveFavorites(favorites);
      renderFavorites();
      syncTopicButton();
    }


    function markAsSeen(index) {
      let favorites = getFavorites()
        .map(normalizeFavorite);

      if (!favorites[index]) {
        return;
      }

      favorites[index].seenReplyAuthor =
        favorites[index].lastReplyAuthor;

      saveFavorites(favorites);
      renderFavorites();
    }


    /* =====================================================
       AFFICHAGE DES FAVORIS
       ===================================================== */

    function renderFavorites() {
      const list =
        $("#fa-pinned-list");

      if (!list.length) {
        updateCount();
        return;
      }

      let favorites = getFavorites()
        .map(normalizeFavorite);

      saveFavorites(favorites);

      const filtered =
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
          "<li>" +
            "<a>Aucun favori dans cette catégorie.</a>" +
          "</li>"
        );

        updateCount();
        return;
      }

      filtered.forEach(
        function (item) {
          const realIndex =
            favorites.findIndex(
              function (favorite) {
                return (
                  favorite.url ===
                  item.url
                );
              }
            );

          const isNew =
            item.lastReplyAuthor &&
            item.seenReplyAuthor &&
            item.lastReplyAuthor !==
              item.seenReplyAuthor;

          const categoryOptions =
            Object.entries(categories)
              .map(
                function (entry) {
                  const value = entry[0];
                  const label = entry[1];

                  return (
                    '<option value="' +
                    value +
                    '"' +
                    (
                      item.category === value
                        ? " selected"
                        : ""
                    ) +
                    ">" +
                    label +
                    "</option>"
                  );
                }
              )
              .join("");

          list.append(
            '<li class="fa-pin-item' +
              (
                isNew
                  ? " is-new"
                  : ""
              ) +
              '" draggable="true"' +
              ' data-index="' +
              realIndex +
              '">' +

              '<div class="fa-pin-avatar-wrap">' +
                '<div class="fa-pin-avatar-inner">' +

                  '<div class="fa-pin-avatar-front">' +
                    '<img class="fa-pin-avatar"' +
                    ' src="' + item.avatar + '"' +
                    ' alt=""' +
                    ' title="Dernière réponse : ' +
                    (
                      item.lastReplyAuthor ||
                      ""
                    ) +
                    '">' +
                  "</div>" +

                  '<div class="fa-pin-avatar-back">' +
                    '<img class="fa-pin-avatar"' +
                    ' src="' +
                    item.authorAvatar +
                    '"' +
                    ' alt=""' +
                    ' title="Auteur : ' +
                    item.author +
                    '">' +
                  "</div>" +

                "</div>" +
              "</div>" +

              '<div class="fa-pin-content">' +

                '<a class="fa-pin-title"' +
                ' href="' +
                item.url +
                '"' +
                ' data-index="' +
                realIndex +
                '">' +
                  item.title +
                "</a>" +

                '<div class="fa-pin-meta">' +
                  "<span>par " +
                    item.author +
                  "</span>" +

                  '<span class="fa-pin-forum">' +
                    "#" +
                    item.forum +
                  "</span>" +

                  '<span class="fa-pin-last">' +
                    item.lastReply +
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
                  categoryOptions +
                "</select>" +

              "</div>" +

              '<button class="fa-remove-pin"' +
              ' type="button"' +
              ' data-index="' +
              realIndex +
              '"' +
              ' title="Retirer"' +
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
       ÉVÉNEMENTS DU PANNEAU
       ===================================================== */

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


    $(document)
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


    $(document)
      .off(
        "click.faPinsFavorite",
        "#fa-add-current-topic, " +
        "#fa-topic-fav-button"
      )
      .on(
        "click.faPinsFavorite",
        "#fa-add-current-topic, " +
        "#fa-topic-fav-button",
        function (event) {
          event.preventDefault();
          toggleCurrentTopicFavorite();
        }
      );


    /* =====================================================
       FERMETURE AU CLIC EXTÉRIEUR
       ===================================================== */

    $(document)
      .off("click.faPinsOutside")
      .on(
        "click.faPinsOutside",
        function (event) {
          const panel =
            $("#fa-pins-panel");

          if (
            !panel.hasClass("open")
          ) {
            return;
          }

          const clickedInside =
            $(event.target).closest(
              "#fa-pins-panel, " +
              "#fa-pins-button, " +
              "#fa-topic-fav-button"
            ).length;

          if (clickedInside) {
            return;
          }

          closePanel();
        }
      );


    /* =====================================================
       FERMETURE AVEC ÉCHAP
       ===================================================== */

    $(document)
      .off("keydown.faPins")
      .on(
        "keydown.faPins",
        function (event) {
          if (
            event.key !== "Escape" ||
            !$("#fa-pins-panel")
              .hasClass("open")
          ) {
            return;
          }

          closePanel();

          $("#fa-pins-button")
            .trigger("focus");
        }
      );


    /* =====================================================
       EXCLUSION AVEC LES AUTRES PANNEAUX
       ===================================================== */

    $(document)
      .off(
        "click.faPinsNotiffi",
        "#notiffi_button"
      )
      .on(
        "click.faPinsNotiffi",
        "#notiffi_button",
        function () {
          closePanel();
        }
      );


    $(document)
      .off(
        "click.faPinsKRSN",
        "#KRSN-button"
      )
      .on(
        "click.faPinsKRSN",
        "#KRSN-button",
        function () {
          closePanel();
        }
      );


    /* =====================================================
       FILTRES PAR CATÉGORIE
       ===================================================== */

    $(document)
      .off(
        "click.faPinsCategories",
        ".fa-pins-cats button"
      )
      .on(
        "click.faPinsCategories",
        ".fa-pins-cats button",
        function () {
          $(".fa-pins-cats button")
            .removeClass("active");

          $(this).addClass("active");

          currentCategory =
            $(this).data("cat") ||
            "all";

          renderFavorites();
        }
      );


    $(document)
      .off(
        "change.faPinsCategory",
        ".fa-pin-cat-select"
      )
      .on(
        "change.faPinsCategory",
        ".fa-pin-cat-select",
        function () {
          let favorites = getFavorites()
            .map(normalizeFavorite);

          const index = Number(
            $(this).data("index")
          );

          if (!favorites[index]) {
            return;
          }

          favorites[index].category =
            $(this).val();

          saveFavorites(favorites);
          renderFavorites();
        }
      );


    /* =====================================================
       LIENS ET SUPPRESSION
       ===================================================== */

    $(document)
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


    $(document)
      .off(
        "click.faPinsRemove",
        ".fa-remove-pin"
      )
      .on(
        "click.faPinsRemove",
        ".fa-remove-pin",
        function (event) {
          event.preventDefault();

          let favorites = getFavorites()
            .map(normalizeFavorite);

          const index = Number(
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

    $(document)
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


    $(document)
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
            .removeClass("dragging");
        }
      );


    $(document)
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


    $(document)
      .off(
        "drop.faPins",
        ".fa-pin-item"
      )
      .on(
        "drop.faPins",
        ".fa-pin-item",
        function (event) {
          event.preventDefault();

          const droppedIndex = Number(
            $(this).data("index")
          );

          if (
            draggedIndex === null ||
            draggedIndex === droppedIndex
          ) {
            return;
          }

          let favorites = getFavorites()
            .map(normalizeFavorite);

          if (
            !favorites[draggedIndex] ||
            !favorites[droppedIndex]
          ) {
            return;
          }

          const moved = favorites.splice(
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
       INITIALISATION
       ===================================================== */

    preparePanelAccessibility();
    renderFavorites();
    syncTopicButton();
    syncSidebarPush();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }


  function startFavoriteTopics() {
    if (!window.jQuery) {
      return;
    }

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
