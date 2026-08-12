var homeButton = navbar.querySelector(".litso-nav_home");

function placeNotiffiButton() {
  var notiffiButton = document.getElementById(
    "notiffi_button"
  );

  if (!homeButton || !notiffiButton) {
    return false;
  }

  if (homeButton.nextElementSibling !== notiffiButton) {
    homeButton.insertAdjacentElement(
      "afterend",
      notiffiButton
    );
  }

  return true;
}

if (!placeNotiffiButton() && "MutationObserver" in window) {
  var notiffiObserver = new MutationObserver(function () {
    if (placeNotiffiButton()) {
      notiffiObserver.disconnect();
    }
  });

  notiffiObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}
