(function () {
  "use strict";

  function enhancePostingHeader() {
    const postingBox =
      document.querySelector(
        "#postingbox"
      );

    if (
      !postingBox ||
      postingBox.dataset
        .litsoHeaderReady === "true"
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

      const headerHost =
        inner || postingBox;

      headerHost.insertBefore(
        postingHeader,
        headerHost.firstChild
      );
    }

    if (
      postingHeader &&
      pageTitle &&
      pageTitle !== postingHeader
    ) {
      pageTitle.classList.add(
        "litsoPB_postingHeaderLegacy"
      );
    }

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

    postingBox.dataset
      .litsoHeaderReady = "true";
  }

  function initEditorCounters() {
    const postingBox =
      document.querySelector(
        "#postingbox"
      );

    if (!postingBox) {
      return false;
    }
    
    const messageBox =
      document.querySelector(
        "#postingbox #message-box"
      );

    const textarea =
      document.querySelector(
        "#text_editor_textarea"
      );

    const actions =
      document.querySelector(
        [
          "#postingbox fieldset.submit-buttons",
          'form[name="post"] fieldset.submit-buttons',
          "fieldset.submit-buttons"
        ].join(",")
      );

    if (
      !messageBox ||
      !textarea ||
      !actions
    ) {
      return false;
    }

    let counters =
      document.querySelector(
        ".litsoPB_editorStats"
      );

    if (!counters) {
      counters =
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

      actions.insertBefore(
        counters,
        actions.firstChild
      );
    }

    if (
      counters.dataset
        .litsoCounterReady === "true"
    ) {
      return true;
    }

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

    if (
      !characterCount ||
      !characterLabel ||
      !wordCount ||
      !wordLabel
    ) {
      return false;
    }

    counters.dataset
      .litsoCounterReady = "true";

    function updateCounters(text) {
      const value =
        String(text || "");

      const characters =
        value.length;

      const matchedWords =
        value.trim().match(/\S+/g);

      const words =
        matchedWords
          ? matchedWords.length
          : 0;

      characterCount.textContent =
        String(characters);

      characterLabel.textContent =
        characters === 1
          ? "caractère"
          : "caractères";

      wordCount.textContent =
        String(words);

      wordLabel.textContent =
        words === 1
          ? "mot"
          : "mots";
    }

    textarea.addEventListener(
      "input",
      function () {
        updateCounters(
          textarea.value
        );
      }
    );

    const connectedBodies =
      new WeakSet();

    function connectVisualEditor() {
      const iframe =
        document.querySelector(
          "#postingbox .sceditor-container iframe"
        ) ||
        document.querySelector(
          ".sceditor-container iframe"
        );

      if (!iframe) {
        return;
      }

      function connectIframeBody() {
        try {
          const iframeDocument =
            iframe.contentDocument;

          const iframeBody =
            iframeDocument &&
            iframeDocument.body;

          if (!iframeBody) {
            return;
          }

          if (
            !connectedBodies.has(
              iframeBody
            )
          ) {
            connectedBodies.add(
              iframeBody
            );

            iframeBody.addEventListener(
              "input",
              function () {
                updateCounters(
                  iframeBody.innerText ||
                  iframeBody.textContent ||
                  ""
                );
              }
            );
          }

          if (
            window
              .getComputedStyle(iframe)
              .display !== "none"
          ) {
            updateCounters(
              iframeBody.innerText ||
              iframeBody.textContent ||
              ""
            );
          }
        } catch (error) {
          
        }
      }

      iframe.addEventListener(
        "load",
        connectIframeBody
      );

      connectIframeBody();
    }

    connectVisualEditor();

    if (window.MutationObserver) {
      const editorObserver =
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
              connectVisualEditor();
            }
          }
        );

      editorObserver.observe(
        messageBox,
        {
          childList: true,
          subtree: true
        }
      );
    }

    document.addEventListener(
      "click",
      function (event) {
        const editorButton =
          event.target.closest(
            "#postingbox .sceditor-button"
          );

        if (!editorButton) {
          return;
        }

        window.setTimeout(
          function () {
            const iframe =
              document.querySelector(
                "#postingbox .sceditor-container iframe"
              );

            const iframeIsVisible =
              iframe &&
              window
                .getComputedStyle(iframe)
                .display !== "none";

            if (iframeIsVisible) {
              connectVisualEditor();
            } else {
              updateCounters(
                textarea.value
              );
            }
          },
          100
        );
      }
    );

    updateCounters(
      textarea.value
    );

    return true;
  }

  function initPostingEditor() {
    enhancePostingHeader();

    let counterAttempts = 0;
    const maximumAttempts = 40;

    function tryInitializingCounters() {
      counterAttempts += 1;

      const counterIsReady =
        initEditorCounters();

      if (
        !counterIsReady &&
        counterAttempts <
          maximumAttempts
      ) {
        window.setTimeout(
          tryInitializingCounters,
          100
        );
      }
    }

    tryInitializingCounters();
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
