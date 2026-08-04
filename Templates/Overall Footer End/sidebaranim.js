(function () {
  "use strict";

  function initializeCollapsibleSidebar() {
    const sidebar = document.querySelector("[data-collapsible-sidebar]");
    if (!sidebar) return;

    const modules = sidebar.querySelector(".sidebar_top");
    const controls = sidebar.querySelector(".sidebar_bottom");
    const toggle = sidebar.querySelector(".sidebar_toggle");

    if (!modules || !controls || !toggle) return;

    const storageKey = "utpp-collapsible-sidebar-open";

    let resizeFrame = null;
    let isOpen = false;

    /* ---------------------------------------------
       Lucide
       --------------------------------------------- */

    if (window.lucide) {
      window.lucide.createIcons();
    }

    /* ---------------------------------------------
       Stockage sécurisé
       --------------------------------------------- */

    function readStoredState() {
      try {
        return localStorage.getItem(storageKey) === "true";
      } catch (error) {
        return false;
      }
    }

    function storeState(state) {
      try {
        localStorage.setItem(storageKey, String(state));
      } catch (error) {
        /* Le fonctionnement reste intact sans localStorage. */
      }
    }

    /* ---------------------------------------------
       Calcul de la hauteur disponible
       --------------------------------------------- */

    function measureModules() {
      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = requestAnimationFrame(function () {
        const controlsHeight = controls.offsetHeight;

        /*
         * On conserve de l’espace pour :
         * - la marge basse ;
         * - la marge haute ;
         * - les paddings de la capsule ;
         * - l’espace entre modules et commandes.
         */
        const availableHeight = Math.max(
          100,
          window.innerHeight - controlsHeight - 96
        );

        const naturalHeight = modules.scrollHeight;
        const displayedHeight = Math.min(
          naturalHeight,
          availableHeight
        );

        sidebar.style.setProperty(
          "--sidebar-modules-height",
          displayedHeight + "px"
        );

        sidebar.classList.toggle(
          "has-modules-overflow",
          naturalHeight > availableHeight
        );
      });
    }

    /* ---------------------------------------------
       Ouverture / fermeture
       --------------------------------------------- */

    function setSidebarState(nextState, saveState) {
      isOpen = Boolean(nextState);

      /*
       * La hauteur est calculée avant l’ouverture
       * afin que l’animation démarre immédiatement.
       */
      measureModules();

      sidebar.classList.toggle("is-open", isOpen);

      toggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      toggle.setAttribute(
        "aria-label",
        isOpen
          ? "Fermer la barre latérale"
          : "Ouvrir la barre latérale"
      );

      toggle.setAttribute(
        "title",
        isOpen
          ? "Fermer la barre latérale"
          : "Ouvrir la barre latérale"
      );

      modules.setAttribute(
        "aria-hidden",
        String(!isOpen)
      );

      /*
       * Empêche la navigation au clavier dans
       * les modules lorsqu’ils sont repliés.
       */
      if ("inert" in modules) {
        modules.inert = !isOpen;
      }

      if (saveState !== false) {
        storeState(isOpen);
      }
    }

    toggle.addEventListener("click", function () {
      setSidebarState(!isOpen, true);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen) {
        setSidebarState(false, true);
        toggle.focus();
      }
    });

    /* ---------------------------------------------
       Éléments chargés dynamiquement
       --------------------------------------------- */

    const observedElements = new WeakSet();

    let resizeObserver = null;

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(function () {
        measureModules();
      });
    }

    function observeModuleChildren() {
      if (!resizeObserver) return;

      resizeObserver.observe(controls);

      Array.from(modules.children).forEach(function (element) {
        if (observedElements.has(element)) return;

        observedElements.add(element);
        resizeObserver.observe(element);
      });
    }

    const mutationObserver = new MutationObserver(function () {
      observeModuleChildren();
      measureModules();
    });

    mutationObserver.observe(modules, {
      childList: true,
      subtree: true
    });

    observeModuleChildren();

    window.addEventListener(
      "resize",
      measureModules,
      { passive: true }
    );

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measureModules);
    }

    /* ---------------------------------------------
       État initial
       --------------------------------------------- */

    setSidebarState(readStoredState(), false);

    requestAnimationFrame(function () {
      measureModules();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeCollapsibleSidebar,
      { once: true }
    );
  } else {
    initializeCollapsibleSidebar();
  }
})();
