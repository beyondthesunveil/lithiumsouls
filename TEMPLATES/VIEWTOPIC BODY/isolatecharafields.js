jQuery(function ($) {

    $('.lithium-vb_postprofile .post').each(function () {

        var $post = $(this);

        $post.find('.lithium-vb_charafield').each(function () {

            var $field = $(this);

            var label = $.trim(
                $field.find('.lithium-vb_charalabel .label span:first').text()
            );

            if (
                label === "Feat :" ||
                label === "Date d'inscription" ||
				label === "Messages"
            ) {
                $post.find('.other').append($field);
            }

        });

    });

});
