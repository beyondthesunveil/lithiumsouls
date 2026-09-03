(() => {
  "use strict";
  const CONTACTS = [
    { type: "rps", tooltip: "Fiche suivi RPs" },
    { type: "links", tooltip: "Fiche de liens" },
    { type: "presentation", tooltip: "Présentation" }
  ];
  function initializeLitsoContacts() {
    document.querySelectorAll(".litso_contFields").forEach(container => {
      if (container.dataset.litsoContactsReady === "true") {
        return;
      }
      const links = Array.from(container.querySelectorAll(":scope > a"));
      links.forEach((link, index) => {
        const contact = CONTACTS[index];
        if (!contact) {
          return;
        }
        link.classList.add("litso_contField");
        link.dataset.litsoContact = contact.type;
        link.dataset.litsoTooltip = contact.tooltip;
        link.setAttribute("aria-label", contact.tooltip);
        link.removeAttribute("title");
        link.querySelectorAll("[title]").forEach(element => {
          element.removeAttribute("title");
        });
      });
      container.dataset.litsoContactsReady = "true";
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLitsoContacts, { once: true });
  } else {
    initializeLitsoContacts();
  }
})();
