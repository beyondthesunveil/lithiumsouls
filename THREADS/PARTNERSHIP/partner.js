(function () {
  "use strict";

  function initializePartnershipSheet(sheet) {
    if (sheet.dataset.litsoPartoReady === "true") {
      return;
    }

    sheet.dataset.litsoPartoReady = "true";

    var accordions = Array.prototype.slice.call(
      sheet.querySelectorAll(".litso_parto-accordion")
    );

    accordions.forEach(function (accordion) {
      accordion.addEventListener("toggle", function () {
        if (!accordion.open) {
          return;
        }

        accordions.forEach(function (otherAccordion) {
          if (otherAccordion !== accordion) {
            otherAccordion.open = false;
          }
        });
      });
    });
  }

  function initializeAllPartnershipSheets() {
    document
      .querySelectorAll(".litso_parto-")
      .forEach(initializePartnershipSheet);
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
