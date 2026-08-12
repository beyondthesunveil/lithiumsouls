(function () {
  "use strict";

  function initializeCollapsibleSidebar() {
    var sidebar = document.querySelector(
      "[data-collapsible-sidebar]"
    );

    if (!sidebar) {
      return;
    }

    if (
      sidebar.getAttribute("data-sidebar-ready") === "true"
    ) {
      return;
    }

    sidebar.setAttribute("data-sidebar-ready", "true");

    var modules = sidebar.querySelector(".sidebar_top");
    var controls = sidebar.querySelector(".sidebar_bottom");
    var toggle = sidebar.querySelector(".sidebar_toggle");

    if (!modules || !controls || !toggle) {
      return;
    }

    var storageKey = "litso-collapsible-sidebar-open";

    var resizeFrame = null;
    var resizeObserver = null;
    var isOpen = false;

    if (
      window.lucide &&
      typeof window.lucide.createIcons === "function"
    ) {
      window.lucide.createIcons();
    }

    function readStoredState() {
      try {
        return localStorage.getItem(storageKey) === "true";
      } catch (error) {
        return false;
      }
    }

    function storeState(state) {
      try {
        localStorage.setItem(
          storageKey,
          String(state)
        );
      } catch (error) {
        
      }
    }

    function updateMeasurements() {
      var controlsHeight = controls.offsetHeight;

      var availableHeight = Math.max(
        100,
        window.innerHeight - controlsHeight - 96
      );

      var naturalHeight = modules.scrollHeight;

      var displayedHeight = Math.min(
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

      resizeFrame = null;
    }

    function requestMeasurements() {
      if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = requestAnimationFrame(
        updateMeasurements
      );
    }

    function setSidebarState(nextState, saveState) {
      isOpen = Boolean(nextState);

      updateMeasurements();

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

      if (
        "HTMLElement" in window &&
        "inert" in HTMLElement.prototype
      ) {
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

    var observedElements = new WeakSet();

    function observeModuleChildren() {
      if (!resizeObserver) {
        return;
      }

      if (!observedElements.has(controls)) {
        observedElements.add(controls);
        resizeObserver.observe(controls);
      }

      Array.prototype.forEach.call(
        modules.children,
        function (element) {
          if (observedElements.has(element)) {
            return;
          }

          observedElements.add(element);
          resizeObserver.observe(element);
        }
      );
    }

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(function () {
        requestMeasurements();
      });

      observeModuleChildren();
    }

    if ("MutationObserver" in window) {
      var mutationObserver = new MutationObserver(
        function () {
          observeModuleChildren();
          requestMeasurements();
        }
      );

      mutationObserver.observe(modules, {
        childList: true,
        subtree: true
      });
    }

    window.addEventListener(
      "resize",
      requestMeasurements,
      { passive: true }
    );

    window.addEventListener(
      "load",
      requestMeasurements,
      { once: true }
    );

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(
        requestMeasurements
      );
    }

    setSidebarState(
      readStoredState(),
      false
    );

    requestMeasurements();
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
