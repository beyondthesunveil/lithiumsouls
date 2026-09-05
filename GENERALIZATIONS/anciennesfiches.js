const tabs = document.querySelectorAll(".lst_fptabind");
const contents = document.querySelectorAll(".lst_fpcontent");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    contents.forEach((c) => {
      c.classList.remove("active");
      if (c.dataset.content === target) {
        setTimeout(() => {
          c.classList.add("active");
        }, 50);
      }
    });
  });
});
