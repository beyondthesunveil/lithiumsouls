$(document).ready(function() {

  const groupNames = {
    2: "Mascotte",
    3: "Infernaux",
    4: "Damné·e·s",
    5: "Suprêmes",
    6: "Royauté",
    7: "Péchés capitaux",
    8: "Déchu·e·s",
    9: "Anomalies",
  };

  $('.lithium-vb_posttracker').each(function() {

    const $tracker = $(this);

    const $pseudo = $tracker.find('.lithium-vb_postname span[class*="group-"]');
    if (!$pseudo.length) return;

    const match = $pseudo.attr('class').match(/group-(\d+)/);
    if (!match) return;

    const groupId = match[1];
    const groupName = groupNames[groupId] || "";
    const groupColor = $pseudo.css("color") || "#666";

    const $groupLabel = $tracker.find('.lithium-vb_postname');

    if ($groupLabel.length) {
      $groupLabel
        .text(groupName)
        .css("color", groupColor);
    }

  });

});
