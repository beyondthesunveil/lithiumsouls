// fait fonctionner le petit code de traduction

document.addEventListener("DOMContentLoaded", function () {
  const textElements = document.querySelectorAll(".translatable");

  textElements.forEach(function (textElement) {
    const originalText = textElement.textContent;
    const altText = textElement.getAttribute("trad");

    textElement.addEventListener("mouseover", function () {
      textElement.textContent = altText;
    });

    textElement.addEventListener("mouseout", function () {
      textElement.textContent = originalText;
    });
  });
});
