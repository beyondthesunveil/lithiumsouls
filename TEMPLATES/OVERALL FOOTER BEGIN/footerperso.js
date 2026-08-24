(function ($) {
  "use strict";


  /* =======================================================
     CONFIGURATION
     ======================================================= */

  var LITSO_TICKER_DEFAULT_AVATAR =
    "https://zupimages.net/up/26/20/z3y2.jpg";

  var LITSO_TICKER_TOPIC_LIMIT = 10;

  var LITSO_TICKER_POST_SELECTORS = [
    ".post",
    ".litso-viewtopic_post",
    "[class*='utppVB_post']",
    ".lithium-vb_post"
  ];

  var LITSO_TICKER_AVATAR_SELECTORS = [
    ".postprofile-avatar img",
    ".litso-viewtopic_avatar img",
    "[class*='utppVB_avatar'] img",
    ".lithium-vb_posteravatar img",
    "[class*='posteravatar'] img"
  ];

  var LITSO_TICKER_AUTHOR_SELECTORS = [
    ".postprofile-name",
    ".litso-viewtopic_name",
    "[class*='utppVB_pseudo']",
    ".lithium-vb_postname",
    ".username",
    "[class*='postname']"
  ];

  var LITSO_TICKER_DATE_SELECTORS = [
    ".postbody .author",
    ".litso-viewtopic_date",
    "[class*='utppVB_date']",
    ".ls-vb_topicre span",
    "time"
  ];


  /* =======================================================
     OUTILS
     ======================================================= */

  function clean(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }


  function absoluteUrl(value) {
    if (!value) {
      return "";
    }

    if (value.indexOf("//") === 0) {
      return window.location.protocol + value;
    }

    if (value.charAt(0) === "/") {
      return window.location.origin + value;
    }

    return value;
  }


  function escapeHtml(value) {
    return $("<div>")
      .text(value || "")
      .html();
  }


  function parsePage(html) {
    return new window.DOMParser()
      .parseFromString(
        String(html || ""),
        "text/html"
      );
  }


  function firstMatch(scope, selectors) {
    if (!scope) {
      return null;
    }

    for (
      var index = 0;
      index < selectors.length;
      index++
    ) {
      var result = scope.querySelector(
        selectors[index]
      );

      if (result) {
        return result;
      }
    }

    return null;
  }


  function findClosestRow(link) {
    if (!link || !link.closest) {
      return null;
    }

    return link.closest(
      "li.row, .topic-row, .topiclist > li, tr, dl"
    );
  }


  /* =======================================================
     NOM DU FORUM
     ======================================================= */

  function extractForumName(row) {
    if (!row) {
      return "";
    }

    var links = row.querySelectorAll(
      "a[href*='/f'], a[href^='f']"
    );

    for (
      var index = 0;
      index < links.length;
      index++
    ) {
      var href =
        links[index].getAttribute("href") || "";

      if (
        /(?:^|\/)f\d+/i.test(href)
      ) {
        return clean(
          links[index].textContent
        );
      }
    }

    var forumElement = row.querySelector(
      ".forum-name, .topic-forum, .row3"
    );

    return forumElement
      ? clean(forumElement.textContent)
      : "";
  }


  /* =======================================================
     EXTRACTION DES SUJETS
     ======================================================= */

  function extractTopics(html) {
    var documentPage = parsePage(html);
    var topics = [];
    var seen = {};

    var links = documentPage.querySelectorAll(
      "a.topictitle, a[href*='/t'], a[href^='t']"
    );

    for (
      var index = 0;
      index < links.length;
      index++
    ) {
      var link = links[index];

      var href =
        link.getAttribute("href") || "";

      var match = href.match(
        /(?:^|\/)t(\d+)/i
      );

      if (!match) {
        continue;
      }

      var topicId = match[1];

      if (seen[topicId]) {
        continue;
      }

      var title = clean(
        link.textContent
      );

      if (
        !title ||
        title.length < 3
      ) {
        continue;
      }

      var row = findClosestRow(link);

      seen[topicId] = true;

      topics.push({
        id: topicId,
        title: title,
        url: absoluteUrl(href),
        avatar: LITSO_TICKER_DEFAULT_AVATAR,
        forum:
          extractForumName(row) ||
          "Sujet récent",
        author: "Dernière activité",
        date: ""
      });

      if (
        topics.length >=
        LITSO_TICKER_TOPIC_LIMIT
      ) {
        break;
      }
    }

    return topics;
  }


  /* =======================================================
     AFFICHAGE
     ======================================================= */

  function renderTopics(topics) {
    var container = $(
      "[data-litso-ticker-list]"
    ).first();

    var counter = $(
      "[data-litso-ticker-count]"
    ).first();

    if (!container.length) {
      return;
    }

    container.empty();
    counter.text(topics.length || "");

    if (!topics.length) {
      container.html(
        '<div class="litso-ticker_empty">' +
          "Aucun murmure récent." +
        "</div>"
      );

      return;
    }

    topics.forEach(function (topic) {
      var avatar =
        topic.avatar ||
        LITSO_TICKER_DEFAULT_AVATAR;

      var date = topic.date
        ? (
            '<span class="litso-ticker_date">' +
              "· " +
              escapeHtml(topic.date) +
            "</span>"
          )
        : "";

      container.append(
        '<div class="litso-ticker_item">' +

          '<div class="litso-ticker_avatar">' +
            '<img src="' +
              escapeHtml(avatar) +
              '" alt="">' +
          "</div>" +

          '<div class="litso-ticker_content">' +

            '<a class="litso-ticker_title" href="' +
              escapeHtml(topic.url) +
            '">' +
              escapeHtml(topic.title) +
            "</a>" +

            '<div class="litso-ticker_meta">' +

              '<span class="litso-ticker_forum">' +
                "#" +
                escapeHtml(topic.forum) +
              "</span>" +

              '<span class="litso-ticker_author">' +
                escapeHtml(topic.author) +
              "</span>" +

              date +

            "</div>" +

          "</div>" +

        "</div>"
      );
    });
  }


  /* =======================================================
     INFORMATIONS DU DERNIER MESSAGE
     ======================================================= */

  function extractLastPost(html) {
    var documentPage = parsePage(html);

    var posts = documentPage.querySelectorAll(
      LITSO_TICKER_POST_SELECTORS.join(",")
    );

    var scope = posts.length
      ? posts[posts.length - 1]
      : documentPage;

    var avatarElement = firstMatch(
      scope,
      LITSO_TICKER_AVATAR_SELECTORS
    );

    var authorElement = firstMatch(
      scope,
      LITSO_TICKER_AUTHOR_SELECTORS
    );

    var dateElement = firstMatch(
      scope,
      LITSO_TICKER_DATE_SELECTORS
    );

    var avatar = avatarElement
      ? avatarElement.getAttribute("src") || ""
      : "";

    return {
      avatar: avatar
        ? absoluteUrl(avatar)
        : "",

      author: authorElement
        ? clean(authorElement.textContent)
        : "",

      date: dateElement
        ? clean(dateElement.textContent)
        : ""
    };
  }


  /* =======================================================
     ENRICHISSEMENT
     ======================================================= */

  function enrichTopic(
    topic,
    index,
    topics
  ) {
    $.ajax({
      url: topic.url,
      method: "GET",
      dataType: "html",
      cache: false,
      timeout: 15000
    })

    .done(function (html) {
      var lastPost =
        extractLastPost(html);

      if (lastPost.avatar) {
        topics[index].avatar =
          lastPost.avatar;
      }

      if (lastPost.author) {
        topics[index].author =
          "Par " + lastPost.author;
      }

      if (lastPost.date) {
        topics[index].date =
          lastPost.date;
      }

      renderTopics(topics);
    });
  }


  function enrichTopics(topics) {
    topics.forEach(
      function (topic, index) {
        window.setTimeout(
          function () {
            enrichTopic(
              topic,
              index,
              topics
            );
          },
          index * 180
        );
      }
    );
  }


  /* =======================================================
     CHARGEMENT
     ======================================================= */

  function loadTicker() {
    var container = $(
      "[data-litso-ticker-list]"
    ).first();

    var counter = $(
      "[data-litso-ticker-count]"
    ).first();

    if (!container.length) {
      return;
    }

    counter.text("");

    container.html(
      '<div class="litso-ticker_loading">' +
        "Chargement des derniers murmures…" +
      "</div>"
    );

    $.ajax({
      url: "/search?search_id=latest",
      method: "GET",
      dataType: "html",
      cache: false,
      timeout: 15000
    })

    .done(function (html) {
      var topics =
        extractTopics(html);

      renderTopics(topics);

      if (topics.length) {
        enrichTopics(topics);
      }
    })

    .fail(function () {
      counter.text("");

      container.html(
        '<div class="litso-ticker_empty">' +
          "Impossible d’entendre les derniers murmures." +
        "</div>"
      );
    });
  }


  /* =======================================================
     INITIALISATION
     ======================================================= */

  function initializeTicker() {
    var footer = $(
      "[data-litso-footer]"
    ).first();

    var ticker = footer.find(
      "[data-litso-ticker-list]"
    );

    if (
      !footer.length ||
      !ticker.length ||
      footer.attr(
        "data-litso-ticker-ready"
      ) === "true"
    ) {
      return;
    }

    footer.attr(
      "data-litso-ticker-ready",
      "true"
    );

    loadTicker();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }


  /* =======================================================
     LANCEMENT
     ======================================================= */

  $(initializeTicker);

})(jQuery);
