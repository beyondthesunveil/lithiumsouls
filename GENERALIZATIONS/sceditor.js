(function () {
  "use strict";

  /* ==================================================
     EN-TÊTE DU FORMULAIRE
     ================================================== */

  function enhancePostingHeader() {
    const postingBox =
      document.querySelector(
        "#postingbox"
      );

    if (
      !postingBox ||
      postingBox.dataset.litsoHeaderReady ===
        "true"
    ) {
      return;
    }

    const pageTitle =
      document.querySelector(
        "h1.litso-pagetle, h1.page-title"
      );

    let postingHeader =
      postingBox.querySelector(
        ".litsoPB_postingHeader"
      );

    /*
     * Si l’en-tête interne n’est pas présent
     * dans une variante du template, il est
     * recréé à partir du titre Forumactif.
     */

    if (
      !postingHeader &&
      pageTitle
    ) {
      postingHeader =
        document.createElement("div");

      postingHeader.className =
        "litsoPB_postingHeader";

      postingHeader.textContent =
        pageTitle.textContent.trim();

      const inner =
        postingBox.querySelector(
          ":scope > .inner"
        );

      const host =
        inner || postingBox;

      host.insertBefore(
        postingHeader,
        host.firstChild
      );
    }

    /*
     * Le titre extérieur est masqué uniquement
     * si l’en-tête interne existe réellement.
     */

    if (
      postingHeader &&
      pageTitle &&
      pageTitle !== postingHeader
    ) {
      pageTitle.classList.add(
        "litsoPB_postingHeaderLegacy"
      );
    }

    /*
     * Compatibilité avec l’ancien titre
     * lspb_boxbgtle, s’il est encore présent.
     */

    const oldBoxTitle =
      document.querySelector(
        ".lspb_boxbgtle"
      );

    if (
      postingHeader &&
      oldBoxTitle
    ) {
      oldBoxTitle.classList.add(
        "litsoPB_postingHeaderLegacy"
      );
    }

    postingBox.dataset.litsoHeaderReady =
      "true";
  }


  /* ==================================================
     COMPTEURS DE L’ÉDITEUR
     ================================================== */

  function initEditorCounters() {
    const postingForm =
      document.querySelector(
        'form[name="post"]'
      );

    const postingBox =
      document.querySelector(
        "#postingbox"
      );

    const messageBox =
      postingBox &&
      postingBox.querySelector(
        "#message-box"
      );

    if (
      !postingForm ||
      !postingBox ||
      !messageBox ||
      messageBox.dataset
        .litsoCountersReady === "true"
    ) {
      return;
    }

    /*
     * Les boutons sont recherchés dans tout
     * le formulaire et plus uniquement dans
     * #postingbox.
     */

    const actions =
  postingForm.querySelector(
    "fieldset.submit-buttons"
  );

    const counterHost =
      actions || messageBox;

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
        '<strong data-character-count>0</strong> ' +
        '<span data-character-label>caractères</span>' +
      "</span>" +

      '<span class="litsoPB_editorStat">' +
        '<strong data-word-count>0</strong> ' +
        '<span data-word-label>mots</span>' +
      "</span>";

    counterHost.insertBefore(
      counters,
      counterHost.firstChild
    );

    messageBox.dataset
      .litsoCountersReady = "true";

    const characterCount =
      counters.querySelector(
        "[data-character-count]"
      );

    const characterLabel =
      counters.querySelector(
        "[data-character-label]"
      );

    const wordCount =
      counters.querySelector(
        "[data-word-count]"
      );

    const wordLabel =
      counters.querySelector(
        "[data-word-label]"
      );

    const boundEditors =
      new WeakSet();


    /* ==================================================
       ACTUALISATION DES VALEURS
       ================================================== */

    function updateCounters(text) {
      const value =
        String(text || "");

      const words =
        value.trim().match(/\S+/g);

      const characters =
        value.length;

      const totalWords =
        words
          ? words.length
          : 0;

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


    /* ==================================================
       MODE SOURCE
       ================================================== */

    function bindTextarea(textarea) {
      if (
        boundEditors.has(textarea)
      ) {
        return;
      }

      boundEditors.add(textarea);

      textarea.addEventListener(
        "input",
        function () {
          updateCounters(
            textarea.value
          );
        }
      );
    }


    /* ==================================================
       MODE VISUEL
       ================================================== */

    function bindIframe(iframe) {
      if (
        boundEditors.has(iframe)
      ) {
        return;
      }

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
            function () {
              updateCounters(
                body.innerText ||
                body.textContent ||
                ""
              );
            }
          );

          updateCounters(
            body.innerText ||
            body.textContent ||
            ""
          );
        } catch (error) {
          /*
           * Le compteur du mode source
           * reste disponible.
           */
        }
      }

      boundEditors.add(iframe);

      iframe.addEventListener(
        "load",
        connectIframeBody
      );

      connectIframeBody();
    }


    /* ==================================================
       CONNEXION À SCEDITOR
       ================================================== */

    function connectEditors() {
      messageBox
        .querySelectorAll("textarea")
        .forEach(bindTextarea);

      messageBox
        .querySelectorAll("iframe")
        .forEach(bindIframe);

      const visibleTextarea =
        Array.from(
          messageBox.querySelectorAll(
            "textarea"
          )
        ).find(
          function (textarea) {
            return (
              window
                .getComputedStyle(textarea)
                .display !== "none"
            );
          }
        );

      if (visibleTextarea) {
        updateCounters(
          visibleTextarea.value
        );

        return;
      }

      const visibleIframe =
        Array.from(
          messageBox.querySelectorAll(
            "iframe"
          )
        ).find(
          function (iframe) {
            return (
              window
                .getComputedStyle(iframe)
                .display !== "none"
            );
          }
        );

      if (visibleIframe) {
        bindIframe(visibleIframe);
      }
    }

    connectEditors();


    /* ==================================================
       ÉDITEUR AJOUTÉ APRÈS LE CHARGEMENT
       ================================================== */

    if (window.MutationObserver) {
      const observer =
        new MutationObserver(
          function (mutations) {
            const editorWasAdded =
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

            if (editorWasAdded) {
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
  }


  /* ==================================================
     INITIALISATION
     ================================================== */

  function initPostingEditor() {
    enhancePostingHeader();
    initEditorCounters();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initPostingEditor,
      {
        once: true
      }
    );
  } else {
    initPostingEditor();
  }
})();
