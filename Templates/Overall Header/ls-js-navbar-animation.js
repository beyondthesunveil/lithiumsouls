window.addEventListener("load", () => {
  const initNavbar = () => {
    const navbar = document.querySelector(".lithium-oh_navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
      const rect = navbar.getBoundingClientRect();

      if (rect.top <= 0) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });

    document.querySelectorAll(".nav-inner a.mainmenu").forEach(link => {
      if (!link.querySelector(".link-text")) {
        const text = link.textContent.trim();
        link.textContent = "";

        const span = document.createElement("span");
        span.className = "link-text";
        span.textContent = text;

        link.appendChild(span);
      }
    });
  };

  const observer = new MutationObserver(() => {
    initNavbar();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial
  setTimeout(initNavbar, 200);
});
