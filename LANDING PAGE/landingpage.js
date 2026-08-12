(function () {
  "use strict";

  function initLitsoPA() {
    var pa = document.getElementById("litso-pa_root");

    if (
      !pa ||
      pa.getAttribute("data-litso-pa_ready") === "true"
    ) {
      return;
    }

    pa.setAttribute("data-litso-pa_ready", "true");

    var plot = pa.querySelector(".litso-pa_plot");

    var plotToggle = pa.querySelector(
      "[data-litso-pa_plot-toggle]"
    );

    var plotReveal = pa.querySelector(
      ".litso-pa_plotreveal"
    );

    if (plot && plotToggle && plotReveal) {
      plotToggle.addEventListener("click", function () {
        var isOpen = plot.classList.toggle("is-open");
        var label = plotToggle.querySelector("span");
        var icon = plotToggle.querySelector("b");

        plotToggle.setAttribute(
          "aria-expanded",
          String(isOpen)
        );

        plotReveal.setAttribute(
          "aria-hidden",
          String(!isOpen)
        );

        if (label) {
          label.textContent = isOpen
            ? "Refermer le récit"
            : "Découvrir l’intrigue";
        }

        if (icon) {
          icon.textContent = isOpen ? "×" : "↗";
        }
      });
    }

    var partnerSelect = pa.querySelector(
      "[data-litso-pa_partner-select]"
    );

    if (partnerSelect) {
      partnerSelect.addEventListener("change", function () {
        var url = partnerSelect.value;

        if (url && url.indexOf("URL_DU_") !== 0) {
          window.open(
            url,
            "_blank",
            "noopener,noreferrer"
          );
        }

        partnerSelect.selectedIndex = 0;
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initLitsoPA
    );
  } else {
    initLitsoPA();
  }
})();
