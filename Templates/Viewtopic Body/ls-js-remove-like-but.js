// retire la fonction "j'aime" aux yeux des invités

$(document).ready(function() {

  if ($('#logout').length === 0) {
    $('.fa_like_div').remove();
  }

});
