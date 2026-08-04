// affiche les balises "spoiler"

document.addEventListener("DOMContentLoaded", function() {

  document.querySelectorAll(".spoiler dt").forEach(dt => {
    const content = dt.nextElementSibling.querySelector("div");
    dt.addEventListener("click", () => {
      if(content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  });

});
