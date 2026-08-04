document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("notiffi_panel");
  const sidebar = document.querySelector(".sidebar");

  if (!panel || !sidebar) return;

  const isOpen = () =>
    panel.classList.contains("open") ||
    panel.classList.contains("active") ||
    panel.style.display === "block";

  let last = null;

  const sync = () => {
    const state = isOpen();

    if (state === last) return;
    last = state;

    requestAnimationFrame(() => {
      sidebar.style.transform = state
        ? "translateX(-500px)"
        : "translateX(0)";

      document.documentElement.style.setProperty(
        "--sidebar-offset",
        state ? "500px" : "0px"
      );
    });
  };

  const observer = new MutationObserver(sync);

  observer.observe(panel, {
    attributes: true,
    attributeFilter: ["class", "style"]
  });

  sync();
});
