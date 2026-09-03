jQuery(function ($) {
    $('.litso-msg_charafields').each(function () {
        var $post = $(this);
        $post.find('.litso-msg_charafield').each(function () {
            var $field = $(this);
            var label = $.trim(
                $field.find('.litso-msg_charalabel').text()
            );
            if (
                label === "Feat" ||
                label === "Date d'inscription" ||
                label === "Messages"
            ) {
                $post.find('.other').append($field);
            }
        });
    });
});
