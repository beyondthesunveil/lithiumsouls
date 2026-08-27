document.addEventListener("DOMContentLoaded", function () {

  var groupNames = {
    "group-2": "Administration",
    "group-3": "Infernaux",
    "group-4": "Damné·e·s",
    "group-5": "Suprêmes",
    "group-6": "Royauté",
    "group-7": "Péchés capitaux",
    "group-8": "Déchu·e·s",
    "group-9": "Anomalies",
    "group-10": "Âmes errantes"
  };

  function convertToRgba(color, opacity) {
    var values = color.match(
      /[\d.]+/g
    );

    if (!values || values.length < 3) {
      return color;
    }

    return "rgba(" +
      values[0] + ", " +
      values[1] + ", " +
      values[2] + ", " +
      opacity + ")";
  }

  document.querySelectorAll(
    ".litso-memberlist_pseudo"
  ).forEach(function (pseudo) {

    var memberCard = pseudo.closest(
      ".litso-memberlist_member"
    );

    var groupSpan = pseudo.querySelector(
      ".usr_grp_clr"
    );

    if (!groupSpan) {
      return;
    }

    var groupClass = Array.from(
      groupSpan.classList
    ).find(function (className) {
      return className.startsWith("group-");
    });

    if (groupClass) {
      pseudo.classList.add(groupClass);
    }

    var groupColor = window
      .getComputedStyle(groupSpan)
      .color;

    if (
      groupColor &&
      groupColor !== "transparent" &&
      groupColor !== "rgba(0, 0, 0, 0)"
    ) {
      pseudo.style.backgroundColor =
        convertToRgba(groupColor, 0.82);

      pseudo.style.borderLeftColor =
        groupColor;

      if (memberCard) {
        memberCard.style.setProperty(
          "--litso-memberlist_groupColor",
          groupColor
        );
      }
    }

    if (memberCard) {
      var groupNameTarget = memberCard.querySelector(
        "[data-litso-memberlist_groupName]"
      );

      if (groupNameTarget) {
        groupNameTarget.textContent =
          groupNames[groupClass] ||
          "Âme errante";
      }
    }

    groupSpan.style.setProperty(
      "color",
      "#fff",
      "important"
    );

  });

});
