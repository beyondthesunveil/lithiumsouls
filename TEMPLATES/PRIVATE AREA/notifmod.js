(function () {
  "use strict";

  function normalizeText(text) {
    return (text || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function getTableHeadTexts(table) {
    var texts = [];
    var heads = table.querySelectorAll("th, thead td");
    Array.prototype.forEach.call(heads, function (cell) {
      texts.push(normalizeText(cell.textContent));
    });
    return texts;
  }

  function detectNotificationPages() {
    var body = document.body;
    if (!body) return;

    var url = window.location.href.toLowerCase();
    var tables = document.querySelectorAll("table");
    var pageText = normalizeText(document.body.textContent);

    var isNotifList = false;
    var isNotifOptions = false;

    Array.prototype.forEach.call(tables, function (table) {
      var heads = getTableHeadTexts(table);
      var joined = heads.join(" | ");

      if (
        joined.indexOf("date") !== -1 &&
        (joined.indexOf("notifications") !== -1 || joined.indexOf("x") !== -1)
      ) {
        isNotifList = true;
      }

      if (
        joined.indexOf("types de notifications") !== -1 &&
        joined.indexOf("par email") !== -1
      ) {
        isNotifOptions = true;
      }
    });

    if (
      url.indexOf("notifications") !== -1 &&
      pageText.indexOf("types de notifications") === -1
    ) {
      isNotifList = true;
    }

    if (
      url.indexOf("notification") !== -1 &&
      pageText.indexOf("types de notifications") !== -1
    ) {
      isNotifOptions = true;
    }

    if (pageText.indexOf("types de notifications") !== -1) {
      isNotifOptions = true;
    }

    if (isNotifList) {
      body.classList.add("ls-page-notifications");
    }

    if (isNotifOptions) {
      body.classList.add("ls-page-notification-options");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", detectNotificationPages);
  } else {
    detectNotificationPages();
  }
})();
