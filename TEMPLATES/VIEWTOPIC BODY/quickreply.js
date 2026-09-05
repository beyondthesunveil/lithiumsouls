(function () {
  "use strict";

  const RANDOM_ICONS = [
    "sparkles",
    "orbit",
    "flame",
    "zap",
    "ghost",
    "gem",
    "moon-star",
    "rocket",
    "bot",
    "skull",
    "wand-sparkles",
    "scan-eye"
  ];

  const QUICK_REPLY_COPY = {
    eyebrow: "Discussion",
    title: "Écrire une réponse",
    subtitle: "Partagez votre message avec la communauté.",
    placeholder: "Écrivez votre réponse…",
    preview: "Aperçu",
    send: "Envoyer"
  };

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function setRandomTitleIcons() {
    const elements =
      document.querySelectorAll(
        "[data-random-lucide]"
      );

    elements.forEach(
      function (element) {
        const randomIndex =
          Math.floor(
            Math.random() *
            RANDOM_ICONS.length
          );

        element.setAttribute(
          "data-lucide",
          RANDOM_ICONS[randomIndex]
        );
      }
    );
  }

  function enhancePaginations() {
    const paginations =
      document.querySelectorAll(
        ".litso_pages"
      );

    paginations.forEach(
      function (pagination) {
        if (
          pagination.dataset
            .paginationReady === "true"
        ) {
          return;
        }

        const currentPage =
          pagination.querySelector(
            "strong"
          );

        if (!currentPage) {
          return;
        }

        const currentNumber =
          currentPage.textContent.trim();

        const pageList =
          document.createElement(
            "div"
          );

        const currentBlock =
          document.createElement(
            "div"
          );

        const label =
          document.createElement(
            "span"
          );

        const number =
          document.createElement(
            "span"
          );

        pageList.className =
          "litso_pages__list";

        currentBlock.className =
          "litso_pages__current";

        label.className =
          "litso_pages__label";

        number.className =
          "litso_pages__number";

        label.textContent =
          "Page actuelle";

        number.textContent =
          currentNumber;

        currentBlock.setAttribute(
          "aria-label",
          "Page actuelle : " +
            currentNumber
        );

        currentBlock.append(
          label,
          number
        );

        while (
          pagination.firstChild
        ) {
          pageList.appendChild(
            pagination.firstChild
          );
        }

        pagination.append(
          currentBlock,
          pageList
        );

        pagination.dataset
          .paginationReady = "true";
      }
    );
  }

  function updateWatchTopicStates() {
    const watchBlocks =
      document.querySelectorAll(
        ".litso_watchtopicBG"
      );

    watchBlocks.forEach(
      function (watchBlock) {
        const watchLink =
          watchBlock.querySelector("a");

        if (!watchLink) {
          return;
        }

        const linkText =
          normalizeText(
            watchLink.textContent
          );

        const linkHref = (
          watchLink.getAttribute(
            "href"
          ) || ""
        ).toLowerCase();

        const isWatching =
          linkText.includes(
            "arreter"
          ) ||
          linkText.includes(
            "ne plus surveiller"
          ) ||
          linkText.includes(
            "stop watching"
          ) ||
          linkHref.includes(
            "unwatch"
          );

        watchBlock.classList.toggle(
          "is-watching",
          isWatching
        );

        watchLink.setAttribute(
          "aria-pressed",
          String(isWatching)
        );
      }
    );
  }

  function enhanceTopicParticipants() {
    const participants =
      document.querySelector(
        ".sub-header-buttons__right"
      );

    if (
      !participants ||
      participants.dataset
        .participantsReady === "true"
    ) {
      return;
    }

    const posters =
      participants.querySelectorAll(
        ".posts-users-list > .poster"
      );

    if (posters.length <= 1) {
      participants.hidden = true;

      participants.dataset
        .participantsReady = "true";

      return;
    }

    const nativeCount =
      participants.querySelector(
        ".poster-count"
      );

    if (nativeCount) {
      nativeCount.hidden = true;
    }

    let tooltip =
      document.querySelector(
        "#litso-participant-tooltip"
      );

    if (!tooltip) {
      tooltip =
        document.createElement(
          "div"
        );

      tooltip.id =
        "litso-participant-tooltip";

      tooltip.className =
        "litso_participant-tooltip";

      tooltip.setAttribute(
        "role",
        "tooltip"
      );

      tooltip.hidden = true;

      document.body.appendChild(
        tooltip
      );
    }

    function showTooltip(poster) {
      const participantName =
        poster.dataset
          .participantName;

      if (!participantName) {
        return;
      }

      tooltip.textContent =
        participantName;

      tooltip.hidden = false;

      tooltip.classList.remove(
        "is-visible",
        "is-below"
      );

      requestAnimationFrame(
        function () {
          const posterRect =
            poster.getBoundingClientRect();

          const tooltipRect =
            tooltip.getBoundingClientRect();

          const gap = 10;
          const edge = 8;

          let left =
            posterRect.left +
            posterRect.width / 2 -
            tooltipRect.width / 2;

          left =
            Math.max(
              edge,
              Math.min(
                left,
                window.innerWidth -
                  tooltipRect.width -
                  edge
              )
            );

          let top =
            posterRect.top -
            tooltipRect.height -
            gap;

          if (top < edge) {
            top =
              posterRect.bottom +
              gap;

            tooltip.classList.add(
              "is-below"
            );
          }

          tooltip.style.left =
            left + "px";

          tooltip.style.top =
            top + "px";

          tooltip.classList.add(
            "is-visible"
          );
        }
      );
    }

    function hideTooltip() {
      tooltip.classList.remove(
        "is-visible",
        "is-below"
      );

      window.setTimeout(
        function () {
          if (
            !tooltip.classList.contains(
              "is-visible"
            )
          ) {
            tooltip.hidden = true;
          }
        },
        180
      );
    }

    posters.forEach(
      function (poster) {
        const participantName = (
          poster.getAttribute(
            "title"
          ) || ""
        ).trim();

        if (!participantName) {
          return;
        }

        const profileLink =
          poster.querySelector("a");

        poster.dataset
          .participantName =
          participantName;

        poster.removeAttribute(
          "title"
        );

        poster.addEventListener(
          "mouseenter",
          function () {
            showTooltip(poster);
          }
        );

        poster.addEventListener(
          "mouseleave",
          hideTooltip
        );

        poster.addEventListener(
          "focusin",
          function () {
            showTooltip(poster);
          }
        );

        poster.addEventListener(
          "focusout",
          hideTooltip
        );

        if (profileLink) {
          if (
            !profileLink.getAttribute(
              "aria-label"
            )
          ) {
            profileLink.setAttribute(
              "aria-label",
              participantName
            );
          }

          profileLink.setAttribute(
            "aria-describedby",
            tooltip.id
          );
        } else {
          poster.setAttribute(
            "tabindex",
            "0"
          );

          poster.setAttribute(
            "aria-label",
            participantName
          );

          poster.setAttribute(
            "aria-describedby",
            tooltip.id
          );
        }
      }
    );

    participants.classList.add(
      "litso_participants-ready"
    );

    participants.dataset
      .participantsReady = "true";
  }

  function hideLegacyQuickReplyTitle(
    quickReply
  ) {
    const parent =
      quickReply.parentElement;

    if (!parent) {
      return;
    }

    const possibleTitles =
      parent.querySelectorAll(
        [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          ".h1",
          ".h2",
          ".h3",
          ".h4",
          ".page-title",
          ".topic-title"
        ].join(",")
      );

    possibleTitles.forEach(
      function (element) {
        const position =
          element.compareDocumentPosition(
            quickReply
          );

        const isBeforeQuickReply =
          Boolean(
            position &
              Node
                .DOCUMENT_POSITION_FOLLOWING
          );

        if (!isBeforeQuickReply) {
          return;
        }

        const normalizedTitle =
          normalizeText(
            element.textContent
          )
            .replace(
              /[\s:：\-–—]+$/g,
              ""
            )
            .trim();

        const isQuickReplyTitle =
          normalizedTitle ===
            "reponse rapide" ||
          normalizedTitle ===
            "quick reply";

        if (isQuickReplyTitle) {
          element.classList.add(
            "litso_quickreply-legacy-title"
          );
        }
      }
    );
  }

  function initQuickReplyCounters(
    quickReply,
    editorContent,
    actions
  ) {
    if (
      !quickReply ||
      !editorContent ||
      quickReply.dataset
        .quickReplyCountersReady ===
        "true"
    ) {
      return;
    }

    const counters =
      document.createElement(
        "div"
      );

    counters.className =
      "litso_quickreply-stats";

    counters.setAttribute(
      "aria-live",
      "polite"
    );

    counters.setAttribute(
      "aria-atomic",
      "true"
    );

    counters.innerHTML =
      '<span class="litso_quickreply-stat">' +
        '<strong data-character-count>0</strong> ' +
        '<span data-character-label>caractères</span>' +
      "</span>" +

      '<span class="litso_quickreply-stat">' +
        '<strong data-word-count>0</strong> ' +
        '<span data-word-label>mots</span>' +
      "</span>";

    const counterHost =
      actions ||
      editorContent;

    counterHost.insertBefore(
      counters,
      counterHost.firstChild
    );

    quickReply.dataset
      .quickReplyCountersReady =
      "true";

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

      const nextCharacterCount =
        String(characters);

      const nextCharacterLabel =
        characters === 1
          ? "caractère"
          : "caractères";

      const nextWordCount =
        String(totalWords);

      const nextWordLabel =
        totalWords === 1
          ? "mot"
          : "mots";

      if (
        characterCount.textContent !==
        nextCharacterCount
      ) {
        characterCount.textContent =
          nextCharacterCount;
      }

      if (
        characterLabel.textContent !==
        nextCharacterLabel
      ) {
        characterLabel.textContent =
          nextCharacterLabel;
      }

      if (
        wordCount.textContent !==
        nextWordCount
      ) {
        wordCount.textContent =
          nextWordCount;
      }

      if (
        wordLabel.textContent !==
        nextWordLabel
      ) {
        wordLabel.textContent =
          nextWordLabel;
      }
    }

    function bindTextarea(textarea) {
      if (
        boundEditors.has(
          textarea
        )
      ) {
        return;
      }

      boundEditors.add(
        textarea
      );

      textarea.addEventListener(
        "input",
        function () {
          updateCounters(
            textarea.value
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

        }
      }

      boundEditors.add(iframe);

      iframe.addEventListener(
        "load",
        connectIframeBody
      );

      connectIframeBody();
    }

    function connectEditors() {
      editorContent
        .querySelectorAll(
          "textarea"
        )
        .forEach(
          bindTextarea
        );

      editorContent
        .querySelectorAll(
          "iframe"
        )
        .forEach(
          bindIframe
        );

      const visibleTextarea =
        Array.from(
          editorContent.querySelectorAll(
            "textarea"
          )
        ).find(
          function (textarea) {
            return (
              window
                .getComputedStyle(
                  textarea
                )
                .display !== "none"
            );
          }
        );

      if (visibleTextarea) {
        updateCounters(
          visibleTextarea.value
        );
      }
    }

    connectEditors();

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
        editorContent,
        {
          childList: true,
          subtree: true
        }
      );
    }
  }

  function enhanceQuickReply() {
    const quickReply =
      document.querySelector(
        "#quick_reply"
      );

    if (
      !quickReply ||
      quickReply.dataset
        .quickReplyReady === "true"
    ) {
      return;
    }

    const editorContent =
      quickReply.querySelector(
        "#textarea_content"
      );

    if (!editorContent) {
      return;
    }

    hideLegacyQuickReplyTitle(
      quickReply
    );

    const header =
      document.createElement(
        "header"
      );

    const icon =
      document.createElement(
        "span"
      );

    const heading =
      document.createElement(
        "span"
      );

    const eyebrow =
      document.createElement(
        "span"
      );

    const title =
      document.createElement(
        "span"
      );

    const subtitle =
      document.createElement(
        "span"
      );

    header.className =
      "litso_quickreply-head";

    icon.className =
      "litso_quickreply-icon";

    heading.className =
      "litso_quickreply-heading";

    eyebrow.className =
      "litso_quickreply-eyebrow";

    title.className =
      "litso_quickreply-title";

    icon.setAttribute(
      "aria-hidden",
      "true"
    );

    icon.innerHTML =
      '<i data-lucide="message-circle-more"></i>';

    eyebrow.textContent =
      QUICK_REPLY_COPY.eyebrow;

    title.textContent =
      QUICK_REPLY_COPY.title;

    subtitle.textContent =
      QUICK_REPLY_COPY.subtitle;

    heading.append(
      eyebrow,
      title,
      subtitle
    );

    header.append(
      icon,
      heading
    );

    quickReply.insertBefore(
      header,
      editorContent
    );

    const previewButton =
      quickReply.querySelector(
        'input[type="submit"][name="preview"]'
      );

    const sendButton =
      quickReply.querySelector(
        'input[type="submit"][name="post"]'
      );

    const actions =
      sendButton
        ? sendButton.closest("div")
        : null;

    if (previewButton) {
      previewButton.value =
        QUICK_REPLY_COPY.preview;

      previewButton.classList.add(
        "litso_quickreply-preview"
      );
    }

    if (sendButton) {
      sendButton.value =
        QUICK_REPLY_COPY.send;

      sendButton.classList.add(
        "litso_quickreply-send"
      );
    }

    if (
      actions &&
      actions.parentElement ===
        quickReply
    ) {
      actions.classList.add(
        "litso_quickreply-actions"
      );

      actions.removeAttribute(
        "style"
      );
    }

    const editorTextareas =
      quickReply.querySelectorAll(
        ".sceditor-container textarea"
      );

    editorTextareas.forEach(
      function (textarea) {
        textarea.setAttribute(
          "placeholder",
          QUICK_REPLY_COPY
            .placeholder
        );

        textarea.setAttribute(
          "aria-label",
          QUICK_REPLY_COPY.title
        );
      }
    );

    initQuickReplyCounters(
      quickReply,
      editorContent,
      actions
    );

    quickReply.dataset
      .quickReplyReady = "true";
  }

  function renderLucideIcons() {
    if (
      window.lucide &&
      typeof window.lucide
        .createIcons === "function"
    ) {
      window.lucide.createIcons();
    }
  }

  function initTopicTools() {
    setRandomTitleIcons();
    enhancePaginations();
    updateWatchTopicStates();
    enhanceTopicParticipants();
    enhanceQuickReply();
    renderLucideIcons();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initTopicTools,
      {
        once: true
      }
    );
  } else {
    initTopicTools();
  }
})();
