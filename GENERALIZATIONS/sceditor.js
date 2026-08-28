(function () {
  "use strict";

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function hideDuplicatePostingHeadings(
    referenceHeading,
    postingBox
  ) {
    const referenceText =
      normalizeText(
        referenceHeading.textContent
      );

    if (!referenceText) {
      return;
    }

    const searchRoot =
      postingBox.parentElement ||
      document.body;

    searchRoot
      .querySelectorAll(
        [
          "h1",
          "h2",
          "h3",
          ".page-title",
          ".topic-title"
        ].join(",")
      )
      .forEach(function (heading) {
        const belongsToReference =
          heading === referenceHeading ||
          referenceHeading.contains(
            heading
          ) ||
          heading.closest(
            ".litsoPB_postingHeader"
          ) === referenceHeading;

        const headingText =
          normalizeText(
            heading.textContent
          );

        if (
          !belongsToReference &&
          headingText === referenceText
        ) {
          heading.classList.add(
            "litsoPB_postingHeaderLegacy"
          );
        }
      });
  }

  function watchForDuplicatePostingHeadings(
    referenceHeading,
    postingBox
  ) {
    if (
      !window.MutationObserver ||
      postingBox.dataset
        .litsoHeaderObserverReady ===
          "true"
    ) {
      return;
    }

    const searchRoot =
      postingBox.parentElement ||
      document.body;

    let scheduled = false;

    const observer =
      new MutationObserver(
        function (mutations) {
          const referenceText =
            normalizeText(
              referenceHeading.textContent
            );

          const duplicateMayExist =
            mutations.some(
              function (mutation) {
                return Array.from(
                  mutation.addedNodes
                ).some(
                  function (node) {
                    if (
                      normalizeText(
                        node.textContent
                      ) === referenceText
                    ) {
                      return true;
                    }

                    if (
                      node.nodeType !==
                      Node.ELEMENT_NODE
                    ) {
                      return false;
                    }

                    return Array.from(
                      node.querySelectorAll(
                        [
                          "h1",
                          "h2",
                          "h3",
                          ".page-title",
                          ".topic-title"
                        ].join(",")
                      )
                    ).some(
                      function (child) {
                        return (
                          normalizeText(
                            child.textContent
                          ) === referenceText
                        );
                      }
                    );
                  }
                );
              }
            );

          if (
            !duplicateMayExist ||
            scheduled
          ) {
            return;
          }

          scheduled = true;

          window.requestAnimationFrame(
            function () {
              hideDuplicatePostingHeadings(
                referenceHeading,
                postingBox
              );

              scheduled = false;
            }
          );
        }
      );

    observer.observe(searchRoot, {
      childList: true,
      subtree: true
    });

    postingBox.dataset
      .litsoHeaderObserverReady = "true";
  }

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

    const internalHeading =
      postingBox.querySelector(
        [
          "h1",
          "h2",
          "h3",
          ".litsoPB_postingHeader"
        ].join(",")
      );

    if (internalHeading) {
      internalHeading.classList.add(
        "litsoPB_postingHeader"
      );

      hideDuplicatePostingHeadings(
        internalHeading,
        postingBox
      );

      watchForDuplicatePostingHeadings(
        internalHeading,
        postingBox
      );

      postingBox.dataset
        .litsoHeaderReady = "true";

      return;
    }

    const possibleHeadings =
      Array.from(
        document.querySelectorAll(
          [
            "h1",
            "h2",
            "h3",
            ".page-title",
            ".topic-title"
          ].join(",")
        )
      ).filter(function (element) {
        if (
          postingBox.contains(element)
        ) {
          return false;
        }

        const position =
          element.compareDocumentPosition(
            postingBox
          );

        const isBeforePostingBox =
          Boolean(
            position &
            Node.DOCUMENT_POSITION_FOLLOWING
          );

        const text =
          normalizeText(
            element.textContent
          );

        const isPostingHeading =
          text.includes("poster") ||
          text.includes("repondre") ||
          text.includes("nouveau sujet") ||
          text.includes("editer") ||
          text.includes("modifier");

        return (
          isBeforePostingBox &&
          isPostingHeading
        );
      });

    const nativeHeading =
      possibleHeadings[
        possibleHeadings.length - 1
      ];

    if (!nativeHeading) {
      postingBox.dataset
        .litsoHeaderReady = "true";

      return;
    }

    const newHeading =
      document.createElement("h3");

    newHeading.className =
      "litsoPB_postingHeader";

    newHeading.textContent =
      nativeHeading.textContent.trim();

    postingBox.insertBefore(
      newHeading,
      postingBox.firstChild
    );

    nativeHeading.classList.add(
      "litsoPB_postingHeaderLegacy"
    );

    hideDuplicatePostingHeadings(
      newHeading,
      postingBox
    );

    watchForDuplicatePostingHeadings(
      newHeading,
      postingBox
    );

    postingBox.dataset
      .litsoHeaderReady = "true";
  }

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

    actions.insertBefore(
      counters,
      actions.firstChild
    );

    messageBox.dataset
      .litsoCountersReady = "true";

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

    function getCurrentEditorText() {
      const iframe =
        messageBox.querySelector(
          ".sceditor-container iframe"
        );

      const textarea =
        messageBox.querySelector(
          ".sceditor-container textarea"
        );

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

        }
      }

      if (textarea) {
        return textarea.value || "";
      }

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
          
        }
      }

      iframe.addEventListener(
        "load",
        connectIframeBody
      );

      connectIframeBody();
    }

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

  function initializeLitsoPostingEditor() {
    enhancePostingHeader();
    initializeLitsoEditorCounter();
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoPostingEditor,
      { once: true }
    );
  } else {
    initializeLitsoPostingEditor();
  }
})();
