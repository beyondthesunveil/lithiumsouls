$(document).ready(function() {
  var previousChoice = localStorage.getItem('hideElement');
  if (previousChoice === 'true') {
    $('#switcheroo').addClass('hide');
  }

  $('.toggleSwitcheroo').click(function() {
    $('#switcheroo').toggleClass('hide');

    var isHidden = $('#switcheroo').hasClass('hide');

    localStorage.setItem('hideElement', isHidden);
  });
});
