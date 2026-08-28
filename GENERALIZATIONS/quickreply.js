(function () {
  "use strict";

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function decoratePostingHeader(postingBox) {
    var header = postingBox.querySelector(
      "h3"
    );

    if (!header) {
      return;
    }

    header.classList.add(
      "litsoPB_postingHeader"
    );
  }

  function createEditorLayout(postingBox) {
    var fields = postingBox.querySelector(
      "fieldset.fields1"
    );

    var smileyBox = postingBox.querySelector(
      "#smiley-box"
    );

    var messageBox = postingBox.querySelector(
      "#message-box"
    );

    if (
      !fields ||
      !smileyBox ||
      !messageBox
    ) {
      return;
    }

    if (
      smileyBox.parentElement &&
      smileyBox.parentElement.classList.contains(
        "litsoPB_editorLayout"
      )
    ) {
      return;
    }

    var layout = document.createElement(
      "div"
    );

    layout.className =
      "litsoPB_editorLayout";

    smileyBox.parentNode.insertBefore(
      layout,
      smileyBox
    );

    layout.appendChild(smileyBox);
    layout.appendChild(messageBox);

    smileyBox.classList.remove(
      "is-open"
    );

    smileyBox.classList.add(
      "litsoPB_smileyBox"
    );

    var oldToggle = smileyBox.querySelector(
      ".utppPB_smileyToggle, .litsoPB_smileyToggle"
    );

    if (oldToggle) {
      oldToggle.remove();
    }

    if (
      !smileyBox.querySelector(
        ".litsoPB_smileyHeading"
      )
    ) {
      var heading = document.createElement(
        "div"
      );

      heading.className =
        "litsoPB_smileyHeading";

      heading.textContent =
        "Émotions";

      smileyBox.insertBefore(
        heading,
        smileyBox.firstChild
      );
    }
  }

  function createEditorCounter(postingBox) {
    if (
      postingBox.querySelector(
        ".litsoPB_editorStats"
      )
    ) {
      return;
    }

    var submitButtons =
      postingBox.querySelector(
        "fieldset.submit-buttons"
      );

    if (!submitButtons) {
      return;
    }

    var stats = document.createElement(
      "div"
    );

    stats.className =
      "litsoPB_editorStats";

    stats.setAttribute(
      "aria-live",
      "polite"
    );

    stats.innerHTML =
      '<span class="litsoPB_editorStat">' +
        '<strong data-litso-characters>0</strong>' +
        '<span>caractères</span>' +
      '</span>' +
      '<span class="litsoPB_editorStat">' +
        '<strong data-litso-words>0</strong>' +
        '<span>mot</span>' +
      '</span>';

    submitButtons.insertBefore(
      stats,
      submitButtons.firstChild
    );


    var characterOutput =
      stats.querySelector(
        "[data-litso-characters]"
      );

    var wordOutput =
      stats.querySelector(
        "[data-litso-words]"
      );

    var characterLabel =
      characterOutput.nextElementSibling;

    var wordLabel =
      wordOutput.nextElementSibling;


    function getEditorText() {
      var iframe = postingBox.querySelector(
        ".sceditor-container iframe"
      );

      var textarea = postingBox.querySelector(
        ".sceditor-container textarea"
      );

      if (
        iframe &&
        iframe.offsetParent !== null
      ) {
        try {
          if (
            iframe.contentDocument &&
            iframe.contentDocument.body
          ) {
            return (
              iframe.contentDocument.body
                .innerText ||
              iframe.contentDocument.body
                .textContent ||
              ""
            );
          }
        } catch (error) {

        }
      }

      if (textarea) {
        return textarea.value || "";
      }

      var nativeTextarea =
        postingBox.querySelector(
          'textarea[name="message"]'
        );

      return nativeTextarea
        ? nativeTextarea.value
        : "";
    }


    function updateCounter() {
      var text = getEditorText()
        .replace(/\u00a0/g, " ")
        .replace(/\r/g, "");

      var characters = text.length;

      var normalized = text
        .replace(/<[^>]*>/g, " ")
        .replace(/\[[^\]]+\]/g, " ")
        .trim();

      var words = normalized
        ? normalized
            .split(/\s+/)
            .filter(Boolean)
            .length
        : 0;

      characterOutput.textContent =
        String(characters);

      wordOutput.textContent =
        String(words);

      characterLabel.textContent =
        characters > 1
          ? "caractères"
          : "caractère";

      wordLabel.textContent =
        words > 1
          ? "mots"
          : "mot";
    }


    function connectTextarea() {
      var textareas =
        postingBox.querySelectorAll(
          'textarea[name="message"], ' +
          ".sceditor-container textarea"
        );

      Array.prototype.forEach.call(
        textareas,
        function (textarea) {
          if (
            textarea.getAttribute(
              "data-litso-counter-ready"
            ) === "true"
          ) {
            return;
          }

          textarea.setAttribute(
            "data-litso-counter-ready",
            "true"
          );

          textarea.addEventListener(
            "input",
            updateCounter
          );

          textarea.addEventListener(
            "keyup",
            updateCounter
          );

          textarea.addEventListener(
            "change",
            updateCounter
          );
        }
      );
    }


    function connectIframe() {
      var iframe = postingBox.querySelector(
        ".sceditor-container iframe"
      );

      if (!iframe) {
        return;
      }

      function attach() {
        try {
          var body =
            iframe.contentDocument &&
            iframe.contentDocument.body;

          if (
            !body ||
            body.getAttribute(
              "data-litso-counter-ready"
            ) === "true"
          ) {
            return;
          }

          body.setAttribute(
            "data-litso-counter-ready",
            "true"
          );

          body.addEventListener(
            "input",
            updateCounter
          );

          body.addEventListener(
            "keyup",
            updateCounter
          );

          body.addEventListener(
            "paste",
            function () {
              window.setTimeout(
                updateCounter,
                0
              );
            }
          );
        } catch (error) {

        }
      }

      iframe.addEventListener(
        "load",
        attach
      );

      attach();
    }


    connectTextarea();
    connectIframe();
    updateCounter();

    var editorObserver =
      new MutationObserver(
        function () {
          connectTextarea();
          connectIframe();
          updateCounter();
        }
      );

    editorObserver.observe(postingBox, {
      childList: true,
      subtree: true
    });
  }

  var PANEL_TYPES = [
    {
      type: "dice",
      icon: "dices",

      matches: function (text) {
        return text.includes(
          "lancer de des"
        );
      }
    },
    {
      type: "options",
      icon: "settings-2",

      matches: function (text) {
        return text === "options";
      }
    },
    {
      type: "poll",
      icon:
        "chart-no-axes-column-increasing",

      matches: function (text) {
        return text.includes(
          "sondage"
        );
      }
    }
  ];


  function getDirectText(element) {
    return Array.prototype
      .filter.call(
        element.childNodes,
        function (node) {
          return (
            node.nodeType ===
            Node.TEXT_NODE
          );
        }
      )
      .map(function (node) {
        return node.textContent;
      })
      .join(" ")
      .trim();
  }


  function decorateDicePanel(panel) {
    var diceTable = panel.querySelector(
      "#list_dice"
    );

    if (diceTable) {
      diceTable.classList.add(
        "litsoPB_diceList"
      );
    }
  }


  function decorateOptionsPanel(panel) {
    var fieldsets =
      panel.querySelectorAll(
        "fieldset"
      );

    Array.prototype.forEach.call(
      fieldsets,
      function (fieldset) {
        fieldset.classList.add(
          "litsoPB_optionsFieldset"
        );

        Array.prototype.forEach.call(
          fieldset.childNodes,
          function (node) {
            if (
              node.nodeType ===
                Node.TEXT_NODE &&
              normalizeText(
                node.textContent
              ).includes(
                "poster le sujet"
              )
            ) {
              var legend =
                document.createElement(
                  "span"
                );

              legend.className =
                "litsoPB_optionLegend";

              legend.textContent =
                node.textContent.trim();

              node.replaceWith(legend);
            }
          }
        );

        var labels =
          fieldset.querySelectorAll(
            "label"
          );

        Array.prototype.forEach.call(
          labels,
          function (choice) {
            var input =
              choice.querySelector(
                "input"
              );

            if (!input) {
              return;
            }

            choice.classList.add(
              "litsoPB_optionChoice",
              "litsoPB_optionChoice--" +
                input.type
            );
          }
        );
      }
    );
  }


  function decoratePollPanel(panel) {
    var fieldset =
      panel.querySelector(
        "fieldset"
      );

    if (fieldset) {
      fieldset.classList.add(
        "litsoPB_pollFieldset"
      );
    }

    var rows =
      panel.querySelectorAll(
        "dl"
      );

    Array.prototype.forEach.call(
      rows,
      function (row) {
        row.classList.add(
          "litsoPB_pollRow"
        );
      }
    );

    var choices =
      panel.querySelectorAll(
        'label:has(input[type="radio"])'
      );

    Array.prototype.forEach.call(
      choices,
      function (choice) {
        choice.classList.add(
          "litsoPB_pollChoice"
        );
      }
    );
  }


  function decorateExtraPanels() {
    var headers =
      document.querySelectorAll(
        ".h3.forum-hideable"
      );

    Array.prototype.forEach.call(
      headers,
      function (header) {
        if (
          header.getAttribute(
            "data-litso-panel-ready"
          ) === "true"
        ) {
          return;
        }

        var titleText =
          getDirectText(header);

        var normalizedTitle =
          normalizeText(titleText);

        var config =
          PANEL_TYPES.find(
            function (item) {
              return item.matches(
                normalizedTitle
              );
            }
          );

        var panel =
          header.nextElementSibling;

        if (
          !config ||
          !panel ||
          !panel.classList.contains(
            "panel"
          )
        ) {
          return;
        }

        Array.prototype.forEach.call(
          header.childNodes,
          function (node) {
            if (
              node.nodeType ===
              Node.TEXT_NODE
            ) {
              node.remove();
            }
          }
        );

        var icon =
          document.createElement(
            "span"
          );

        icon.className =
          "litsoPB_extraHeaderIcon";

        icon.setAttribute(
          "aria-hidden",
          "true"
        );

        icon.innerHTML =
          '<i data-lucide="' +
          config.icon +
          '"></i>';

        var label =
          document.createElement(
            "span"
          );

        label.className =
          "litsoPB_extraHeaderLabel";

        label.textContent =
          titleText;

        header.insertBefore(
          icon,
          header.firstChild
        );

        header.insertBefore(
          label,
          icon.nextSibling
        );

        header.classList.add(
          "litsoPB_extraHeader",
          "litsoPB_extraHeader--" +
            config.type
        );

        panel.classList.add(
          "litsoPB_extraPanel",
          "litsoPB_extraPanel--" +
            config.type
        );

        panel.hidden = false;
        panel.style.removeProperty(
          "display"
        );

        header.removeAttribute(
          "role"
        );

        header.removeAttribute(
          "tabindex"
        );

        header.setAttribute(
          "aria-expanded",
          "true"
        );

        header.addEventListener(
          "click",
          function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();

            panel.hidden = false;
            panel.style.removeProperty(
              "display"
            );
          },
          true
        );

        if (config.type === "dice") {
          decorateDicePanel(panel);
        } else if (
          config.type === "options"
        ) {
          decorateOptionsPanel(panel);
        } else if (
          config.type === "poll"
        ) {
          decoratePollPanel(panel);
        }

        header.setAttribute(
          "data-litso-panel-ready",
          "true"
        );
      }
    );

    if (
      window.lucide &&
      typeof window.lucide
        .createIcons === "function"
    ) {
      window.lucide.createIcons();
    }
  }

  function initializeLitsoPostingBox() {
    var postingBoxes =
      document.querySelectorAll(
        "#postingbox"
      );

    Array.prototype.forEach.call(
      postingBoxes,
      function (postingBox) {
        if (
          postingBox.getAttribute(
            "data-litso-posting-ready"
          ) === "true"
        ) {
          return;
        }

        postingBox.setAttribute(
          "data-litso-posting-ready",
          "true"
        );

        decoratePostingHeader(
          postingBox
        );

        createEditorLayout(
          postingBox
        );

        function finishInitialization() {
          createEditorLayout(
            postingBox
          );

          createEditorCounter(
            postingBox
          );
        }

        finishInitialization();

        var postingObserver =
          new MutationObserver(
            finishInitialization
          );

        postingObserver.observe(
          postingBox,
          {
            childList: true,
            subtree: true
          }
        );
      }
    );

    decorateExtraPanels();
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoPostingBox,
      { once: true }
    );
  } else {
    initializeLitsoPostingBox();
  }
})();
