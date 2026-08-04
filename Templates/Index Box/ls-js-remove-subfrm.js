// Fait en sorte de ne pas déformer le titre (?) des catégories s'il n'y a pas de sous-forum

document.addEventListener("DOMContentLoaded", function() {

  document.querySelectorAll(".lithium-ib_subfrm").forEach(function(block) {

    const links = block.querySelectorAll("a");

    links.forEach(function(link) {
      if (link.textContent.trim() === "") {
        link.remove();
      }
    });

    if (block.querySelectorAll("a").length === 0) {
      block.remove(); 
    }

  });

});
