(function () {
  "use strict";


  function initializeLitsoNavbar() {
    var navbar = document.querySelector(
      "[data-litso-nav]"
    );

    if (!navbar) {
      return;
    }

    var isAlreadyReady =
      navbar.getAttribute("data-litso-nav_ready") === "true";

    var linksContainer = navbar.querySelector(
      "[data-litso-nav_links]"
    );

    var homeButton = navbar.querySelector(
      ".litso-nav_home"
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

    function placeNotiffiButton() {

      var notiffiButton = document.getElementById(
        "notiffi_button"
      );

      if (!homeButton || !notiffiButton) {
        return false;
      }

      notiffiButton.classList.add(
        "litso-nav_notiffi"
      );

      if (
        notiffiButton.parentElement !==
          homeButton.parentElement ||
        homeButton.nextElementSibling !==
          notiffiButton
      ) {
        homeButton.insertAdjacentElement(
          "afterend",
          notiffiButton
        );
      }

      return true;
    }

    placeNotiffiButton();

    if (
      navbar.getAttribute(
        "data-litso-nav_notiffi-observer"
      ) !== "true" &&
      "MutationObserver" in window
    ) {
      navbar.setAttribute(
        "data-litso-nav_notiffi-observer",
        "true"
      );

      var notiffiFrame = null;

      var notiffiObserver = new MutationObserver(
        function (mutations) {
          var shouldCheck = false;

          Array.prototype.forEach.call(
            mutations,
            function (mutation) {
              Array.prototype.forEach.call(
                mutation.addedNodes,
                function (node) {
                  if (
                    shouldCheck ||
                    node.nodeType !== 1
                  ) {
                    return;
                  }

                  if (
                    node.id === "notiffi_button" ||
                    (
                      node.querySelector &&
                      node.querySelector(
                        "#notiffi_button"
                      )
                    )
                  ) {
                    shouldCheck = true;
                  }
                }
              );
            }
          );

          if (!shouldCheck) {
            return;
          }

          if (notiffiFrame !== null) {
            cancelAnimationFrame(notiffiFrame);
          }

          notiffiFrame = requestAnimationFrame(
            function () {
              placeNotiffiButton();
              notiffiFrame = null;
            }
          );
        }
      );

      notiffiObserver.observe(
        document.body,
        {
          childList: true,
          subtree: true
        }
      );
    }

    if (isAlreadyReady) {
      return;
    }

    navbar.setAttribute(
      "data-litso-nav_ready",
      "true"
    );

    function decorateLinks() {
      if (!linksContainer) {
        return;
      }

      var links = linksContainer.querySelectorAll(
        "a.mainmenu"
      );

      Array.prototype.forEach.call(
        links,
        function (link) {
          if (link.querySelector(".link-text")) {
            return;
          }

          var text = link.textContent.trim();

          if (!text) {
            return;
          }

          link.textContent = "";

          var label = document.createElement("span");

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
      var linkObserver = new MutationObserver(
        function () {
          decorateLinks();
        }
      );

      linkObserver.observe(
        linksContainer,
        {
          childList: true,
          subtree: true
        }
      );
    }

    function extractAvatarSource(value) {
      if (
        typeof value !== "string" ||
        !value.trim()
      ) {
        return "";
      }

      var content = value.trim();

      if (content.charAt(0) === "<") {
        var template = document.createElement(
          "template"
        );

        template.innerHTML = content;

        var image = template.content.querySelector(
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


    if (username) {
      username.textContent = displayName;
    }


    if (status) {
      status.textContent = loggedIn
        ? "Connecté en tant que"
        : "Bienvenue sur le forum";
    }


    if (member) {
      member.href = loggedIn
        ? "/profile?mode=editprofile"
        : "/login";

      member.setAttribute(
        "aria-label",
        loggedIn
          ? "Ouvrir le profil de " + displayName
          : "Se connecter au forum"
      );
    }

    var avatarSource = extractAvatarSource(
      userData.avatar
    );

    if (
      avatar &&
      loggedIn &&
      avatarSource &&
      !avatar.querySelector("img")
    ) {
      var avatarImage = document.createElement(
        "img"
      );

      avatarImage.src = avatarSource;
      avatarImage.alt = "";
      avatarImage.loading = "eager";

      avatar.appendChild(avatarImage);
    }
  }

  function startLitsoNavbar() {
    initializeLitsoNavbar();

    window.addEventListener(
      "load",
      initializeLitsoNavbar,
      { once: true }
    );
  }


  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startLitsoNavbar,
      { once: true }
    );
  } else {
    startLitsoNavbar();
  }

})();
