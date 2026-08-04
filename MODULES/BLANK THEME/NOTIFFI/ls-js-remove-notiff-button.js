$(function () {

  const update = () => {
    const notif = $('#notiffi_button').is(':visible');

    if (notif) {
      $('.sidebar').addClass('has-notiffi');
    } else {
      $('.sidebar').removeClass('has-notiffi');
    }
  };

  update();

  new MutationObserver(update).observe(document.body, {
    childList: true,
    subtree: true
  });

});
