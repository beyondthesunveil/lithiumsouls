(function () {
  "use strict";

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );
  }

  function getDirectText(element) {
    return Array.from(
      element.childNodes
    )
      .filter(
        function (node) {
          return (
            node.nodeType ===
            Node.TEXT_NODE
          );
        }
      )
      .map(
        function (node) {
          return node.textContent;
        }
      )
      .join(" ")
      .trim();
  }

  function decorateOptionsPanel(panel) {
    panel
      .querySelectorAll("fieldset")
      .forEach(
        function (fieldset) {
          fieldset.classList.add(
            "litsoPB_optionsFieldset"
          );

          Array.from(
            fieldset.childNodes
          ).forEach(
            function (node) {
              if (
                node.nodeType !==
                Node.TEXT_NODE
              ) {
                return;
              }

              if (
                !normalizeText(
                  node.textContent
                ).includes(
                  "poster le sujet"
                )
              ) {
                return;
              }

              const legend =
                document.createElement(
                  "span"
                );

              legend.className =
                "litsoPB_optionLegend";

              legend.textContent =
                node.textContent.trim();

              node.replaceWith(
                legend
              );
            }
          );

          fieldset
            .querySelectorAll("label")
            .forEach(
              function (choice) {
                const input =
                  choice.querySelector(
                    "input"
                  );

                if (!input) {
                  return;
                }

                choice.classList.add(
                  "litsoPB_optionChoice",
                  "litsoPB_optionChoice--" +
                    input.type
                );
              }
            );
        }
      );
  }

  function decorateOptionsHeader(
  header,
  panel,
  title
) {
  /*
   * Suppression du texte natif direct.
   */

  Array.from(
    header.childNodes
  ).forEach(
    function (node) {
      if (
        node.nodeType ===
        Node.TEXT_NODE
      ) {
        node.remove();
      }
    }
  );


  /* ==================================================
     ICÔNE
     ================================================== */

  const icon =
    document.createElement(
      "span"
    );

  icon.className =
    "litsoPB_optionsHeaderIcon";

  icon.setAttribute(
    "aria-hidden",
    "true"
  );

  icon.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<line x1="4" y1="7" x2="14" y2="7"></line>' +
      '<line x1="18" y1="7" x2="20" y2="7"></line>' +
      '<circle cx="16" cy="7" r="2"></circle>' +
      '<line x1="4" y1="17" x2="8" y2="17"></line>' +
      '<line x1="12" y1="17" x2="20" y2="17"></line>' +
      '<circle cx="10" cy="17" r="2"></circle>' +
    "</svg>";


  /* ==================================================
     LIBELLÉ
     ================================================== */

  const label =
    document.createElement(
      "span"
    );

  label.className =
    "litsoPB_optionsHeaderLabel";

  label.textContent =
    title || "Options";


  header.insertBefore(
    icon,
    header.firstChild
  );

  header.insertBefore(
    label,
    icon.nextSibling
  );


  /* ==================================================
     CLASSES
     ================================================== */

  header.classList.add(
    "litsoPB_optionsHeader"
  );

  panel.classList.add(
    "litsoPB_optionsPanel"
  );


  /*
   * On retire le gestionnaire natif afin
   * d’éviter une double ouverture au clic.
   */

  header.classList.remove(
    "forum-hideable"
  );

  header.removeAttribute(
    "onclick"
  );


  /* ==================================================
     ACCESSIBILITÉ
     ================================================== */

  if (!panel.id) {
    panel.id =
      "litsoPB-options-panel";
  }

  header.setAttribute(
    "role",
    "button"
  );

  header.setAttribute(
    "tabindex",
    "0"
  );

  header.setAttribute(
    "aria-controls",
    panel.id
  );


  /* ==================================================
     ÉTAT DU PANNEAU
     ================================================== */

  function setPanelState(
    isExpanded
  ) {
    panel.hidden =
      !isExpanded;

    header.setAttribute(
      "aria-expanded",
      String(isExpanded)
    );
  }


  /*
   * Le panneau est ouvert au chargement.
   */

  setPanelState(true);


  /* ==================================================
     OUVERTURE ET FERMETURE
     ================================================== */

  function togglePanel() {
    const isExpanded =
      header.getAttribute(
        "aria-expanded"
      ) === "true";

    setPanelState(
      !isExpanded
    );
  }

  header.addEventListener(
    "click",
    togglePanel
  );


  /*
   * Utilisation au clavier :
   * Entrée ou barre d’espace.
   */

  header.addEventListener(
    "keydown",
    function (event) {
      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }

      event.preventDefault();

      togglePanel();
    }
  );


  /* ==================================================
     CONTENU DES OPTIONS
     ================================================== */

  decorateOptionsPanel(
    panel
  );

  header.dataset
    .litsoOptionsReady = "true";
}

  function enhancePostingOptions() {
    const nativeHeaders =
      document.querySelectorAll(
        ".h3.forum-hideable, .h3"
      );

    nativeHeaders.forEach(
      function (header) {
        if (
          header.dataset
            .litsoOptionsReady === "true"
        ) {
          return;
        }

        const directText =
          getDirectText(header);

        if (
          normalizeText(
            directText
          ) !== "options"
        ) {
          return;
        }

        const panel =
          header.nextElementSibling;

        if (
          !panel ||
          !panel.classList.contains(
            "panel"
          )
        ) {
          return;
        }

        decorateOptionsHeader(
          header,
          panel,
          directText
        );
      }
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      enhancePostingOptions,
      {
        once: true
      }
    );
  } else {
    enhancePostingOptions();
  }
})();
