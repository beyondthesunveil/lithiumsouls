(function () {
  "use strict";

  function cleanText(text) {
    return (text || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function isInsideTable(element) {
    var parent = element;

    while (parent) {
      if (
        parent.tagName &&
        parent.tagName.toLowerCase() === "table"
      ) {
        return true;
      }

      parent = parent.parentNode;
    }

    return false;
  }

  function getHeaderCells(table) {
    var cells = table.querySelectorAll(
      "thead th, thead td"
    );

    if (cells.length) {
      return cells;
    }

    var firstRow = table.querySelector("tr");

    if (!firstRow) {
      return [];
    }

    return firstRow.querySelectorAll("th, td");
  }

  function getNotificationTableType(table) {
    var cells = getHeaderCells(table);

    if (!cells.length) {
      return null;
    }

    var texts = [];

    Array.prototype.forEach.call(
      cells,
      function (cell) {
        texts.push(cleanText(cell.textContent));
      }
    );

    var headerText = texts.join(" | ");

    if (
      headerText.indexOf("types de notifications") !== -1 &&
      headerText.indexOf("par email") !== -1
    ) {
      return "options";
    }

    if (
      headerText.indexOf("notifications") !== -1 &&
      headerText.indexOf("date") !== -1
    ) {
      return "list";
    }


    return null;
  }

  function findPageTitle(type) {
    var candidates = document.querySelectorAll(
      "h1, h2, .page-title, .maintitle, .page-header h1, .page-header h2"
    );

    var fallback = null;

    for (var i = 0; i < candidates.length; i++) {
      var element = candidates[i];

      if (isInsideTable(element)) {
        continue;
      }

      var text = cleanText(element.textContent);

      if (!text) {
        continue;
      }

      if (
        type === "options" &&
        (
          text === "options" ||
          text.indexOf("options") === 0
        )
      ) {
        return element;
      }

      if (
        type === "list" &&
        text.indexOf("notification") !== -1 &&
        text.indexOf("types de notifications") === -1
      ) {
        return element;
      }


      if (!fallback) {
        fallback = element;
      }
    }


    return fallback;
  }

  function decoratePageTitle(type) {
    var title = findPageTitle(type);

    if (!title) {
      return;
    }

    title.setAttribute(
      "data-ls-notifications-title",
      "true"
    );

    if (type === "list") {
      title.setAttribute(
        "data-ls-ghost",
        "notifications"
      );
    }


    if (type === "options") {
      title.setAttribute(
        "data-ls-ghost",
        "options"
      );
    }
  }

  function decorateTableHeader(table, type) {
    var cells = getHeaderCells(table);

    if (!cells.length) {
      return;
    }


    var headerRow = cells[0].parentNode;

    if (headerRow) {
      headerRow.setAttribute(
        "data-ls-header-row",
        "true"
      );
    }

    if (type === "list") {

      if (cells[0]) {
        cells[0].setAttribute(
          "data-ls-column",
          "main"
        );

        cells[0].setAttribute(
          "data-ls-kicker",
          "registre"
        );
      }


      if (cells[1]) {
        cells[1].setAttribute(
          "data-ls-column",
          "date"
        );

        cells[1].setAttribute(
          "data-ls-kicker",
          "chronologie"
        );
      }


      if (cells[2]) {
        cells[2].setAttribute(
          "data-ls-column",
          "selection"
        );

        cells[2].setAttribute(
          "data-ls-kicker",
          "sélection"
        );
      }

    }

    if (type === "options") {

      if (cells[0]) {
        cells[0].setAttribute(
          "data-ls-column",
          "main"
        );

        cells[0].setAttribute(
          "data-ls-kicker",
          "préférences"
        );
      }


      if (cells[1]) {
        cells[1].setAttribute(
          "data-ls-column",
          "email"
        );

        cells[1].setAttribute(
          "data-ls-kicker",
          "canal"
        );
      }


      if (cells[2]) {
        cells[2].setAttribute(
          "data-ls-column",
          "push"
        );

        cells[2].setAttribute(
          "data-ls-kicker",
          "canal"
        );
      }

    }
  }

  function decorateNotificationRows(table) {
    var rows = table.querySelectorAll("tr");

    Array.prototype.forEach.call(
      rows,
      function (row) {

        if (
          row.getAttribute("data-ls-header-row") === "true"
        ) {
          return;
        }


        var cells = row.querySelectorAll("td");

        if (!cells.length) {
          return;
        }


        row.setAttribute(
          "data-ls-entry",
          "true"
        );

        if (cells[0]) {
          cells[0].setAttribute(
            "data-ls-cell",
            "message"
          );


          var links = cells[0].querySelectorAll("a");

          if (links.length) {
            links[0].setAttribute(
              "data-ls-role",
              "actor"
            );
          }

          if (links.length > 1) {
            links[links.length - 1].setAttribute(
              "data-ls-role",
              "topic"
            );
          }
        }

        if (cells[1]) {
          cells[1].setAttribute(
            "data-ls-cell",
            "date"
          );
        }

        if (cells.length > 2) {
          cells[cells.length - 1].setAttribute(
            "data-ls-cell",
            "selection"
          );
        }

      }
    );
  }

  function decorateOptionsRows(table) {
    var rows = table.querySelectorAll("tr");

    Array.prototype.forEach.call(
      rows,
      function (row) {

        if (
          row.getAttribute("data-ls-header-row") === "true"
        ) {
          return;
        }

        var cells = row.querySelectorAll("td");

        if (!cells.length) {
          return;
        }

        row.setAttribute(
          "data-ls-entry",
          "true"
        );

        if (cells[0]) {
          cells[0].setAttribute(
            "data-ls-cell",
            "option"
          );
        }

        if (cells[1]) {
          cells[1].setAttribute(
            "data-ls-cell",
            "email"
          );
        }

        if (cells[2]) {
          cells[2].setAttribute(
            "data-ls-cell",
            "push"
          );
        }

      }
    );
  }

  function initializeNotificationsPage() {
    var tables = document.querySelectorAll("table");

    Array.prototype.forEach.call(
      tables,
      function (table) {
        var type = getNotificationTableType(table);

        if (!type) {
          return;
        }

        document.body.setAttribute(
          "data-ls-notifications-page",
          type
        );

        table.setAttribute(
          "data-ls-notifications-table",
          type
        );

        decoratePageTitle(type);

        decorateTableHeader(
          table,
          type
        );

        if (type === "list") {
          decorateNotificationRows(table);
        }

        if (type === "options") {
          decorateOptionsRows(table);
        }
      }
    );
  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initializeNotificationsPage
    );

  } else {

    initializeNotificationsPage();

  }

})();
