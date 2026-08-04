// fonction "copier" des balises codes

document.addEventListener("DOMContentLoaded", function() {

document.querySelectorAll(".codebox").forEach(box => {

  if (box.classList.contains("spoiler") || box.classList.contains("hidecode")) return;

  if (!box.querySelector("button.copy-btn")) {
    const btn = document.createElement("button");
    btn.textContent = "Copier le texte";
    btn.className = "copy-btn";
    box.appendChild(btn);

    btn.addEventListener("click", () => {
      const codeElement = box.querySelector("code, pre");
      const codeText = codeElement ? codeElement.innerText : "";

      navigator.clipboard.writeText(codeText).then(() => {
        btn.textContent = "Texte copié !";
        setTimeout(() => btn.textContent = "Copier le texte", 1000);
      });
    });
  }
});

});
