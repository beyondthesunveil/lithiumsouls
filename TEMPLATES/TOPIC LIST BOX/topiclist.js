(function () {
  "use strict";

  var categoryIntros = {
    "zone admin":
      "Toute éternité commence par un seuil. Les premiers fragments du royaume vous attendent ici.",

    "le purgatoire":
      "Au-delà des portes s’étendent les territoires où les âmes se cherchent, se rencontrent et se consument."
  };


  function cleanText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }


  function normalizeText(value) {
    var text = cleanText(value);

    if (typeof text.normalize === "function") {
      text = text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    return text.toLowerCase();
  }


  function getUniqueLinks(container) {
    var links = [];
    var seen = {};

    if (!container) return links;

    Array.prototype.forEach.call(
      container.querySelectorAll("a"),
      function (sourceLink) {
        var label = cleanText(sourceLink.textContent);
        var href = sourceLink.getAttribute("href");

        if (!label || !href) return;

        var key = normalizeText(label) + "|" + href;

        if (seen[key]) return;

        seen[key] = true;

        links.push({
          label: label,
          href: href
        });
      }
    );

    return links;
  }


  function findCategory(links, forumName) {
    var normalizedForum = normalizeText(forumName);
    var ignoredLabels = {
      "accueil": true,
      "index": true,
      "forum": true
    };

    var candidates = links.filter(function (link) {
      var label = normalizeText(link.label);

      return (
        label &&
        label !== normalizedForum &&
        !ignoredLabels[label]
      );
    });

    if (!candidates.length) {
      return {
        label: "Le royaume",
        href: "/"
      };
    }

    return candidates[candidates.length - 1];
  }


  function splitEditorialTitle(element, value) {
    if (!element) return;

    var words = cleanText(value)
      .split(/\s+/)
      .filter(Boolean);

    element.textContent = "";

    if (!words.length) return;

    var solid = document.createElement("span");
    var outline = document.createElement("em");

    if (words.length === 1) {
      solid.textContent = words[0];
    } else {
      solid.textContent =
        words.slice(0, -1).join(" ") + " ";

      outline.textContent =
        words[words.length - 1];
    }

    element.appendChild(solid);

    if (outline.textContent) {
      element.appendChild(outline);
    }
  }


  function appendBreadcrumbSeparator(container) {
    var separator = document.createElement("span");

    separator.className =
      "litso-viewforum_breadcrumbSeparator";

    separator.setAttribute("aria-hidden", "true");

    container.appendChild(separator);
  }


  function buildBreadcrumb(
    container,
    links,
    category,
    forumName
  ) {
    if (!container) return;

    container.textContent = "";

    var home = links.find(function (link) {
      var normalized = normalizeText(link.label);

      return (
        normalized === "accueil" ||
        normalized === "index"
      );
    });

    var homeLink = document.createElement("a");

    homeLink.href = home ? home.href : "/";
    homeLink.textContent = home
      ? home.label
      : "Accueil";

    container.appendChild(homeLink);
    appendBreadcrumbSeparator(container);

    var categoryLink =
      document.createElement("a");

    categoryLink.href = category.href || "/";
    categoryLink.textContent = category.label;

    container.appendChild(categoryLink);
    appendBreadcrumbSeparator(container);

    var current =
      document.createElement("strong");

    current.textContent = forumName;

    container.appendChild(current);
  }


  function initializeViewforum() {
    var page = document.querySelector(
      "[data-litso-viewforum]"
    );

    if (
      !page ||
      page.getAttribute("data-litso-ready") === "true"
    ) {
      return;
    }

    var sources = page.querySelector(
      "[data-litso-viewforum_sources]"
    );

    var boardSource = page.querySelector(
      "[data-litso-viewforum_board]"
    );

    var navigationSource = page.querySelector(
      "[data-litso-viewforum_navigation]"
    );

    var forumTitle = page.querySelector(
      "[data-litso-viewforum_forumTitle]"
    );

    var forumGhost = page.querySelector(
      "[data-litso-viewforum_forumGhost]"
    );

    var categoryTitle = page.querySelector(
      "[data-litso-viewforum_categoryTitle]"
    );

    var categoryGhost = page.querySelector(
      "[data-litso-viewforum_categoryGhost]"
    );

    var categoryIntro = page.querySelector(
      "[data-litso-viewforum_categoryIntro]"
    );

    var breadcrumb = page.querySelector(
      "[data-litso-viewforum_breadcrumb]"
    );

    if (!forumTitle) return;

    var forumName =
      cleanText(forumTitle.textContent);

    var boardLinks =
      getUniqueLinks(boardSource);

    var navigationLinks =
      getUniqueLinks(navigationSource);

    var sourceLinks =
      navigationLinks.length
        ? navigationLinks
        : boardLinks;

    var category =
      findCategory(sourceLinks, forumName);

    splitEditorialTitle(
      forumTitle,
      forumName
    );

    splitEditorialTitle(
      categoryTitle,
      category.label
    );

    if (forumGhost) {
      forumGhost.textContent =
        forumName.toUpperCase();
    }

    if (categoryGhost) {
      categoryGhost.textContent =
        category.label.toUpperCase();
    }

    if (categoryIntro) {
      categoryIntro.textContent =
        categoryIntros[
          normalizeText(category.label)
        ] ||
        "Chaque seuil ouvre sur une nouvelle parcelle du royaume.";
    }

    buildBreadcrumb(
      breadcrumb,
      sourceLinks,
      category,
      forumName
    );

    if (sources && sources.parentNode) {
      sources.parentNode.removeChild(sources);
    }

    page.setAttribute(
      "data-litso-ready",
      "true"
    );
  }


  function initializeLastPostLinks() {
    Array.prototype.forEach.call(
      document.querySelectorAll(
        ".litso-topiclist_row"
      ),
      function (row) {
        var nativeContainer =
          row.querySelector(
            "[data-litso-topiclist_nativeLastpost]"
          );

        var customLink =
          row.querySelector(
            ".litso-topiclist_lastpostLink"
          );

        if (!nativeContainer || !customLink) {
          return;
        }

        var nativeLink =
          nativeContainer.querySelector("a");

        if (
          nativeLink &&
          nativeLink.getAttribute("href")
        ) {
          customLink.href =
            nativeLink.getAttribute("href");
        }

        nativeContainer.setAttribute(
          "aria-hidden",
          "true"
        );
      }
    );
  }


  function initializeLitsoViewforum() {
    initializeViewforum();
    initializeLastPostLinks();
  }


  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoViewforum,
      { once: true }
    );
  } else {
    initializeLitsoViewforum();
  }
})();
