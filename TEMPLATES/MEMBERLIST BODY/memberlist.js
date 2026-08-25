document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll(
    ".litso-memberlist_pseudo"
  ).forEach(function (pseudo) {

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

    if (!groupClass) {
      return;
    }

    pseudo.classList.add(groupClass);

    var memberCard = pseudo.closest(
      ".litso-memberlist_member"
    );

    if (memberCard) {
      memberCard.classList.add(groupClass);
    }

  });

});
