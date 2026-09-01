(function () {
  "use strict";

  function initializePartnershipSheet(sheet) {
    if (sheet.getAttribute("data-litso-parto-ready") === "true") {
      return;
    }

    sheet.setAttribute("data-litso-parto-ready", "true");

    var accordions = Array.prototype.slice.call(
      sheet.querySelectorAll(".litso_parto-accordion")
    );

    function closeAccordion(accordion) {
      var summary = accordion.querySelector(
        ".litso_parto-summary"
      );

      accordion.classList.remove("is-open");

      if (summary) {
        summary.setAttribute("aria-expanded", "false");
      }
    }

    function toggleAccordion(accordion) {
      var summary = accordion.querySelector(
        ".litso_parto-summary"
      );

      var shouldOpen = !accordion.classList.contains("is-open");

      accordions.forEach(function (otherAccordion) {
        closeAccordion(otherAccordion);
      });

      if (shouldOpen) {
        accordion.classList.add("is-open");

        if (summary) {
          summary.setAttribute("aria-expanded", "true");
        }
      }
    }

    accordions.forEach(function (accordion) {
      var summary = accordion.querySelector(
        ".litso_parto-summary"
      );

      if (!summary) {
        return;
      }

      summary.addEventListener("click", function () {
        toggleAccordion(accordion);
      });

      summary.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        toggleAccordion(accordion);
      });
    });
  }

  function initializeAllPartnershipSheets() {
    var sheets = document.querySelectorAll(".litso_parto-");

    Array.prototype.forEach.call(
      sheets,
      initializePartnershipSheet
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeAllPartnershipSheets
    );
  } else {
    initializeAllPartnershipSheets();
  }
})();

(function () {
  "use strict";

  function forceTransparentBackground() {
    document.documentElement.style.setProperty(
      "background",
      "transparent",
      "important"
    );

    document.documentElement.style.setProperty(
      "background-color",
      "transparent",
      "important"
    );

    if (document.body) {
      document.body.style.setProperty(
        "background",
        "transparent",
        "important"
      );

      document.body.style.setProperty(
        "background-color",
        "transparent",
        "important"
      );

      document.body.style.setProperty(
        "margin",
        "0",
        "important"
      );

      document.body.style.setProperty(
        "padding",
        "0",
        "important"
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      forceTransparentBackground
    );
  } else {
    forceTransparentBackground();
  }
})();
