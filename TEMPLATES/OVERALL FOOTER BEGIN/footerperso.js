$(function () {
  "use strict";


  /* =======================================================
     CONFIGURATION DES DERNIERS SUJETS
     ======================================================= */

  var LITSO_FOOTER_DEFAULT_AVATAR =
    "https://zupimages.net/up/26/20/z3y2.jpg";

  var LITSO_FOOTER_TOPIC_LIMIT = 10;


  /*
   * Sélecteurs permettant de retrouver les messages,
   * avatars, auteurs et dates dans différentes structures
   * de templates Forumactif.
   */

  var LITSO_FOOTER_POST_SELECTORS = [
    ".post",
    ".litso-viewtopic_post",
    "[class*='utppVB_post']",
    ".lithium-vb_post"
  ];

  var LITSO_FOOTER_AVATAR_SELECTORS = [
    ".postprofile-avatar img",
    ".litso-viewtopic_avatar img",
    "[class*='utppVB_avatar'] img",
    ".lithium-vb_posteravatar img"
  ];

  var LITSO_FOOTER_AUTHOR_SELECTORS = [
    ".postprofile-name",
    ".litso-viewtopic_name",
    "[class*='utppVB_pseudo']",
    ".lithium-vb_postname",
    ".username"
  ];

  var LITSO_FOOTER_DATE_SELECTORS = [
    ".postbody .author",
    ".litso-viewtopic_date",
    "[class*='utppVB_date']",
    ".ls-vb_topicre span",
    "time"
  ];


  /* =======================================================
     OUTILS
     ======================================================= */

  function LITSO_FOOTER_clean(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }


  function LITSO_FOOTER_url(value) {
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


  function LITSO_FOOTER_escape(value) {
    return $("<div>")
      .text(value || "")
      .html();
  }


  function LITSO_FOOTER_firstMatch(
    scope,
    selectors
  ) {
    var result = $();

    $.each(
      selectors,
      function (_, selector) {
        var match = scope
          .find(selector)
          .first();

        if (match.length) {
          result = match;
          return false;
        }
      }
    );

    return result;
  }


  /* =======================================================
     EXTRACTION DES SUJETS DEPUIS LA RECHERCHE
     ======================================================= */

  function LITSO_FOOTER_extractTopics(html) {
    var topics = [];
    var seen = {};

    var page = $("<div>").html(html);

    var links = page.find(
      "a.topictitle, a[href*='/t']"
    );

    links.each(function () {
      var link = $(this);

      var href =
        link.attr("href") || "";

      var idMatch = href.match(
        /\/t(\d+)/i
      );

      if (!idMatch) {
        return;
      }

      var topicId = idMatch[1];

      if (seen[topicId]) {
        return;
      }

      var title = LITSO_FOOTER_clean(
        link.text()
      );

      if (
        !title ||
        title.length < 3
      ) {
        return;
      }

      var row = link.closest(
        "li.row, .topic-row, .topiclist > li, tr"
      );

      var forumName =
        LITSO_FOOTER_extractForumName(
          row
        );

      seen[topicId] = true;

      topics.push({
        id: topicId,
        title: title,
        url: LITSO_FOOTER_url(href),
        avatar: LITSO_FOOTER_DEFAULT_AVATAR,
        forum: forumName || "Sujet récent",
        author: "Dernière activité",
        date: ""
      });

      if (
        topics.length >=
        LITSO_FOOTER_TOPIC_LIMIT
      ) {
        return false;
      }
    });

    return topics;
  }


  /* =======================================================
     NOM DU FORUM
     ======================================================= */

  function LITSO_FOOTER_extractForumName(row) {
    if (!row || !row.length) {
      return "";
    }

    var forumLink = row
      .find("a[href*='/f']")
      .filter(function () {
        var href =
          $(this).attr("href") || "";

        return /\/f\d+/i.test(href);
      })
      .first();

    if (forumLink.length) {
      return LITSO_FOOTER_clean(
        forumLink.text()
      );
    }

    var forumElement = row
      .find(
        ".forum-name, .topic-forum, .row3"
      )
      .first();

    return LITSO_FOOTER_clean(
      forumElement.text()
    );
  }


  /* =======================================================
     AFFICHAGE DES SUJETS
     ======================================================= */

  function LITSO_FOOTER_renderTopics(
    topics
  ) {
    var container = $(
      "[data-litso-footer_topics]"
    );

    var counter = $(
      "[data-litso-footer_topic-count]"
    );

    if (!container.length) {
      return;
    }

    container.empty();

    if (counter.length) {
      counter.text(
        topics.length || ""
      );
    }

    if (!topics.length) {
      container.html(
        '<div class="litso-footer_empty">' +
          "Aucun murmure récent." +
        "</div>"
      );

      return;
    }

    topics.forEach(function (topic) {
      var avatar =
        topic.avatar ||
        LITSO_FOOTER_DEFAULT_AVATAR;

      var dateContent = topic.date
        ? (
            '<span class="litso-footer_topicDate">' +
              "· " +
              LITSO_FOOTER_escape(topic.date) +
            "</span>"
          )
        : "";

      container.append(
        '<div class="litso-footer_topicItem">' +

          '<div class="litso-footer_topicAvatar">' +
            '<img src="' +
              LITSO_FOOTER_escape(avatar) +
              '" alt="">' +
          "</div>" +

          '<div class="litso-footer_topicContent">' +

            '<a class="litso-footer_topicTitle"' +
              ' href="' +
                LITSO_FOOTER_escape(topic.url) +
              '">' +
                LITSO_FOOTER_escape(topic.title) +
            "</a>" +

            '<div class="litso-footer_topicMeta">' +

              '<span class="litso-footer_topicForum">' +
                "#" +
                LITSO_FOOTER_escape(topic.forum) +
              "</span>" +

              '<span class="litso-footer_topicAuthor">' +
                LITSO_FOOTER_escape(topic.author) +
              "</span>" +

              dateContent +

            "</div>" +

          "</div>" +

        "</div>"
      );
    });
  }


  /* =======================================================
     EXTRACTION DU DERNIER MESSAGE D’UN SUJET
     ======================================================= */

  function LITSO_FOOTER_extractLastPost(
    html
  ) {
    var page = $("<div>").html(html);

    var postSelector =
      LITSO_FOOTER_POST_SELECTORS.join(",");

    var posts = page.find(
      postSelector
    );

    var scope = posts.length
      ? posts.last()
      : page;

    var avatarElement =
      LITSO_FOOTER_firstMatch(
        scope,
        LITSO_FOOTER_AVATAR_SELECTORS
      );

    var authorElement =
      LITSO_FOOTER_firstMatch(
        scope,
        LITSO_FOOTER_AUTHOR_SELECTORS
      );

    var dateElement =
      LITSO_FOOTER_firstMatch(
        scope,
        LITSO_FOOTER_DATE_SELECTORS
      );

    var avatar =
      avatarElement.attr("src") || "";

    var author =
      LITSO_FOOTER_clean(
        authorElement.text()
      );

    var date =
      LITSO_FOOTER_clean(
        dateElement.text()
      );

    return {
      avatar: avatar
        ? LITSO_FOOTER_url(avatar)
        : "",

      author: author,

      date: date
    };
  }


  /* =======================================================
     ENRICHISSEMENT D’UN SUJET
     ======================================================= */

  function LITSO_FOOTER_enrichTopic(
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
          LITSO_FOOTER_extractLastPost(
            html
          );

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

        LITSO_FOOTER_renderTopics(
          topics
        );
      }
    });
  }


  /* =======================================================
     ENRICHISSEMENT DE TOUS LES SUJETS
     ======================================================= */

  function LITSO_FOOTER_enrichTopics(
    topics
  ) {
    topics.forEach(
      function (topic, index) {
        window.setTimeout(
          function () {
            LITSO_FOOTER_enrichTopic(
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
     CHARGEMENT DES SUJETS
     ======================================================= */

  function LITSO_FOOTER_loadTopics() {
    var container = $(
      "[data-litso-footer_topics]"
    );

    var counter = $(
      "[data-litso-footer_topic-count]"
    );

    if (!container.length) {
      return;
    }

    if (counter.length) {
      counter.text("");
    }

    container.html(
      '<div class="litso-footer_loading">' +
        "Chargement des derniers murmures…" +
      "</div>"
    );

    $.ajax({
      url: "/search?search_id=latest",
      method: "GET",
      cache: false,

      success: function (html) {
        var topics =
          LITSO_FOOTER_extractTopics(
            html
          );

        LITSO_FOOTER_renderTopics(
          topics
        );

        if (topics.length) {
          LITSO_FOOTER_enrichTopics(
            topics
          );
        }
      },

      error: function () {
        if (counter.length) {
          counter.text("");
        }

        container.html(
          '<div class="litso-footer_empty">' +
            "Impossible d’entendre les derniers murmures." +
          "</div>"
        );
      }
    });
  }


  /* =======================================================
     INITIALISATION
     ======================================================= */

  function LITSO_FOOTER_initialize() {
    var footer = $(
      "[data-litso-footer]"
    );

    if (
      !footer.length ||
      footer.attr(
        "data-litso-footer-ready"
      ) === "true"
    ) {
      return;
    }

    footer.attr(
      "data-litso-footer-ready",
      "true"
    );

    LITSO_FOOTER_loadTopics();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }


  /* =======================================================
     LANCEMENT
     ======================================================= */

  LITSO_FOOTER_initialize();
});
