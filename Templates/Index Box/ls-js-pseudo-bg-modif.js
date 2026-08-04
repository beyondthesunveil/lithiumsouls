$(document).ready(function() {

  $('.lithium-ib_user span[class*="group-"]').each(function() {

    var $pseudo = $(this);

    var groupColor = $pseudo.css("color");

    $pseudo.css({
      "background-color": groupColor,
      "color": "#ffffff",
      "padding": "2px 8px",
      "border-radius": "5px",
      "width": "165px",
      "font-size": "11px",
      "margin": "10px 21px",
      "display": "block"
    });

  });

});
