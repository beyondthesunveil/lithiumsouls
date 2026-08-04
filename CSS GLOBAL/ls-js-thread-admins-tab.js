// onglets des fiches admins, sans doute à supprimer

document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".lstab");
  const contents = document.querySelectorAll(".ls-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      contents.forEach((c) => c.classList.remove("active"));

      const activeContent = document.querySelector(
        `.ls-tab[data-content="${target}"]`
      );
      if (activeContent) {
        activeContent.classList.add("active");
      }
    });
  });
});
