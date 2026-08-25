document.addEventListener("DOMContentLoaded", function () {

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

    var groupSpan = pseudo.querySelector(
      ".usr_grp_clr"
    );

    if (!groupSpan) {
      return;
    }


    /* Récupération de la classe du groupe */

    var groupClass = Array.from(
      groupSpan.classList
    ).find(function (className) {
      return className.startsWith("group-");
    });

    if (groupClass) {
      pseudo.classList.add(groupClass);
    }


    /* Lecture de la véritable couleur Forumactif */

    var groupColor = window
      .getComputedStyle(groupSpan)
      .color;

    if (
      !groupColor ||
      groupColor === "transparent" ||
      groupColor === "rgba(0, 0, 0, 0)"
    ) {
      return;
    }


    /* Application de la couleur au bandeau */

    pseudo.style.backgroundColor =
      convertToRgba(groupColor, 0.82);

    pseudo.style.borderLeftColor =
      groupColor;


    /* Le pseudo redevient blanc après la lecture */

    groupSpan.style.setProperty(
      "color",
      "#fff",
      "important"
    );

  });

});
