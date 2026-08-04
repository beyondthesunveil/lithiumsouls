(function() {
   new Switcheroo('#switcheroo', {
       logo: ' logo ', /* accepte html, permet d'afficher un logo qui retourne à l'accueil du forum */
       enableReorder: true, /* activer le drag&drop pour l'ordre des comptes (true/false) */
       updateAvatar: true, /* activer le clique droit pour charger un nouvel avatar (true/false) */
       confirm: true, /* demande une confirmation avant le changement de compte */
       deleteIcon: '×', /* accepte html, icone pour supprimer un compte lié */
       addIcon: '+', /* accepte html, icone qui ouvre le formulaire de connexion et d'association */
   },
   {
       button: {
           add: "Associer un personnage",
       },
       msg: {
           error: "Une erreur est surviendu lors du Switcheroo.",
           confirm: "Confirmer le Switcheroo de personnage ?",
       },
       modal: {
           password_label: "Mot de passe",
           username_label: "Nom d'utilisateur",
           login_button: "Connexion",
       }
   });
})();
