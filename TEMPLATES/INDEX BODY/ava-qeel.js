$(function () {
  var newestLink = $(".litso-qeel_newestName a[href^='/u']")[0];

  if (!newestLink) {
    return;
  }

  $.get(newestLink.href, function (data) {
    var avatar = $("#litso-profile_avatar img", $(data));

    if (avatar.length) {
      $("#ava_lastmember").html(avatar);
    }
  });
});
