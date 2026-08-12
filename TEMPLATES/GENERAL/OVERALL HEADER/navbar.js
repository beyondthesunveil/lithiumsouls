(function () {
  "use strict";

  function initializeLitsoNavbar() {
    var navbar = document.querySelector("[data-litso-nav]");

    if (!navbar || navbar.getAttribute("data-litso-nav_ready") === "true") {
      return;
    }

    navbar.setAttribute("data-litso-nav_ready", "true");

    var linksContainer = navbar.querySelector("[data-litso-nav_links]");
    var member = navbar.querySelector("[data-litso-nav_member]");
    var avatar = navbar.querySelector("[data-litso-nav_avatar]");
    var username = navbar.querySelector("[data-litso-nav_username]");
    var status = navbar.querySelector("[data-litso-nav_status]");

    /* ----- LIENS GÉNÉRÉS PAR FORUMACTIF ----- */

    function decorateLinks() {
      if (!linksContainer) return;

      Array.prototype.forEach.call(
        linksContainer.querySelectorAll("a.mainmenu"),
        function (link) {
          if (link.querySelector(".link-text")) return;

          var text = link.textContent.trim();
          link.textContent = "";

          var label = document.createElement("span");
          label.className = "link-text";
          label.textContent = text;
          link.appendChild(label);
        }
      );
    }

    decorateLinks();

    if (linksContainer && "MutationObserver" in window) {
      var linkObserver = new MutationObserver(decorateLinks);

      linkObserver.observe(linksContainer, {
        childList: true,
        subtree: true
      });
    }

    /* ----- UTILISATEUR CONNECTÉ ----- */

    function extractAvatarSource(value) {
      if (typeof value !== "string" || !value.trim()) return "";

      var content = value.trim();

      if (content.charAt(0) === "<") {
        var template = document.createElement("template");
        template.innerHTML = content;

        var image = template.content.querySelector("img");
        return image ? image.getAttribute("src") || "" : "";
      }

      return content;
    }

    var userData = window._userdata || {};
    var loggedIn =
      userData.session_logged_in === true ||
      userData.session_logged_in === 1 ||
      userData.session_logged_in === "1";

    var displayName = loggedIn && userData.username
      ? String(userData.username)
      : "Invité";

    if (username) username.textContent = displayName;

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

    var avatarSource = extractAvatarSource(userData.avatar);

    if (avatar && loggedIn && avatarSource) {
      var avatarImage = document.createElement("img");
      avatarImage.src = avatarSource;
      avatarImage.alt = "";
      avatarImage.loading = "eager";
      avatar.appendChild(avatarImage);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoNavbar,
      { once: true }
    );
  } else {
    initializeLitsoNavbar();
  }
})();
