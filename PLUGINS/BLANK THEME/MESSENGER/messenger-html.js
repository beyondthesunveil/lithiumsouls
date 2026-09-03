/* =========================================================
   LITHIUM SOULS — PONT HTML POUR LE MESSENGER

   FAM préfixe les classes présentes dans les messages avec
   "FAM-". Ce script rétablit leurs noms d’origine afin que
   les fiches retrouvent leur CSS dans le Messenger.
   ========================================================= */

(function () {
  "use strict";


  /* =======================================================
     CLASSES AUTORISÉES
     ======================================================= */

  /*
   * Seules les classes appartenant à nos codes sont
   * restaurées. Cela évite de réactiver accidentellement
   * les styles natifs de Forumactif dans le Messenger.
   */
  var supportedClassPrefixes = [
    "litso_",
    "litso-",
    "ls_",
    "ls-",
    "mxt_",
    "mxt-",
    "scrapbook_",
    "scrapbook-",
    "utpp"
  ];


  /*
   * Ces éléments ne doivent jamais être exécutés ou chargés
   * depuis le contenu d’un message.
   */
  var blockedElements = [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "link",
    "meta",
    "base"
  ].join(", ");


  /* =======================================================
     OUTILS
     ======================================================= */

  function isSupportedClass(className) {
    return supportedClassPrefixes.some(
      function (prefix) {
        return className.indexOf(prefix) === 0;
      }
    );
  }


  function secureElement(element) {
    if (!element || !element.attributes) {
      return;
    }

    Array.prototype.slice
      .call(element.attributes)
      .forEach(function (attribute) {
        var name = attribute.name.toLowerCase();

        var value = attribute.value
          .trim();


        /*
         * Retire les événements HTML potentiellement
         * dangereux : onclick, onerror, onload, etc.
         *
         * L’événement ajouté par FAM aux images est conservé
         * afin que sa visionneuse puisse encore fonctionner.
         */
        if (
          name.indexOf("on") === 0 &&
          !(
            name === "onclick" &&
            value === "FAM.modal.open(this);"
          )
        ) {
          element.removeAttribute(
            attribute.name
          );
        }


        /*
         * Neutralise les liens ou images utilisant du
         * JavaScript dans leur adresse.
         */
        if (
          (
            name === "href" ||
            name === "src"
          ) &&
          /^javascript:/i.test(value)
        ) {
          element.removeAttribute(
            attribute.name
          );
        }


        /*
         * Empêche l’injection d’un document HTML dans
         * un éventuel iframe.
         */
        if (name === "srcdoc") {
          element.removeAttribute(
            attribute.name
          );
        }
      });


    /*
     * Sécurise les liens ouverts dans un nouvel onglet.
     */
    if (
      element.tagName === "A" &&
      element.getAttribute("target") === "_blank"
    ) {
      element.setAttribute(
        "rel",
        "noopener noreferrer"
      );
    }
  }


  function restoreClassAliases(element) {
    if (!element || !element.classList) {
      return;
    }

    Array.prototype.slice
      .call(element.classList)
      .forEach(function (className) {
        /*
         * Ignore les classes que FAM n’a pas préfixées.
         */
        if (
          className.indexOf("FAM-") !== 0
        ) {
          return;
        }


        /*
         * FAM-litso_context_
         * devient également :
         * litso_context_
         */
        var originalClass =
          className.slice(4);


        if (
          originalClass &&
          isSupportedClass(originalClass)
        ) {
          element.classList.add(
            originalClass
          );
        }
      });
  }


  function restoreLazyImage(image) {
    if (!image) {
      return;
    }


    /*
     * Certaines images Forumactif utilisent data-src
     * avant leur véritable chargement.
     */
    if (!image.getAttribute("src")) {
      var source =
        image.getAttribute("data-src") ||
        image.getAttribute("data-original") ||
        image.getAttribute("data-lazy-src");


      if (source) {
        image.setAttribute(
          "src",
          source
        );
      }
    }


    /*
     * Les dimensions HTML pourraient empêcher le CSS
     * propre à la fiche de redimensionner l’image.
     */
    image.removeAttribute("width");
    image.removeAttribute("height");
  }


  /* =======================================================
     TRAITEMENT D’UN MESSAGE
     ======================================================= */

  function enhanceMessage(message) {
    if (!message) {
      return;
    }


    /*
     * Retire les éléments qui pourraient exécuter du code
     * ou charger un document extérieur.
     */
    message
      .querySelectorAll(blockedElements)
      .forEach(function (element) {
        element.remove();
      });


    /*
     * Sécurise les éléments puis restaure les classes
     * originales de nos fiches.
     */
    message
      .querySelectorAll("*")
      .forEach(function (element) {
        secureElement(element);
        restoreClassAliases(element);
      });


    /*
     * Répare les images chargées paresseusement.
     */
    message
      .querySelectorAll("img")
      .forEach(function (image) {
        restoreLazyImage(image);
      });


    message.setAttribute(
      "data-litso-fam-html",
      "ready"
    );
  }


  function enhanceAllMessages(root) {
    if (!root) {
      return;
    }


    /*
     * Le nœud ajouté peut être directement un message.
     */
    if (
      root.nodeType === 1 &&
      root.matches &&
      root.matches(".FAM-msg-text")
    ) {
      enhanceMessage(root);
    }


    /*
     * Ou contenir un ou plusieurs messages.
     */
    if (root.querySelectorAll) {
      root
        .querySelectorAll(".FAM-msg-text")
        .forEach(function (message) {
          enhanceMessage(message);
        });
    }
  }


  /* =======================================================
     INITIALISATION
     ======================================================= */

  function initializeLitsoFamHtml() {
    /*
     * Traite les messages éventuellement déjà présents.
     */
    enhanceAllMessages(document);


    if (!("MutationObserver" in window)) {
      return;
    }


    var animationFrame = null;
    var pendingRoots = [];


    /*
     * FAM charge les messages dynamiquement.
     * L’observateur intervient donc après chaque ajout.
     */
    var observer = new MutationObserver(
      function (mutations) {
        mutations.forEach(
          function (mutation) {
            mutation.addedNodes.forEach(
              function (node) {
                if (node.nodeType === 1) {
                  pendingRoots.push(node);
                }
              }
            );
          }
        );


        if (
          animationFrame !== null ||
          !pendingRoots.length
        ) {
          return;
        }


        /*
         * Regroupe tous les ajouts dans une seule passe
         * pour éviter de ralentir le Messenger.
         */
        animationFrame =
          requestAnimationFrame(
            function () {
              pendingRoots
                .splice(0)
                .forEach(function (root) {
                  enhanceAllMessages(root);
                });


              animationFrame = null;
            }
          );
      }
    );


    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );
  }


  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoFamHtml,
      { once: true }
    );
  } else {
    initializeLitsoFamHtml();
  }
})();
