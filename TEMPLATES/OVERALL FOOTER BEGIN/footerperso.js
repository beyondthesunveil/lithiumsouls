$(function () {
  "use strict";


  /* =======================================================
     CONFIGURATION DU TICKER
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
    ".lithium-vb_posteravatar img"
  ];

  var LITSO_TICKER_AUTHOR_SELECTORS = [
    ".postprofile-name",
    ".litso-viewtopic_name",
    "[class*='utppVB_pseudo']",
    ".lithium-vb_postname",
    ".username"
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

  function LITSO_TICKER_clean(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }


  function LITSO_TICKER_url(value) {
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


  function LITSO_TICKER_escape(value) {
    return $("<div>")
      .text(value || "")
      .html();
  }


  function LITSO_TICKER_firstMatch(scope, selectors) {
    var result = $();

    $.each(selectors, function (_, selector) {
      var match = scope.find(selector).first();

      if (match.length) {
        result = match;
        return false;
      }
    });

    return result;
  }


  /* =======================================================
     FORUM DU SUJET
     ======================================================= */

  function LITSO_TICKER_extractForumName(row) {
    if (!row || !row.length) {
      return "";
    }

    var forumLink = row
      .find("a[href*='/f']")
      .filter(function () {
        var href = $(this).attr("href") || "";

        return /\/f\d+/i.test(href);
      })
      .first();

    if (forumLink.length) {
      return LITSO_TICKER_clean(
        forumLink.text()
      );
    }

    var forumElement = row
      .find(".forum-name, .topic-forum, .row3")
      .first();

    return LITSO_TICKER_clean(
      forumElement.text()
    );
  }


  /* =======================================================
     EXTRACTION DES SUJETS
     ======================================================= */

  function LITSO_TICKER_extractTopics(html) {
    var topics = [];
    var seen = {};

    var page = $("<div>").html(html);

    page
      .find("a.topictitle, a[href*='/t']")
      .each(function () {
        var link = $(this);
        var href = link.attr("href") || "";
        var idMatch = href.match(/\/t(\d+)/i);

        if (!idMatch) {
          return;
        }

        var topicId = idMatch[1];

        if (seen[topicId]) {
          return;
        }

        var title = LITSO_TICKER_clean(
          link.text()
        );

        if (!title || title.length < 3) {
          return;
        }

        var row = link.closest(
          "li.row, .topic-row, .topiclist > li, tr"
        );

        seen[topicId] = true;

        topics.push({
          id: topicId,
          title: title,
          url: LITSO_TICKER_url(href),
          avatar: LITSO_TICKER_DEFAULT_AVATAR,
          forum:
            LITSO_TICKER_extractForumName(row) ||
            "Sujet récent",
          author: "Dernière activité",
          date: ""
        });

        if (
          topics.length >=
          LITSO_TICKER_TOPIC_LIMIT
        ) {
          return false;
        }
      });

    return topics;
  }


  /* =======================================================
     AFFICHAGE
     ======================================================= */

  function LITSO_TICKER_render(topics) {
    var container = $(
      "[data-litso-ticker-list]"
    );

    var counter = $(
      "[data-litso-ticker-count]"
    );

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
              LITSO_TICKER_escape(topic.date) +
            "</span>"
          )
        : "";

      container.append(
        '<div class="litso-ticker_item">' +

          '<div class="litso-ticker_avatar">' +
            '<img src="' +
              LITSO_TICKER_escape(avatar) +
              '" alt="">' +
          "</div>" +

          '<div class="litso-ticker_content">' +

            '<a class="litso-ticker_title" href="' +
              LITSO_TICKER_escape(topic.url) +
            '">' +
              LITSO_TICKER_escape(topic.title) +
            "</a>" +

            '<div class="litso-ticker_meta">' +

              '<span class="litso-ticker_forum">' +
                "#" +
                LITSO_TICKER_escape(topic.forum) +
              "</span>" +

              '<span class="litso-ticker_author">' +
                LITSO_TICKER_escape(topic.author) +
              "</span>" +

              date +

            "</div>" +

          "</div>" +

        "</div>"
      );
    });
  }


  /* =======================================================
     DERNIER MESSAGE
     ======================================================= */

  function LITSO_TICKER_extractLastPost(html) {
    var page = $("<div>").html(html);

    var posts = page.find(
      LITSO_TICKER_POST_SELECTORS.join(",")
    );

    var scope = posts.length
      ? posts.last()
      : page;

    var avatarElement =
      LITSO_TICKER_firstMatch(
        scope,
        LITSO_TICKER_AVATAR_SELECTORS
      );

    var authorElement =
      LITSO_TICKER_firstMatch(
        scope,
        LITSO_TICKER_AUTHOR_SELECTORS
      );

    var dateElement =
      LITSO_TICKER_firstMatch(
        scope,
        LITSO_TICKER_DATE_SELECTORS
      );

    var avatar =
      avatarElement.attr("src") || "";

    return {
      avatar: avatar
        ? LITSO_TICKER_url(avatar)
        : "",

      author: LITSO_TICKER_clean(
        authorElement.text()
      ),

      date: LITSO_TICKER_clean(
        dateElement.text()
      )
    };
  }


  function LITSO_TICKER_enrichTopic(
    topic,
    index,
    topics
  ) {
    $.ajax({
      url: topic.url,
      method: "GET",
      cache: false,

      success: function (html) {
        var lastPost =
          LITSO_TICKER_extractLastPost(html);

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

        LITSO_TICKER_render(topics);
      }
    });
  }


  function LITSO_TICKER_enrichTopics(topics) {
    topics.forEach(function (topic, index) {
      window.setTimeout(function () {
        LITSO_TICKER_enrichTopic(
          topic,
          index,
          topics
        );
      }, index * 180);
    });
  }


  /* =======================================================
     CHARGEMENT
     ======================================================= */

  function LITSO_TICKER_load() {
    var container = $(
      "[data-litso-ticker-list]"
    );

    var counter = $(
      "[data-litso-ticker-count]"
    );

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
      cache: false,

      success: function (html) {
        var topics =
          LITSO_TICKER_extractTopics(html);

        LITSO_TICKER_render(topics);

        if (topics.length) {
          LITSO_TICKER_enrichTopics(topics);
        }
      },

      error: function () {
        counter.text("");

        container.html(
          '<div class="litso-ticker_empty">' +
            "Impossible d’entendre les derniers murmures." +
          "</div>"
        );
      }
    });
  }


  /* =======================================================
     INITIALISATION
     ======================================================= */

  function LITSO_TICKER_initialize() {
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

    LITSO_TICKER_load();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }


  /* =======================================================
     LANCEMENT
     ======================================================= */

  LITSO_TICKER_initialize();
});
