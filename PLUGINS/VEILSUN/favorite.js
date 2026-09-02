$(function () {
  const STORAGE_KEY = "fa_favorite_topics";
  const DEFAULT_AVATAR = "https://zupimages.net/up/26/20/z3y2.jpg";

  let currentCategory = "all";
  let draggedIndex = null;

  const categories = {
    rp: "RP",
    lore: "Lore",
    fiche: "Fiches personnages",
    intrigue: "Réseaux sociaux"
  };

  function syncSidebarPush() {
    if (window.KRSN_syncPanelsSidebar) {
      window.KRSN_syncPanelsSidebar();
    }
  }

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveFavorites(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function cleanText(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  function fixUrl(url) {
    if (!url) return DEFAULT_AVATAR;
    if (url.startsWith("//")) return location.protocol + url;
    if (url.startsWith("/")) return location.origin + url;
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

  function getTopicPosts() {
    return $(".post").filter(function () {
      return $(this).find(".lithium-vb_posteravatar, .lithium-vb_postname").length;
    });
  }

  function findAvatar(post) {
    let avatar =
      post.find(".lithium-vb_posteravatar img").first().attr("src") ||
      post.find(".ls-pfb_avatar img").first().attr("src") ||
      post.find("#ls-avalastmember img").first().attr("src");

    if (avatar && !isBadAvatar(avatar)) {
      return fixUrl(avatar);
    }

    avatar = post.find("img").filter(function () {
      const src = $(this).attr("src") || "";
      return !isBadAvatar(src);
    }).first().attr("src");

    return fixUrl(avatar || DEFAULT_AVATAR);
  }

  function getPostAuthor(post) {
    return (
      cleanText(post.find(".lithium-vb_postname").first().text()) ||
      cleanText(post.find(".postprofile-name a").first().text()) ||
      cleanText(post.find(".username").first().text()) ||
      "Auteur inconnu"
    );
  }

  function getTopicTitle() {
    return (
      cleanText($(".lithium-vb_titlemap").first().text()) ||
      cleanText($(".pathname-box h1, h1.page-title, h1, .topic-title").first().text()) ||
      cleanText(document.title.replace(/ ::.*$/, "")) ||
      "Sujet sans titre"
    );
  }

  function getTopicForum() {
    return (
      cleanText($(".lithium-vb_brdcrmbtrail a").not(":first").last().text()) ||
      cleanText($(".pathname-box a, .breadcrumbs a, .nav a").not(":first").last().text()) ||
      "Forum"
    );
  }

  function getCurrentTopic() {
    const posts = getTopicPosts();
    const firstPost = posts.first();
    const lastPost = posts.last();

    const title = getTopicTitle();
    const url = location.origin + location.pathname;
    const forum = getTopicForum();

    const author = firstPost.length ? getPostAuthor(firstPost) : "Auteur inconnu";
    const authorAvatar = firstPost.length ? findAvatar(firstPost) : DEFAULT_AVATAR;

    const lastReplyAuthor = lastPost.length ? getPostAuthor(lastPost) : "Dernière réponse";
    const lastReplyAvatar = lastPost.length ? findAvatar(lastPost) : DEFAULT_AVATAR;

    return {
      title,
      url,
      author,
      authorAvatar,
      avatar: lastReplyAvatar,
      forum,
      lastReply: "Dernière réponse par " + lastReplyAuthor,
      lastReplyAuthor,
      category: "rp",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      seenReplyAuthor: lastReplyAuthor
    };
  }

  function normalizeFavorite(item) {
    return {
      title: item.title || "Sujet sans titre",
      url: item.url || "#",
      author: item.author || "Auteur inconnu",
      authorAvatar: fixUrl(item.authorAvatar || item.avatar),
      avatar: fixUrl(item.avatar),
      forum: item.forum || "Forum",
      lastReply: item.lastReply || "Dernière réponse",
      lastReplyAuthor: item.lastReplyAuthor || "",
      seenReplyAuthor: item.seenReplyAuthor || item.lastReplyAuthor || "",
      category: item.category || "rp",
      createdAt: item.createdAt || Date.now(),
      updatedAt: item.updatedAt || item.createdAt || Date.now()
    };
  }

  function updateCount() {
    $("#fa-pins-count").text(getFavorites().length || "");
  }

  function syncTopicButton() {
    const button = $("#fa-topic-fav-button");
    if (!button.length) return;

    const currentUrl = location.origin + location.pathname;
    const exists = getFavorites().some(item => item.url === currentUrl);

    button.toggleClass("is-faved", exists);

    button.find("span").text(
      exists ? "Retirer des favoris" : "Ajouter aux favoris"
    );

    button.attr(
      "title",
      exists ? "Retirer ce sujet des favoris" : "Ajouter ce sujet aux favoris"
    );

    if (window.lucide) lucide.createIcons();
  }

  function openPanel() {
    $("#KRSN-panel").removeClass("open");
    $("#fa-pins-panel").addClass("open");
    syncSidebarPush();
  }

  function closePanel() {
    $("#fa-pins-panel").removeClass("open");
    syncSidebarPush();
  }

  function togglePanel() {
    if ($("#fa-pins-panel").hasClass("open")) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function toggleCurrentTopicFavorite() {
    const topic = getCurrentTopic();
    let favorites = getFavorites().map(normalizeFavorite);

    const existingIndex = favorites.findIndex(item => item.url === topic.url);

    if (existingIndex !== -1) {
      favorites.splice(existingIndex, 1);
    } else {
      favorites.unshift(topic);
      openPanel();
    }

    saveFavorites(favorites);
    renderFavorites();
    syncTopicButton();
  }

  function markAsSeen(index) {
    let favorites = getFavorites().map(normalizeFavorite);
    if (!favorites[index]) return;
    favorites[index].seenReplyAuthor = favorites[index].lastReplyAuthor;
    saveFavorites(favorites);
    renderFavorites();
  }

  function renderFavorites() {
    const list = $("#fa-pinned-list");
    if (!list.length) return;

    let favorites = getFavorites().map(normalizeFavorite);
    saveFavorites(favorites);

    const filtered = currentCategory === "all"
      ? favorites
      : favorites.filter(item => item.category === currentCategory);

    list.empty();

    if (!filtered.length) {
      list.append("<li><a>Aucun favori dans cette catégorie.</a></li>");
      updateCount();
      return;
    }

    filtered.forEach(function (item) {
      const realIndex = favorites.findIndex(fav => fav.url === item.url);
      const isNew =
        item.lastReplyAuthor &&
        item.seenReplyAuthor &&
        item.lastReplyAuthor !== item.seenReplyAuthor;

      list.append(`
        <li class="fa-pin-item ${isNew ? "is-new" : ""}" draggable="true" data-index="${realIndex}">
          <div class="fa-pin-avatar-wrap">
            <div class="fa-pin-avatar-inner">
              <div class="fa-pin-avatar-front">
                <img class="fa-pin-avatar" src="${item.avatar}" alt="" title="Dernière réponse : ${item.lastReplyAuthor || ""}" />
              </div>
              <div class="fa-pin-avatar-back">
                <img class="fa-pin-avatar" src="${item.authorAvatar}" alt="" title="Auteur : ${item.author}" />
              </div>
            </div>
          </div>

          <div class="fa-pin-content">
            <a class="fa-pin-title" href="${item.url}" data-index="${realIndex}">
              ${item.title}
            </a>

            <div class="fa-pin-meta">
              <span>par ${item.author}</span>
              <span class="fa-pin-forum">#${item.forum}</span>
              <span class="fa-pin-last">${item.lastReply}</span>
              ${isNew ? `<span class="fa-pin-new">Nouveau</span>` : ""}
            </div>

            <select class="fa-pin-cat-select" data-index="${realIndex}">
              ${Object.entries(categories).map(([value, label]) => `
                <option value="${value}" ${item.category === value ? "selected" : ""}>
                  ${label}
                </option>
              `).join("")}
            </select>
          </div>

          <button class="fa-remove-pin" data-index="${realIndex}" title="Retirer">×</button>
        </li>
      `);
    });

    updateCount();

    if (window.lucide) lucide.createIcons();
  }

  $("#fa-pins-button").off("click.faPins").on("click.faPins", togglePanel);
  $("#fa-pins-close").off("click.faPins").on("click.faPins", closePanel);

  $("#fa-add-current-topic, #fa-topic-fav-button")
    .off("click.faPins")
    .on("click.faPins", toggleCurrentTopicFavorite);

  $(document).on("click", ".fa-pin-title", function () {
    markAsSeen(Number($(this).data("index")));
  });

  $(".fa-pins-cats button").on("click", function () {
    $(".fa-pins-cats button").removeClass("active");
    $(this).addClass("active");
    currentCategory = $(this).data("cat");
    renderFavorites();
  });

  $(document).on("change", ".fa-pin-cat-select", function () {
    let favorites = getFavorites().map(normalizeFavorite);
    const index = Number($(this).data("index"));
    if (!favorites[index]) return;
    favorites[index].category = $(this).val();
    saveFavorites(favorites);
    renderFavorites();
  });

  $(document).on("click", ".fa-remove-pin", function () {
    let favorites = getFavorites().map(normalizeFavorite);
    const index = Number($(this).data("index"));
    if (!favorites[index]) return;
    favorites.splice(index, 1);
    saveFavorites(favorites);
    renderFavorites();
    syncTopicButton();
  });

  $(document).on("dragstart", ".fa-pin-item", function () {
    draggedIndex = Number($(this).data("index"));
    $(this).addClass("dragging");
  });

  $(document).on("dragend", ".fa-pin-item", function () {
    draggedIndex = null;
    $(".fa-pin-item").removeClass("dragging");
  });

  $(document).on("dragover", ".fa-pin-item", function (event) {
    event.preventDefault();
  });

  $(document).on("drop", ".fa-pin-item", function () {
    const droppedIndex = Number($(this).data("index"));
    if (draggedIndex === null || draggedIndex === droppedIndex) return;

    let favorites = getFavorites().map(normalizeFavorite);

    if (!favorites[draggedIndex] || !favorites[droppedIndex]) return;

    const moved = favorites.splice(draggedIndex, 1)[0];
    favorites.splice(droppedIndex, 0, moved);

    saveFavorites(favorites);
    renderFavorites();
  });

  renderFavorites();
  syncTopicButton();
  syncSidebarPush();

  if (window.lucide) lucide.createIcons();
});
