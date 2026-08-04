document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lithium-tlb_background").forEach(topic => {

    const icon = topic.querySelector(".topic-icon");
    if (!icon) return;

    const style = icon.style.backgroundImage;

    if (style.includes("sticky")) {
      topic.classList.add("is-note");
    }
    else if (style.includes("announce")) {
      topic.classList.add("is-announcement");
    }
    else if (style.includes("global")) {
      topic.classList.add("is-global");
    }

  });
});
