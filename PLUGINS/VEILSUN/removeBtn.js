$(function () {
  const isLoggedIn =
    Number(window._userdata?.session_logged_in) === 1;

  if (isLoggedIn) {
    return;
  }

  const guestHiddenModules = [
    "#notiffi_button",
    "#fa-pins-button",
    "#FAM-button-open"
  ];

  $(guestHiddenModules.join(",")).remove();
});
