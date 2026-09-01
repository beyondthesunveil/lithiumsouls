(function () {
  "use strict";

  function initializeLitsoQeel() {
    var qeel = document.querySelector(
      "[data-litso-qeel]"
    );

    if (
      !qeel ||
      qeel.getAttribute(
        "data-litso-qeel-ready"
      ) === "true"
    ) {
      return;
    }

    qeel.setAttribute(
      "data-litso-qeel-ready",
      "true"
    );

    var newestSource = qeel.querySelector(
      "[data-litso-qeel_newestSource]"
    );

    var usersSource = qeel.querySelector(
      "[data-litso-qeel_usersSource]"
    );

    var postsSource = qeel.querySelector(
      "[data-litso-qeel_postsSource]"
    );

    var newestTarget = qeel.querySelector(
      "[data-litso-qeel_newestName]"
    );

    var usersTarget = qeel.querySelector(
      "[data-litso-qeel_users]"
    );

    var postsTarget = qeel.querySelector(
      "[data-litso-qeel_posts]"
    );

    var connectedMembers = qeel.querySelector(
      "[data-litso-qeel_connected]"
    );

    var recentMembers = qeel.querySelector(
      "[data-litso-qeel_recent]"
    );

    function extractNumber(element) {
      if (!element) {
        return "0";
      }

      var text = element.textContent
        .replace(/\s+/g, " ")
        .trim();

      var match = text.match(
        /\d[\d\s.,]*/
      );

      return match
        ? match[0].replace(/\s+/g, " ").trim()
        : "0";
    }

    function displayNewestMember() {
      if (!newestSource || !newestTarget) {
        return;
      }

      var profileLink =
        newestSource.querySelector("a");

      newestTarget.innerHTML = "";

      if (profileLink) {
        newestTarget.appendChild(
          profileLink.cloneNode(true)
        );

        return;
      }

      var sourceText = newestSource.textContent
        .replace(/\s+/g, " ")
        .trim()
        .replace(
          /l['’]utilisateur(?:rice)? enregistré(?:e)? le plus récent est\s*/i,
          ""
        )
        .replace(
          /le membre enregistré(?:e)? le plus récent est\s*/i,
          ""
        )
        .trim();

      newestTarget.textContent =
        sourceText || "Nouvelle âme";
    }

    function displayNewestAvatar() {
  var avatarTarget = qeel.querySelector(
    "#ava_lastmember"
  );

  if (!newestSource || !avatarTarget) {
    return;
  }

  var profileLink = newestSource.querySelector(
    'a[href*="/u"], a[href*="profile?mode=viewprofile"]'
  );

  if (!profileLink) {
    avatarTarget.classList.add(
      "litso-qeel_avatarUnavailable"
    );

    return;
  }

  fetch(profileLink.href, {
    credentials: "same-origin"
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error(
          "Profil inaccessible : " + response.status
        );
      }

      return response.text();
    })
    .then(function (profileHTML) {
      var parser = new DOMParser();

      var profileDocument = parser.parseFromString(
        profileHTML,
        "text/html"
      );

      var avatar = profileDocument.querySelector(
        "#litso-profile_avatar img"
      );

      if (!avatar) {
        throw new Error(
          "Avatar introuvable dans le profil"
        );
      }

      var avatarClone = avatar.cloneNode(true);

      avatarClone.removeAttribute("width");
      avatarClone.removeAttribute("height");
      avatarClone.alt = "";
      avatarClone.loading = "eager";

      avatarTarget.innerHTML = "";
      avatarTarget.appendChild(avatarClone);
      avatarTarget.classList.add(
        "is-loaded"
      );
    })
    .catch(function (error) {
      avatarTarget.classList.add(
        "litso-qeel_avatarUnavailable"
      );

      console.warn(
        "[Lithium Souls — QEEL]",
        error
      );
    });
}

    function displayStatistics() {
      if (usersTarget) {
        usersTarget.textContent =
          extractNumber(usersSource);
      }

      if (postsTarget) {
        postsTarget.textContent =
          extractNumber(postsSource);
      }
    }

    function cleanTextNodes(
      element,
      expressions
    ) {
      if (!element) {
        return;
      }

      var walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      var textNodes = [];
      var currentNode;

      while (
        (currentNode = walker.nextNode())
      ) {
        textNodes.push(currentNode);
      }

      Array.prototype.forEach.call(
        textNodes,
        function (textNode) {
          var content = textNode.nodeValue;

          Array.prototype.forEach.call(
            expressions,
            function (expression) {
              content = content.replace(
                expression,
                ""
              );
            }
          );

          textNode.nodeValue = content;
        }
      );
    }

     function rewriteOnlineSummary() {
  var expression =
    /il\s+y\s+a\s+en\s+tout\s+(\d+)\s+utilisateurs?\s+en\s+ligne\s*::\s*(\d+)\s+enregistré(?:e)?s?\s*,\s*(\d+)\s+invisibles?\s+et\s+(\d+)\s+invités?/i;

  var elements = qeel.querySelectorAll(
    "p, div, span"
  );

  var target = null;
  var values = null;

  Array.prototype.forEach.call(
    elements,
    function (element) {
      var text = element.textContent
        .replace(/\s+/g, " ")
        .trim();

      var match = text.match(expression);

      if (!match) {
        return;
      }

      /*
       * On conserve l’élément le plus précis afin de ne pas
       * remplacer accidentellement tout le contenu du QEEL.
       */
      var childContainsSentence =
        Array.prototype.some.call(
          element.children,
          function (child) {
            return expression.test(
              child.textContent
                .replace(/\s+/g, " ")
                .trim()
            );
          }
        );

      if (!childContainsSentence) {
        target = element;
        values = match;
      }
    }
  );

  if (!target || !values) {
    return;
  }

  var total = Number(values[1]);
  var registered = Number(values[2]);
  var invisible = Number(values[3]);
  var guests = Number(values[4]);

  var soulText =
    total === 1
      ? " âme foule les pavés de l’enfer"
      : " âmes foulent les pavés de l’enfer";

  var residentText =
    registered === 1
      ? " habitant"
      : " habitants";

  var ghostText =
    invisible === 1
      ? " fantôme"
      : " fantômes";

  var spectreText =
    guests === 1
      ? " spectre"
      : " spectres";

  target.innerHTML =
    "<strong>" + total + "</strong>" +
    soulText +
    " — " +
    "<strong>" + registered + "</strong>" +
    residentText +
    ", " +
    "<strong>" + invisible + "</strong>" +
    ghostText +
    " et " +
    "<strong>" + guests + "</strong>" +
    spectreText;
}


function cleanMemberLists() {
  cleanTextNodes(
    qeel,
    [
      /membres?\s+connecté(?:e)?s?\s+au\s+cours\s+des\s+\d+\s+dernières?\s+heures?\s*:\s*/gi,

      /(?:cette\s+âme\s+foule|ces\s+âmes\s+foulent)\s+les\s+pavés\s+de\s+bonnes\s+intentions\s*[.!:]?\s*/gi
    ]
  );

  cleanTextNodes(
    recentMembers,
    [
      /utilisateurs?\s+enregistré(?:e)?s?\s*:\s*/gi
    ]
  );
}

    displayNewestMember();
    displayStatistics();
    cleanMemberLists();
  }


  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoQeel,
      { once: true }
    );
  } else {
    initializeLitsoQeel();
  }
})();
