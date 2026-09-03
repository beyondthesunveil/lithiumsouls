(() => {
  "use strict";

  const LITSO_TABS = {
    systemSelector: ".litso_tabsystem",
    sourceSelector: ":scope > .litso_tabSource",
    titleSelector: ":scope > .litso_tabTitle",

    rearDestinationSelector: ".litso_other",
    profileDestinationSelector: ".litso_profileFields",

    readyAttribute: "data-litso-tabs-ready",

    rearFields: ["feat", "date d'inscription", "messages"],

    profileFields: ["pseudo", "pronoms", "présence", "trigger warning", "tw joués", "infos rp"],

    retryCount: 20,
    retryDelay: 150
  };

  let litsoTabUid = 0;

  function normalizeLitsoLabel(value) {
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

  function createLitsoLabelSet(labels) {
    return new Set(labels.map(normalizeLitsoLabel));
  }

  function moveLitsoFields(system) {
    const rearDestination = system.querySelector(LITSO_TABS.rearDestinationSelector);
    const profileDestination = system.querySelector(LITSO_TABS.profileDestinationSelector);
    const rearLabels = createLitsoLabelSet(LITSO_TABS.rearFields);
    const profileLabels = createLitsoLabelSet(LITSO_TABS.profileFields);

    const fields = Array.from(system.querySelectorAll(".litso_charafield"));

    fields.forEach(field => {
      const labelElement = field.querySelector(".litso_charalabel");
      const label = normalizeLitsoLabel(labelElement?.textContent);

      if (profileDestination && profileLabels.has(label)) {
        profileDestination.appendChild(field);
        return;
      }

      if (rearDestination && rearLabels.has(label)) {
        rearDestination.appendChild(field);
      }
    });
  }

  function getLitsoTabs(system) {
    return Array.from(system.querySelectorAll(":scope > .litso_tabList > .litso_tabButton"));
  }

  function getLitsoPanels(system) {
    return Array.from(system.querySelectorAll(":scope > .litso_tabPanels > .litso_tabPanel"));
  }

  function activateLitsoTab(system, requestedIndex, focusTab = false) {
    const tabs = getLitsoTabs(system);
    const panels = getLitsoPanels(system);

    if (!tabs.length || !panels.length) {
      return;
    }

    const maximumIndex = Math.min(tabs.length, panels.length) - 1;
    const parsedIndex = Number(requestedIndex);

    const index = Math.max(
      0,
      Math.min(Number.isFinite(parsedIndex) ? parsedIndex : 0, maximumIndex)
    );

    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.classList.toggle("litso_tabButtonActive", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel, panelIndex) => {
      const active = panelIndex === index;
      panel.classList.toggle("litso_tabPanelActive", active);
      panel.hidden = !active;
    });

    if (focusTab) {
      tabs[index]?.focus();
    }
  }

  function handleLitsoTabKeyboard(event, system) {
    const currentTab = event.target.closest(".litso_tabButton");
    if (!currentTab) {
      return;
    }

    const tabs = getLitsoTabs(system);
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < 0) {
      return;
    }

    let nextIndex = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    activateLitsoTab(system, nextIndex, true);
  }

  function sanitizeLitsoIconName(value) {
    const icon = String(value || "user-round").trim().toLowerCase();
    return /^[a-z0-9-]+$/.test(icon) ? icon : "user-round";
  }

  function createLitsoTabButton(item, tabId, panelId, index) {
    const tabButton = document.createElement("button");

    tabButton.type = "button";
    tabButton.className = "litso_tabButton";
    tabButton.id = tabId;
    tabButton.dataset.litsoTabIndex = String(index);

    tabButton.setAttribute("role", "tab");
    tabButton.setAttribute("aria-controls", panelId);
    tabButton.setAttribute("aria-selected", "false");
    tabButton.tabIndex = -1;

    if (item.isIconTab) {
      const iconName = sanitizeLitsoIconName(item.icon);

      tabButton.classList.add("litso_tabButtonIcon");
      tabButton.dataset.litsoTooltip = item.accessibleLabel;
      tabButton.setAttribute("aria-label", item.accessibleLabel);
      tabButton.style.setProperty(
        "--litso-tab-icon",
        `url("https://unpkg.com/lucide-static/icons/${iconName}.svg")`
      );
    } else {
      tabButton.textContent = item.label;
    }

    return tabButton;
  }

  function buildLitsoTabSystem(system) {
    if (system.getAttribute(LITSO_TABS.readyAttribute) === "true") {
      return true;
    }

    moveLitsoFields(system);

    const originalPanels = Array.from(system.querySelectorAll(LITSO_TABS.sourceSelector));

    if (!originalPanels.length) {
      return false;
    }

    const items = originalPanels
      .map(panel => {
        const title = panel.querySelector(LITSO_TABS.titleSelector);
        if (!title) {
          return null;
        }

        const label = title.textContent.trim();

        return {
          panel,
          title,
          label,
          isIconTab: panel.classList.contains("litso_tabSourceIcon"),
          icon: panel.dataset.litsoTabIcon || "user-round",
          accessibleLabel: panel.dataset.litsoTabLabel || label || "Informations du joueur",
          initiallyActive: panel.classList.contains("litso_tabSourceActive")
        };
      })
      .filter(Boolean);

    if (!items.length) {
      return false;
    }

    const systemId = `litso-tabs-${++litsoTabUid}`;

    const tabList = document.createElement("div");
    const tabPanels = document.createElement("div");

    tabList.className = "litso_tabList";
    tabList.setAttribute("role", "tablist");

    tabPanels.className = "litso_tabPanels";

    let activeIndex = items.findIndex(item => item.initiallyActive);
    if (activeIndex < 0) {
      activeIndex = 0;
    }

    items.forEach((item, index) => {
      const tabId = `${systemId}-tab-${index}`;
      const panelId = `${systemId}-panel-${index}`;

      const tabButton = createLitsoTabButton(item, tabId, panelId, index);

      item.title.remove();

      item.panel.classList.remove("litso_tabSource", "litso_tabSourceActive", "litso_tabSourceIcon");
      item.panel.classList.add("litso_tabPanel");

      item.panel.id = panelId;
      item.panel.hidden = true;

      item.panel.setAttribute("role", "tabpanel");
      item.panel.setAttribute("aria-labelledby", tabId);

      tabList.appendChild(tabButton);
      tabPanels.appendChild(item.panel);
    });

    system.replaceChildren(tabList, tabPanels);
    system.setAttribute(LITSO_TABS.readyAttribute, "true");

    tabList.addEventListener("click", event => {
      const tabButton = event.target.closest(".litso_tabButton");
      if (!tabButton) {
        return;
      }
      activateLitsoTab(system, tabButton.dataset.litsoTabIndex);
    });

    tabList.addEventListener("keydown", event => {
      handleLitsoTabKeyboard(event, system);
    });

    activateLitsoTab(system, activeIndex);

    return true;
  }

  function initializeAllLitsoTabs() {
    const systems = document.querySelectorAll(LITSO_TABS.systemSelector);
    systems.forEach(buildLitsoTabSystem);
    return systems.length;
  }

  function bootLitsoTabs(attempt = 0) {
    const found = initializeAllLitsoTabs();

    if (!found && attempt < LITSO_TABS.retryCount) {
      setTimeout(() => {
        bootLitsoTabs(attempt + 1);
      }, LITSO_TABS.retryDelay);
      return;
    }

    window.__LITSO_PROFILE_TABS__ = {
      version: "2.2.0",
      systemsFound: found,
      systemsReady: document.querySelectorAll(`[${LITSO_TABS.readyAttribute}="true"]`).length
    };

    console.info("[LITSO PROFILE TABS]", window.__LITSO_PROFILE_TABS__);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      bootLitsoTabs();
    }, { once: true });
  } else {
    bootLitsoTabs();
  }
})();
