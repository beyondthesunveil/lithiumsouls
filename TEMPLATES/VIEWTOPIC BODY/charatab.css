(() => {
  "use strict";

  const UTPPVB_TABS = {
    systemSelector: ".utppVB_tabsystem",
    sourceSelector: ":scope > .utppVB_tabSource",
    titleSelector: ":scope > .utppVB_tabTitle",

    rearDestinationSelector: ".utppVB_other",
    profileDestinationSelector: ".utppVB_profileFields",

    readyAttribute: "data-utppvb-tabs-ready",

    rearFields: [
      "feat",
      "date d'inscription",
      "messages"
    ],

    profileFields: [
      "pseudo",
      "pronoms",
      "présence",
      "trigger warning",
      "tw joués",
      "infos rp"
    ],

    retryCount: 20,
    retryDelay: 150
  };

  let utppVBTabUid = 0;

  function normalizeUTPPVBLabel(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\u00a0/g, " ")
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/\s*:\s*$/, "")
      .trim()
      .toLowerCase();
  }

  function createUTPPVBLabelSet(labels) {
    return new Set(
      labels.map(normalizeUTPPVBLabel)
    );
  }

  function moveUTPPVBFields(system) {
    const rearDestination = system.querySelector(
      UTPPVB_TABS.rearDestinationSelector
    );

    const profileDestination = system.querySelector(
      UTPPVB_TABS.profileDestinationSelector
    );

    const rearLabels = createUTPPVBLabelSet(
      UTPPVB_TABS.rearFields
    );

    const profileLabels = createUTPPVBLabelSet(
      UTPPVB_TABS.profileFields
    );

    const fields = Array.from(
      system.querySelectorAll(".utppVB_charafield")
    );

    fields.forEach(field => {
      const labelElement = field.querySelector(
        ".utppVB_charalabel"
      );

      const label = normalizeUTPPVBLabel(
        labelElement?.textContent
      );

      if (
        profileDestination &&
        profileLabels.has(label)
      ) {
        profileDestination.appendChild(field);
        return;
      }

      if (
        rearDestination &&
        rearLabels.has(label)
      ) {
        rearDestination.appendChild(field);
      }
    });
  }

  function getUTPPVBTabs(system) {
    return Array.from(
      system.querySelectorAll(
        ":scope > .utppVB_tabList > .utppVB_tabButton"
      )
    );
  }

  function getUTPPVBPanels(system) {
    return Array.from(
      system.querySelectorAll(
        ":scope > .utppVB_tabPanels > .utppVB_tabPanel"
      )
    );
  }

  function activateUTPPVBTab(
    system,
    requestedIndex,
    focusTab = false
  ) {
    const tabs = getUTPPVBTabs(system);
    const panels = getUTPPVBPanels(system);

    if (!tabs.length || !panels.length) {
      return;
    }

    const maximumIndex =
      Math.min(tabs.length, panels.length) - 1;

    const parsedIndex = Number(requestedIndex);

    const index = Math.max(
      0,
      Math.min(
        Number.isFinite(parsedIndex)
          ? parsedIndex
          : 0,
        maximumIndex
      )
    );

    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;

      tab.classList.toggle(
        "utppVB_tabButtonActive",
        active
      );

      tab.setAttribute(
        "aria-selected",
        String(active)
      );

      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel, panelIndex) => {
      const active = panelIndex === index;

      panel.classList.toggle(
        "utppVB_tabPanelActive",
        active
      );

      panel.hidden = !active;
    });

    if (focusTab) {
      tabs[index]?.focus();
    }
  }

  function handleUTPPVBTabKeyboard(event, system) {
    const currentTab = event.target.closest(
      ".utppVB_tabButton"
    );

    if (!currentTab) {
      return;
    }

    const tabs = getUTPPVBTabs(system);
    const currentIndex = tabs.indexOf(currentTab);

    if (currentIndex < 0) {
      return;
    }

    let nextIndex = null;

    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowDown"
    ) {
      nextIndex =
        (currentIndex + 1) % tabs.length;
    } else if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowUp"
    ) {
      nextIndex =
        (currentIndex - 1 + tabs.length) %
        tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();

    activateUTPPVBTab(
      system,
      nextIndex,
      true
    );
  }

  function sanitizeUTPPVBIconName(value) {
    const icon = String(value || "user-round")
      .trim()
      .toLowerCase();

    return /^[a-z0-9-]+$/.test(icon)
      ? icon
      : "user-round";
  }

  function createUTPPVBTabButton(
    item,
    tabId,
    panelId,
    index
  ) {
    const tabButton =
      document.createElement("button");

    tabButton.type = "button";
    tabButton.className =
      "utppVB_tabButton";

    tabButton.id = tabId;

    tabButton.dataset.utppvbTabIndex =
      String(index);

    tabButton.setAttribute("role", "tab");
    tabButton.setAttribute(
      "aria-controls",
      panelId
    );
    tabButton.setAttribute(
      "aria-selected",
      "false"
    );

    tabButton.tabIndex = -1;

    if (item.isIconTab) {
      const iconName =
        sanitizeUTPPVBIconName(item.icon);

      tabButton.classList.add(
        "utppVB_tabButtonIcon"
      );

      tabButton.dataset.utppvbTooltip =
        item.accessibleLabel;

      tabButton.setAttribute(
        "aria-label",
        item.accessibleLabel
      );

      tabButton.style.setProperty(
        "--utppVB-tab-icon",
        `url("https://unpkg.com/lucide-static/icons/${iconName}.svg")`
      );
    } else {
      tabButton.textContent = item.label;
    }

    return tabButton;
  }

  function buildUTPPVBTabSystem(system) {
    if (
      system.getAttribute(
        UTPPVB_TABS.readyAttribute
      ) === "true"
    ) {
      return true;
    }

    moveUTPPVBFields(system);

    const originalPanels = Array.from(
      system.querySelectorAll(
        UTPPVB_TABS.sourceSelector
      )
    );

    if (!originalPanels.length) {
      return false;
    }

    const items = originalPanels
      .map(panel => {
        const title = panel.querySelector(
          UTPPVB_TABS.titleSelector
        );

        if (!title) {
          return null;
        }

        const label =
          title.textContent.trim();

        return {
          panel,
          title,
          label,

          isIconTab:
            panel.classList.contains(
              "utppVB_tabSourceIcon"
            ),

          icon:
            panel.dataset.utppvbTabIcon ||
            "user-round",

          accessibleLabel:
            panel.dataset.utppvbTabLabel ||
            label ||
            "Informations du joueur",

          initiallyActive:
            panel.classList.contains(
              "utppVB_tabSourceActive"
            )
        };
      })
      .filter(Boolean);

    if (!items.length) {
      return false;
    }

    const systemId =
      `utppVB-tabs-${++utppVBTabUid}`;

    const tabList =
      document.createElement("div");

    const tabPanels =
      document.createElement("div");

    tabList.className =
      "utppVB_tabList";

    tabList.setAttribute(
      "role",
      "tablist"
    );

    tabPanels.className =
      "utppVB_tabPanels";

    let activeIndex = items.findIndex(
      item => item.initiallyActive
    );

    if (activeIndex < 0) {
      activeIndex = 0;
    }

    items.forEach((item, index) => {
      const tabId =
        `${systemId}-tab-${index}`;

      const panelId =
        `${systemId}-panel-${index}`;

      const tabButton =
        createUTPPVBTabButton(
          item,
          tabId,
          panelId,
          index
        );

      item.title.remove();

      item.panel.classList.remove(
        "utppVB_tabSource",
        "utppVB_tabSourceActive",
        "utppVB_tabSourceIcon"
      );

      item.panel.classList.add(
        "utppVB_tabPanel"
      );

      item.panel.id = panelId;
      item.panel.hidden = true;

      item.panel.setAttribute(
        "role",
        "tabpanel"
      );

      item.panel.setAttribute(
        "aria-labelledby",
        tabId
      );

      tabList.appendChild(tabButton);
      tabPanels.appendChild(item.panel);
    });

    system.replaceChildren(
      tabList,
      tabPanels
    );

    system.setAttribute(
      UTPPVB_TABS.readyAttribute,
      "true"
    );

    tabList.addEventListener(
      "click",
      event => {
        const tabButton =
          event.target.closest(
            ".utppVB_tabButton"
          );

        if (!tabButton) {
          return;
        }

        activateUTPPVBTab(
          system,
          tabButton.dataset.utppvbTabIndex
        );
      }
    );

    tabList.addEventListener(
      "keydown",
      event => {
        handleUTPPVBTabKeyboard(
          event,
          system
        );
      }
    );

    activateUTPPVBTab(
      system,
      activeIndex
    );

    return true;
  }

  function initializeAllUTPPVBTabs() {
    const systems =
      document.querySelectorAll(
        UTPPVB_TABS.systemSelector
      );

    systems.forEach(
      buildUTPPVBTabSystem
    );

    return systems.length;
  }

  function bootUTPPVBTabs(attempt = 0) {
    const found =
      initializeAllUTPPVBTabs();

    if (
      !found &&
      attempt < UTPPVB_TABS.retryCount
    ) {
      setTimeout(
        () => {
          bootUTPPVBTabs(attempt + 1);
        },
        UTPPVB_TABS.retryDelay
      );

      return;
    }

    window.__UTPPVB_PROFILE_TABS__ = {
      version: "2.2.0",
      systemsFound: found,
      systemsReady:
        document.querySelectorAll(
          `[${UTPPVB_TABS.readyAttribute}="true"]`
        ).length
    };

    console.info(
      "[UTPPVB PROFILE TABS]",
      window.__UTPPVB_PROFILE_TABS__
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        bootUTPPVBTabs();
      },
      { once: true }
    );
  } else {
    bootUTPPVBTabs();
  }
})();
