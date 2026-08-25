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
    return cleanText(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
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
      solid.textContent = words.slice(0, -1).join(" ") + " ";
      outline.textContent = words[words.length - 1];
    }

    element.appendChild(solid);

    if (outline.textContent) {
      element.appendChild(outline);
    }
  }


  function buildBreadcrumb(container, links, forumName) {
    if (!container) return;

    container.textContent = "";

    var seen = {};

    links.forEach(function (sourceLink) {
      var label = cleanText(sourceLink.textContent);
      var href = sourceLink.getAttribute("href");

      if (!label || !href) return;

      var key = label + "|" + href;

      if (seen[key]) return;
      seen[key] = true;

      if (container.children.length) {
        var separator = document.createElement("span");
        separator.className = "litso-viewforum_breadcrumbSeparator";
        separator.setAttribute("aria-hidden", "true");
        container.appendChild(separator);
      }

      var link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      container.appendChild(link);
    });

    if (container.children.length) {
      var separator = document.createElement("span");
      separator.className = "litso-viewforum_breadcrumbSeparator";
      separator.setAttribute("aria-hidden", "true");
      container.appendChild(separator);
    }

    var current = document.createElement("strong");
    current.textContent = forumName;
    container.appendChild(current);
  }


  function initializeViewforum() {
    var page = document.querySelector("[data-litso-viewforum]");

    if (!page || page.getAttribute("data-litso-ready") === "true") {
      return;
    }

    page.setAttribute("data-litso-ready", "true");

    var sources = page.querySelector("[data-litso-viewforum_sources]");
    var forumTitle = page.querySelector("[data-litso-viewforum_forumTitle]");
    var forumGhost = page.querySelector("[data-litso-viewforum_forumGhost]");
    var categoryTitle = page.querySelector("[data-litso-viewforum_categoryTitle]");
    var categoryGhost = page.querySelector("[data-litso-viewforum_categoryGhost]");
    var categoryIntro = page.querySelector("[data-litso-viewforum_categoryIntro]");
    var breadcrumb = page.querySelector("[data-litso-viewforum_breadcrumb]");

    var forumName = cleanText(forumTitle ? forumTitle.textContent : "");
    var links = sources
      ? Array.prototype.slice.call(sources.querySelectorAll("a"))
      : [];

    var categoryLink = null;

    for (var i = links.length - 1; i >= 0; i--) {
      var linkText = cleanText(links[i].textContent);

      if (
        linkText &&
        normalizeText(linkText) !== normalizeText(forumName)
      ) {
        categoryLink = links[i];
        break;
      }
    }

    var categoryName = categoryLink
      ? cleanText(categoryLink.textContent)
      : "Le royaume";

    splitEditorialTitle(forumTitle, forumName);
    splitEditorialTitle(categoryTitle, categoryName);

    if (forumGhost) {
      forumGhost.textContent = forumName;
    }

    if (categoryGhost) {
      categoryGhost.textContent = categoryName;
    }

    if (categoryIntro) {
      categoryIntro.textContent =
        categoryIntros[normalizeText(categoryName)] ||
        "Chaque seuil ouvre sur une nouvelle parcelle du royaume.";
    }

    buildBreadcrumb(breadcrumb, links, forumName);

    if (sources) {
      sources.remove();
    }
  }


  function initializeLastPostLinks() {
    document
      .querySelectorAll(".litso-topiclist_row")
      .forEach(function (row) {
        var nativeContainer = row.querySelector(
          "[data-litso-topiclist_nativeLastpost]"
        );

        var customLink = row.querySelector(
          ".litso-topiclist_lastpostLink"
        );

        if (!nativeContainer || !customLink) return;

        var nativeLink = nativeContainer.querySelector("a");

        if (nativeLink && nativeLink.href) {
          customLink.href = nativeLink.href;
        }
      });
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
