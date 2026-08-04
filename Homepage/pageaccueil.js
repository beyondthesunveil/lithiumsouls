(function () {
  "use strict";

  function initAdPortasPA() {
    var pa = document.getElementById("apiPA");

    if (!pa || pa.dataset.apiReady === "true") {
      return;
    }

    pa.dataset.apiReady = "true";

    /* Ouverture et fermeture des informations de l'intrigue. */
    var plot = pa.querySelector(".apiPlot");
    var plotToggle = pa.querySelector("[data-api-plot-toggle]");
    var plotReveal = pa.querySelector(".apiPlotReveal");

    if (plot && plotToggle && plotReveal) {
      plotToggle.addEventListener("click", function () {
        var isOpen = plot.classList.toggle("isOpen");
        var label = plotToggle.querySelector("span");
        var icon = plotToggle.querySelector("b");

        plotToggle.setAttribute("aria-expanded", String(isOpen));
        plotReveal.setAttribute("aria-hidden", String(!isOpen));

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

    /* Ouverture d'un top partenaire depuis le menu déroulant. */
    var partnerSelect = pa.querySelector("[data-api-partner-select]");

    if (partnerSelect) {
      partnerSelect.addEventListener("change", function () {
        var url = partnerSelect.value;

        if (url && url.indexOf("URL_DU_") !== 0) {
          window.open(url, "_blank", "noopener,noreferrer");
        }

        partnerSelect.selectedIndex = 0;
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdPortasPA);
  } else {
    initAdPortasPA();
  }
})();
