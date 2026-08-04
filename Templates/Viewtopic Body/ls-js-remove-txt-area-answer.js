// Retire la mention "Réponse rapide" liée directement à FA

document.addEventListener("DOMContentLoaded", function() {
    const titres = document.querySelectorAll('.h3');

    titres.forEach(function(el) {
        if (el.textContent.includes('Réponse rapide')) {
            el.remove();
        }
    });
});
