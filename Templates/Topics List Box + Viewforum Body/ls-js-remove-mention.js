// retire mention "aller à la page" sur les forums sans plusieurs pages 

$(document).ready(function() {

  $('.lithium-tlb_pages').each(function() {
    var $pages = $(this);

    if ($pages.find('.pagination a').length > 0) {
      $pages.addClass('has-pages');
    } else {
      $pages.removeClass('has-pages');
    }
  });

});
