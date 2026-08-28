(function () {
  "use strict";

  /* ==================================================
     COMPTEUR DE MOTS ET DE CARACTÈRES
     ================================================== */

  function initializeLitsoEditorCounter() {
    const postingBox =
      document.querySelector(
        "#postingbox"
      );

    const messageBox =
      postingBox &&
      postingBox.querySelector(
        "#message-box"
      );

    const actions =
      postingBox &&
      postingBox.querySelector(
        "fieldset.submit-buttons"
      );

    if (
      !postingBox ||
      !messageBox ||
      !actions ||
      messageBox.dataset
        .litsoCountersReady === "true"
    ) {
      return;
    }


    /* ================================================
       CRÉATION DU COMPTEUR
       ================================================ */

    const counters =
      document.createElement("div");

    counters.className =
      "litsoPB_editorStats";

    counters.setAttribute(
      "aria-live",
      "polite"
    );

    counters.setAttribute(
      "aria-atomic",
      "true"
    );

    counters.innerHTML =
      '<span class="litsoPB_editorStat">' +
        '<strong data-litso-character-count>0</strong>' +
        '<span data-litso-character-label>caractères</span>' +
      "</span>" +

      '<span class="litsoPB_editorStat">' +
        '<strong data-litso-word-count>0</strong>' +
        '<span data-litso-word-label>mots</span>' +
      "</span>";


    /*
     * Le compteur est placé à gauche
     * des boutons de prévisualisation et d’envoi.
     */

    actions.insertBefore(
      counters,
      actions.firstChild
    );

    messageBox.dataset
      .litsoCountersReady = "true";


    /* ================================================
       ÉLÉMENTS DU COMPTEUR
       ================================================ */

    const characterCount =
      counters.querySelector(
        "[data-litso-character-count]"
      );

    const characterLabel =
      counters.querySelector(
        "[data-litso-character-label]"
      );

    const wordCount =
      counters.querySelector(
        "[data-litso-word-count]"
      );

    const wordLabel =
      counters.querySelector(
        "[data-litso-word-label]"
      );

    const boundEditors =
      new WeakSet();


    /* ================================================
       ACTUALISATION DES DONNÉES
       ================================================ */

    function updateCounters(text) {
      const value =
        String(text || "")
          .replace(/\u00a0/g, " ")
          .replace(/\r/g, "");

      const words =
        value.trim().match(/\S+/g);

      const characters =
        value.length;

      const totalWords =
        words ? words.length : 0;


      characterCount.textContent =
        String(characters);

      characterLabel.textContent =
        characters === 1
          ? "caractère"
          : "caractères";

      wordCount.textContent =
        String(totalWords);

      wordLabel.textContent =
        totalWords === 1
          ? "mot"
          : "mots";
    }


    /* ================================================
       LECTURE DE L’ÉDITEUR ACTIF
       ================================================ */

    function getCurrentEditorText() {
      const iframe =
        messageBox.querySelector(
          ".sceditor-container iframe"
        );

      const textarea =
        messageBox.querySelector(
          ".sceditor-container textarea"
        );


      /*
       * Mode visuel de SCEditor.
       */

      if (
        iframe &&
        window
          .getComputedStyle(iframe)
          .display !== "none"
      ) {
        try {
          const body =
            iframe.contentDocument &&
            iframe.contentDocument.body;

          if (body) {
            return (
              body.innerText ||
              body.textContent ||
              ""
            );
          }
        } catch (error) {
          /*
           * En cas d’impossibilité d’accéder
           * à l’iframe, le textarea prend le relais.
           */
        }
      }


      /*
       * Mode source de SCEditor.
       */

      if (textarea) {
        return textarea.value || "";
      }


      /*
       * Textarea natif avant l’initialisation
       * complète de SCEditor.
       */

      const nativeTextarea =
        messageBox.querySelector(
          'textarea[name="message"]'
        );

      return nativeTextarea
        ? nativeTextarea.value
        : "";
    }


    function updateFromCurrentEditor() {
      updateCounters(
        getCurrentEditorText()
      );
    }


    /* ================================================
       MODE SOURCE
       ================================================ */

    function bindTextarea(textarea) {
      if (
        boundEditors.has(textarea)
      ) {
        return;
      }

      boundEditors.add(textarea);

      textarea.addEventListener(
        "input",
        updateFromCurrentEditor
      );

      textarea.addEventListener(
        "keyup",
        updateFromCurrentEditor
      );

      textarea.addEventListener(
        "change",
        updateFromCurrentEditor
      );

      textarea.addEventListener(
        "paste",
        function () {
          window.setTimeout(
            updateFromCurrentEditor,
            0
          );
        }
      );
    }


    /* ================================================
       MODE VISUEL
       ================================================ */

    function bindIframe(iframe) {
      if (
        boundEditors.has(iframe)
      ) {
        return;
      }

      boundEditors.add(iframe);


      function connectIframeBody() {
        try {
          const body =
            iframe.contentDocument &&
            iframe.contentDocument.body;

          if (
            !body ||
            boundEditors.has(body)
          ) {
            return;
          }

          boundEditors.add(body);

          body.addEventListener(
            "input",
            updateFromCurrentEditor
          );

          body.addEventListener(
            "keyup",
            updateFromCurrentEditor
          );

          body.addEventListener(
            "paste",
            function () {
              window.setTimeout(
                updateFromCurrentEditor,
                0
              );
            }
          );

          updateFromCurrentEditor();
        } catch (error) {
          /*
           * Le compteur du mode source
           * reste disponible.
           */
        }
      }


      iframe.addEventListener(
        "load",
        connectIframeBody
      );

      connectIframeBody();
    }


    /* ================================================
       CONNEXION À SCEDITOR
       ================================================ */

    function connectEditors() {
      const textareas =
        messageBox.querySelectorAll(
          "textarea"
        );

      const iframes =
        messageBox.querySelectorAll(
          "iframe"
        );

      textareas.forEach(
        bindTextarea
      );

      iframes.forEach(
        bindIframe
      );

      updateFromCurrentEditor();
    }


    connectEditors();


    /*
     * Lors du passage entre le mode visuel
     * et le mode source, SCEditor peut modifier
     * ses éléments ou leur affichage.
     */

    messageBox.addEventListener(
      "click",
      function () {
        window.setTimeout(
          function () {
            connectEditors();
            updateFromCurrentEditor();
          },
          0
        );
      }
    );


    /*
     * Surveille uniquement l’apparition ou
     * le remplacement des éléments de SCEditor.
     */

    const observer =
      new MutationObserver(
        function (mutations) {
          const editorWasModified =
            mutations.some(
              function (mutation) {
                return Array.from(
                  mutation.addedNodes
                ).some(
                  function (node) {
                    if (
                      node.nodeType !==
                      Node.ELEMENT_NODE
                    ) {
                      return false;
                    }

                    return (
                      node.matches(
                        [
                          "textarea",
                          "iframe",
                          ".sceditor-container"
                        ].join(",")
                      ) ||
                      Boolean(
                        node.querySelector(
                          [
                            "textarea",
                            "iframe",
                            ".sceditor-container"
                          ].join(",")
                        )
                      )
                    );
                  }
                );
              }
            );

          if (editorWasModified) {
            connectEditors();
          }
        }
      );

    observer.observe(
      messageBox,
      {
        childList: true,
        subtree: true
      }
    );
  }


  /* ==================================================
     INITIALISATION
     ================================================== */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoEditorCounter,
      { once: true }
    );
  } else {
    initializeLitsoEditorCounter();
  }
})();
