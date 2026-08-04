$(document).ready(function() {

  function scanNotifications() {

    $('.notification').each(function() {

      var $notif = $(this);

      if ($notif.data('done')) return;

      var $text = $notif.find('.notif_text');
      var $avatar = $notif.find('.notif_avatar');

      if (!$text.length || !$avatar.length) return;
      
      var isGuest = $text.text().toLowerCase().includes("invité");
      
      if (!isGuest) {
        $notif.data('done', true);
        return;
      }

      $avatar
        .data('done', true)
        .addClass('notif-guest');

      $notif.data('done', true);

    });

  }

  scanNotifications();

  new MutationObserver(scanNotifications).observe(document.body, {
    childList: true,
    subtree: true
  });

});
