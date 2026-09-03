(function () {
  "use strict";

  function initializeLitsoNavbar() {
    var navbar = document.querySelector(
      "[data-litso-nav]"
    );

    if (
      !navbar ||
      navbar.getAttribute(
        "data-litso-nav_ready"
      ) === "true"
    ) {
      return;
    }

    navbar.setAttribute(
      "data-litso-nav_ready",
      "true"
    );

    var linksContainer = navbar.querySelector(
      "[data-litso-nav_links]"
    );

    var member = navbar.querySelector(
      "[data-litso-nav_member]"
    );

    var avatar = navbar.querySelector(
      "[data-litso-nav_avatar]"
    );

    var username = navbar.querySelector(
      "[data-litso-nav_username]"
    );

    var status = navbar.querySelector(
      "[data-litso-nav_status]"
    );

    var personalPanel = document.querySelector(
      "[data-litso-personal]"
    );

    var personalClose = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_close]"
        )
      : null;

    var personalWelcome = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_welcome]"
        )
      : null;

    var personalTabs = personalPanel
      ? personalPanel.querySelectorAll(
          "[data-litso-personal_tab]"
        )
      : [];

    var personalPanels = personalPanel
      ? personalPanel.querySelectorAll(
          "[data-litso-personal_panel]"
        )
      : [];

    var notesField = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_notes]"
        )
      : null;

    var saveStatus = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_save_status]"
        )
      : null;

    var characterCounter = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_characters]"
        )
      : null;

    var taskForm = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_task_form]"
        )
      : null;

    var taskInput = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_task_input]"
        )
      : null;

    var taskPriorityInput = null;

    var taskList = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_task_list]"
        )
      : null;

    var taskCount = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_count]"
        )
      : null;

    var taskProgress = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_progress]"
        )
      : null;

    var remainingLabel = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_remaining]"
        )
      : null;

    var emptyState = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_empty]"
        )
      : null;

    var taskFooter = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_task_footer]"
        )
      : null;

    var clearCompleted = personalPanel
      ? personalPanel.querySelector(
          "[data-litso-personal_clear]"
        )
      : null;


    /* =====================================================
       CRÉATION DES OPTIONS DE PRIORITÉ
       ===================================================== */

    function createPriorityOption(
      value,
      label
    ) {
      var option = document.createElement(
        "option"
      );

      option.value = value;
      option.textContent = label;

      return option;
    }


    /* =====================================================
       AJOUT DU SÉLECTEUR AU FORMULAIRE
       ===================================================== */

    function prepareTaskComposer() {
      if (!taskForm || !taskInput) {
        return;
      }

      var composer = taskInput.closest(
        ".litso-personal_taskComposer"
      );

      if (!composer) {
        return;
      }

      taskPriorityInput = composer.querySelector(
        "[data-litso-personal_task_priority]"
      );

      if (taskPriorityInput) {
        return;
      }

      taskPriorityInput = document.createElement(
        "select"
      );

      taskPriorityInput.className =
        "litso-personal_taskPrioritySelect";

      taskPriorityInput.setAttribute(
        "data-litso-personal_task_priority",
        ""
      );

      taskPriorityInput.setAttribute(
        "aria-label",
        "Priorité de la nouvelle tâche"
      );

      taskPriorityInput.appendChild(
        createPriorityOption(
          "normal",
          "Courant"
        )
      );

      taskPriorityInput.appendChild(
        createPriorityOption(
          "important",
          "Important"
        )
      );

      taskPriorityInput.appendChild(
        createPriorityOption(
          "urgent",
          "Urgent"
        )
      );

      var submitButton = composer.querySelector(
        'button[type="submit"], button'
      );

      composer.insertBefore(
        taskPriorityInput,
        submitButton || null
      );
    }

    prepareTaskComposer();


    /* =====================================================
       DÉCORATION DES LIENS DE NAVIGATION
       ===================================================== */

    function decorateLinks() {
      if (!linksContainer) {
        return;
      }

      var links =
        linksContainer.querySelectorAll(
          "a.mainmenu"
        );

      Array.prototype.forEach.call(
        links,
        function (link) {
          if (
            link.querySelector(".link-text")
          ) {
            return;
          }

          var text = link.textContent.trim();

          if (!text) {
            return;
          }

          link.textContent = "";

          var label =
            document.createElement("span");

          label.className = "link-text";
          label.textContent = text;

          link.appendChild(label);
        }
      );
    }

    decorateLinks();

    if (
      linksContainer &&
      "MutationObserver" in window
    ) {
      var linkObserver =
        new MutationObserver(
          decorateLinks
        );

      linkObserver.observe(
        linksContainer,
        {
          childList: true,
          subtree: true
        }
      );
    }


    /* =====================================================
       INFORMATIONS DU MEMBRE
       ===================================================== */

    function extractAvatarSource(value) {
      if (
        typeof value !== "string" ||
        !value.trim()
      ) {
        return "";
      }

      var content = value.trim();

      if (content.charAt(0) === "<") {
        var template =
          document.createElement(
            "template"
          );

        template.innerHTML = content;

        var image =
          template.content.querySelector(
            "img"
          );

        return image
          ? image.getAttribute("src") || ""
          : "";
      }

      return content;
    }

    var userData = window._userdata || {};

    var loggedIn =
      userData.session_logged_in === true ||
      userData.session_logged_in === 1 ||
      userData.session_logged_in === "1";

    var displayName =
      loggedIn && userData.username
        ? String(userData.username)
        : "Invité";

    var userIdentifier =
      userData.user_id ||
      userData.userid ||
      displayName;

    var personalStorageKey =
      "litso-personal-user-" +
      String(userIdentifier);

    if (username) {
      username.textContent = displayName;
    }

    if (status) {
      status.textContent = loggedIn
        ? "Ouvrir mon espace"
        : "Bienvenue sur le forum";
    }

    if (
      personalWelcome &&
      loggedIn
    ) {
      personalWelcome.textContent =
        "Les apartés de " +
        displayName +
        ".";
    }

    var avatarSource =
      extractAvatarSource(
        userData.avatar
      );

    if (
      avatar &&
      loggedIn &&
      avatarSource
    ) {
      avatar.textContent = "";

      var avatarImage =
        document.createElement("img");

      avatarImage.src = avatarSource;
      avatarImage.alt = "";
      avatarImage.loading = "eager";

      avatar.appendChild(avatarImage);
    }


    /* =====================================================
       DONNÉES PERSONNELLES
       ===================================================== */

    var personalData = {
      notes: "",
      tasks: [],
      activeTab: "notes"
    };

    var noteSaveTimer = null;
    var panelCloseTimer = null;


    /* =====================================================
       CHARGEMENT DES DONNÉES
       ===================================================== */

    function loadPersonalData() {
      if (!loggedIn) {
        return;
      }

      try {
        var storedValue =
          window.localStorage.getItem(
            personalStorageKey
          );

        if (!storedValue) {
          return;
        }

        var parsedValue =
          JSON.parse(storedValue);

        if (
          parsedValue &&
          typeof parsedValue === "object"
        ) {
          personalData.notes =
            typeof parsedValue.notes ===
            "string"
              ? parsedValue.notes
              : "";

          personalData.tasks =
            Array.isArray(
              parsedValue.tasks
            )
              ? parsedValue.tasks
              : [];

          personalData.activeTab =
            parsedValue.activeTab ===
            "tasks"
              ? "tasks"
              : "notes";
        }
      } catch (error) {
        personalData = {
          notes: "",
          tasks: [],
          activeTab: "notes"
        };
      }
    }


    /* =====================================================
       SAUVEGARDE DES DONNÉES
       ===================================================== */

    function savePersonalData() {
      if (!loggedIn) {
        return;
      }

      try {
        window.localStorage.setItem(
          personalStorageKey,
          JSON.stringify(personalData)
        );
      } catch (error) {
        if (saveStatus) {
          saveStatus.textContent =
            "Sauvegarde impossible";
        }
      }
    }


    /* =====================================================
       OUVERTURE ET FERMETURE DU PANNEAU
       ===================================================== */

    function setPersonalPanel(open) {
      if (
        !loggedIn ||
        !member ||
        !personalPanel
      ) {
        return;
      }

      if (panelCloseTimer) {
        window.clearTimeout(
          panelCloseTimer
        );

        panelCloseTimer = null;
      }

      if (open) {
        personalPanel.hidden = false;

        personalPanel.setAttribute(
          "aria-hidden",
          "false"
        );

        member.setAttribute(
          "aria-expanded",
          "true"
        );

        document.documentElement
          .classList.add(
            "litso-personal-open"
          );

        window.requestAnimationFrame(
          function () {
            personalPanel.classList.add(
              "is-open"
            );
          }
        );
      } else {
        personalPanel.classList.remove(
          "is-open"
        );

        personalPanel.setAttribute(
          "aria-hidden",
          "true"
        );

        member.setAttribute(
          "aria-expanded",
          "false"
        );

        document.documentElement
          .classList.remove(
            "litso-personal-open"
          );

        panelCloseTimer =
          window.setTimeout(
            function () {
              if (
                member.getAttribute(
                  "aria-expanded"
                ) !== "true"
              ) {
                personalPanel.hidden =
                  true;
              }
            },
            450
          );
      }
    }


    /* =====================================================
       COMPORTEMENT DU BOUTON MEMBRE
       ===================================================== */

    if (member) {
      if (loggedIn) {
        member.href =
          "#litso-personal-panel";

        member.setAttribute(
          "aria-label",
          "Ouvrir l’espace personnel de " +
            displayName
        );

        member.setAttribute(
          "aria-controls",
          "litso-personal-panel"
        );

        member.setAttribute(
          "aria-expanded",
          "false"
        );

        member.addEventListener(
          "click",
          function (event) {
            event.preventDefault();

            var currentlyOpen =
              member.getAttribute(
                "aria-expanded"
              ) === "true";

            setPersonalPanel(
              !currentlyOpen
            );
          }
        );
      } else {
        member.href = "/login";

        member.setAttribute(
          "aria-label",
          "Se connecter au forum"
        );

        member.removeAttribute(
          "aria-controls"
        );

        member.removeAttribute(
          "aria-expanded"
        );
      }
    }

    if (personalPanel) {
      personalPanel.hidden = true;

      personalPanel.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    if (personalClose) {
      personalClose.addEventListener(
        "click",
        function () {
          setPersonalPanel(false);
        }
      );
    }

    document.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Escape") {
          setPersonalPanel(false);
        }
      }
    );


    /* =====================================================
       GESTION DES ONGLETS
       ===================================================== */

    function activatePersonalTab(
      tabName,
      save
    ) {
      var selectedTab =
        tabName === "tasks"
          ? "tasks"
          : "notes";

      Array.prototype.forEach.call(
        personalTabs,
        function (tab) {
          var active =
            tab.getAttribute(
              "data-litso-personal_tab"
            ) === selectedTab;

          tab.classList.toggle(
            "is-active",
            active
          );

          tab.setAttribute(
            "aria-selected",
            active
              ? "true"
              : "false"
          );
        }
      );

      Array.prototype.forEach.call(
        personalPanels,
        function (panel) {
          var active =
            panel.getAttribute(
              "data-litso-personal_panel"
            ) === selectedTab;

          panel.classList.toggle(
            "is-active",
            active
          );

          panel.hidden = !active;
        }
      );

      personalData.activeTab =
        selectedTab;

      if (save !== false) {
        savePersonalData();
      }
    }

    Array.prototype.forEach.call(
      personalTabs,
      function (tab) {
        tab.addEventListener(
          "click",
          function () {
            activatePersonalTab(
              tab.getAttribute(
                "data-litso-personal_tab"
              )
            );
          }
        );
      }
    );


    /* =====================================================
       COMPTEUR DE CARACTÈRES
       ===================================================== */

    function updateCharacterCounter() {
      if (
        !notesField ||
        !characterCounter
      ) {
        return;
      }

      var length =
        notesField.value.length;

      characterCounter.textContent =
        length +
        (
          length > 1
            ? " caractères"
            : " caractère"
        );
    }


    /* =====================================================
       SAUVEGARDE AUTOMATIQUE DES NOTES
       ===================================================== */

    function scheduleNoteSave() {
      if (!notesField) {
        return;
      }

      personalData.notes =
        notesField.value;

      updateCharacterCounter();

      if (saveStatus) {
        saveStatus.textContent =
          "Sauvegarde…";
      }

      if (noteSaveTimer) {
        window.clearTimeout(
          noteSaveTimer
        );
      }

      noteSaveTimer =
        window.setTimeout(
          function () {
            savePersonalData();

            if (saveStatus) {
              saveStatus.textContent =
                "Sauvegardé";
            }
          },
          400
        );
    }

    if (notesField) {
      notesField.addEventListener(
        "input",
        scheduleNoteSave
      );
    }


    /* =====================================================
       IDENTIFIANT UNIQUE DES TÂCHES
       ===================================================== */

    function createTaskIdentifier() {
      return (
        String(
          new Date().getTime()
        ) +
        "-" +
        String(
          Math.floor(
            Math.random() * 100000
          )
        )
      );
    }


    /* =====================================================
       MISE À NIVEAU DES ANCIENNES TÂCHES
       ===================================================== */

    function normalizeTasks() {
      personalData.tasks =
        personalData.tasks
          .filter(
            function (task) {
              return (
                task &&
                typeof task.text ===
                  "string"
              );
            }
          )
          .map(
            function (task) {
              return {
                id:
                  task.id ||
                  createTaskIdentifier(),

                text: task.text,

                completed:
                  task.completed === true,

                priority:
                  task.priority ===
                    "urgent" ||
                  task.priority ===
                    "important"
                    ? task.priority
                    : "normal"
              };
            }
          );
    }


    /* =====================================================
       CRÉATION D’UNE TÂCHE
       ===================================================== */

    function createTaskElement(task) {
      var taskElement =
        document.createElement("div");

      taskElement.className =
        "litso-personal_task " +
        "is-priority-" +
        task.priority;

      if (task.completed) {
        taskElement.classList.add(
          "is-completed"
        );
      }

      taskElement.setAttribute(
        "data-task-id",
        task.id
      );


      /* Case à cocher */

      var taskCheckbox =
        document.createElement("label");

      taskCheckbox.className =
        "litso-personal_checkbox";

      var checkboxInput =
        document.createElement("input");

      checkboxInput.type = "checkbox";
      checkboxInput.checked =
        task.completed;

      checkboxInput.setAttribute(
        "aria-label",
        task.completed
          ? "Remettre la tâche en cours"
          : "Marquer la tâche comme terminée"
      );

      var checkboxVisual =
        document.createElement("span");


      /* Texte de la tâche */

      var taskText =
        document.createElement("span");

      taskText.className =
        "litso-personal_taskText";

      taskText.textContent =
        task.text;


      /* Priorité de la tâche */

      var prioritySelect =
        document.createElement("select");

      prioritySelect.className =
        "litso-personal_taskPriority";

      prioritySelect.setAttribute(
        "aria-label",
        "Modifier la priorité de " +
          task.text
      );

      prioritySelect.appendChild(
        createPriorityOption(
          "normal",
          "Courant"
        )
      );

      prioritySelect.appendChild(
        createPriorityOption(
          "important",
          "Important"
        )
      );

      prioritySelect.appendChild(
        createPriorityOption(
          "urgent",
          "Urgent"
        )
      );

      prioritySelect.value =
        task.priority;


      /* Bouton de suppression */

      var deleteButton =
        document.createElement("button");

      deleteButton.className =
        "litso-personal_taskDelete";

      deleteButton.type = "button";
      deleteButton.title =
        "Supprimer la tâche";

      deleteButton.setAttribute(
        "aria-label",
        "Supprimer la tâche"
      );

      var deleteIcon =
        document.createElement("i");

      deleteIcon.className =
        "ion-close-round";


      /* Assemblage */

      taskCheckbox.appendChild(
        checkboxInput
      );

      taskCheckbox.appendChild(
        checkboxVisual
      );

      deleteButton.appendChild(
        deleteIcon
      );

      taskElement.appendChild(
        taskCheckbox
      );

      taskElement.appendChild(
        taskText
      );

      taskElement.appendChild(
        prioritySelect
      );

      taskElement.appendChild(
        deleteButton
      );


      /* Changement d’état */

      checkboxInput.addEventListener(
        "change",
        function () {
          task.completed =
            checkboxInput.checked;

          savePersonalData();
          renderTasks();
        }
      );


      /* Changement de priorité */

      prioritySelect.addEventListener(
        "change",
        function () {
          task.priority =
            prioritySelect.value;

          savePersonalData();
          renderTasks();
        }
      );


      /* Suppression */

      deleteButton.addEventListener(
        "click",
        function () {
          personalData.tasks =
            personalData.tasks.filter(
              function (storedTask) {
                return (
                  storedTask.id !==
                  task.id
                );
              }
            );

          savePersonalData();
          renderTasks();
        }
      );

      return taskElement;
    }


    /* =====================================================
       CRÉATION D’UN GROUPE DE TÂCHES
       ===================================================== */

    function createTaskGroup(
      title,
      tasks,
      state
    ) {
      var group =
        document.createElement(
          "section"
        );

      group.className =
        "litso-personal_taskGroup " +
        "is-" +
        state;

      var header =
        document.createElement("div");

      header.className =
        "litso-personal_taskGroupHeader";

      var label =
        document.createElement("span");

      label.textContent = title;

      var counter =
        document.createElement("strong");

      counter.textContent =
        String(tasks.length);

      var list =
        document.createElement("div");

      list.className =
        "litso-personal_taskGroupList";

      header.appendChild(label);
      header.appendChild(counter);

      tasks.forEach(
        function (task) {
          list.appendChild(
            createTaskElement(task)
          );
        }
      );

      group.appendChild(header);
      group.appendChild(list);

      return group;
    }


    /* =====================================================
       AFFICHAGE DES TÂCHES
       ===================================================== */

    function renderTasks() {
      if (!taskList) {
        return;
      }

      taskList.textContent = "";

      var currentTasks =
        personalData.tasks.filter(
          function (task) {
            return !task.completed;
          }
        );

      var completedTasks =
        personalData.tasks.filter(
          function (task) {
            return task.completed;
          }
        );

      var total =
        personalData.tasks.length;

      var completed =
        completedTasks.length;

      var remaining =
        currentTasks.length;


      /* Groupe des tâches en cours */

      if (total > 0) {
        taskList.appendChild(
          createTaskGroup(
            "En cours",
            currentTasks,
            "current"
          )
        );
      }


      /* Groupe des tâches terminées */

      if (completedTasks.length) {
        taskList.appendChild(
          createTaskGroup(
            "Terminé",
            completedTasks,
            "completed"
          )
        );
      }


      /* Compteurs */

      if (taskCount) {
        taskCount.textContent =
          String(remaining);
      }

      if (taskProgress) {
        taskProgress.textContent =
          completed +
          " / " +
          total;
      }

      if (remainingLabel) {
        remainingLabel.textContent =
          remaining +
          (
            remaining > 1
              ? " tâches restantes"
              : " tâche restante"
          );
      }


      /* État vide et pied du module */

      if (emptyState) {
        emptyState.hidden =
          total > 0;
      }

      if (taskFooter) {
        taskFooter.hidden =
          total === 0;
      }

      if (clearCompleted) {
        clearCompleted.hidden =
          completed === 0;
      }
    }


    /* =====================================================
       AJOUT D’UNE NOUVELLE TÂCHE
       ===================================================== */

    function addTask(
      text,
      priority
    ) {
      var cleanText = text
        .replace(/\s+/g, " ")
        .trim();

      if (!cleanText) {
        return;
      }

      personalData.tasks.unshift({
        id: createTaskIdentifier(),
        text: cleanText,
        completed: false,

        priority:
          priority === "urgent" ||
          priority === "important"
            ? priority
            : "normal"
      });

      savePersonalData();
      renderTasks();
    }


    /* =====================================================
       SOUMISSION DU FORMULAIRE
       ===================================================== */

    if (
      taskForm &&
      taskInput
    ) {
      taskForm.addEventListener(
        "submit",
        function (event) {
          event.preventDefault();

          addTask(
            taskInput.value,
            taskPriorityInput
              ? taskPriorityInput.value
              : "normal"
          );

          taskInput.value = "";

          if (taskPriorityInput) {
            taskPriorityInput.value =
              "normal";
          }

          taskInput.focus();
        }
      );
    }


    /* =====================================================
       SUPPRESSION DES TÂCHES TERMINÉES
       ===================================================== */

    if (clearCompleted) {
      clearCompleted.addEventListener(
        "click",
        function () {
          personalData.tasks =
            personalData.tasks.filter(
              function (task) {
                return !task.completed;
              }
            );

          savePersonalData();
          renderTasks();
        }
      );
    }


    /* =====================================================
       INITIALISATION DES DONNÉES
       ===================================================== */

    if (loggedIn) {
      loadPersonalData();
      normalizeTasks();

      /*
       * Enregistre également les anciennes
       * tâches après leur mise à niveau.
       */
      savePersonalData();

      if (notesField) {
        notesField.value =
          personalData.notes;
      }

      updateCharacterCounter();
      renderTasks();

      activatePersonalTab(
        personalData.activeTab,
        false
      );
    }
  }


  /* =======================================================
     INITIALISATION GÉNÉRALE
     ======================================================= */

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoNavbar,
      { once: true }
    );
  } else {
    initializeLitsoNavbar();
  }
})();
