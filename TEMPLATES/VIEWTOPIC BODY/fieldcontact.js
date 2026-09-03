(() => {
  "use strict";

  const CONTACTS = [
    {
      type: "rps",
      tooltip: "Fiche suivi RPs"
    },
    {
      type: "links",
      tooltip: "Fiche de liens"
    },
    {
      type: "presentation",
      tooltip: "Présentation"
    }
  ];

  function initializeUTPPVBContacts() {
    document
      .querySelectorAll(".utppVB_contFields")
      .forEach(container => {
        if (
          container.dataset.utppvbContactsReady ===
          "true"
        ) {
          return;
        }

        const links = Array.from(
          container.querySelectorAll(":scope > a")
        );

        links.forEach((link, index) => {
          const contact = CONTACTS[index];

          if (!contact) {
            return;
          }

          link.classList.add(
            "utppVB_contField"
          );

          link.dataset.utppvbContact =
            contact.type;

          link.dataset.utppvbTooltip =
            contact.tooltip;

          link.setAttribute(
            "aria-label",
            contact.tooltip
          );

          /*
           * Retrait du tooltip natif.
           */
          link.removeAttribute("title");

          link
            .querySelectorAll("[title]")
            .forEach(element => {
              element.removeAttribute("title");
            });
        });

        container.dataset.utppvbContactsReady =
          "true";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeUTPPVBContacts,
      { once: true }
    );
  } else {
    initializeUTPPVBContacts();
  }
})();
