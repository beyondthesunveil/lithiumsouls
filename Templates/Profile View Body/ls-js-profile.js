(function () {

  function apply() {

    const blocs = document.querySelectorAll(".ls-pfb_blocname");

    if (!blocs.length) return;

    blocs.forEach(bloc => {

      /* -------------------------
         COULEUR GROUPE
      ------------------------- */

      const pseudo = bloc.querySelector(".ls-pfb_username");

      if (pseudo) {
        const color = getComputedStyle(pseudo).color;

        if (color) {
          bloc.style.setProperty("--group-color", color);
        }
      }

      /* -------------------------
         ICÔNES
      ------------------------- */

      bloc.querySelectorAll(".ls-pfb_icon").forEach(icon => {

        const text = icon.textContent?.toLowerCase() || "";

        if (text.includes("mp") || text.includes("message")) {
          icon.dataset.icon = "mail";
        }

        else if (text.includes("profil")) {
          icon.dataset.icon = "user";
        }

        else if (text.includes("site") || text.includes("web")) {
          icon.dataset.icon = "globe";
        }

      });

    });

  }

  /* =========================
     OBSERVER GLOBAL (clé FA)
  ========================= */

  const observer = new MutationObserver(() => {
    apply();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  /* premier run */
  apply();

})();
