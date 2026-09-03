$(function() {
    // clic sur un onglet
    var d = function() {
        // si l'onglet est déjà actif, ne rien faire
        if ($(this).is(".selected")) return;
        // affiche le contenu correspondant et on met l'onglet en sélectionné
        var a = $(this).closest(".systab");
        a.find(".selected").removeClass("selected").filter(".content")[a.is(".s_slide") ? "slideUp" : a.is(".s_fade") ? "fadeOut" : "hide"](+((a.attr("class") || "").match(/^[sS]*(?:^|s)s_trans([0-9]+)(?:s|$)[sS]*$/) || ["", 500])[1]);
        $(this).addClass("selected").data("content").addClass("selected").stop(!0, !0)[a.is(".s_slide") ? "slideDown" : a.is(".s_fade") ? "fadeIn" : "show"](+((a.attr("class") || "").match(/^[sS]*(?:^|s)s_trans([0-9]+)(?:s|$)[sS]*$/) || ["", 500])[1])
    };
    // pour chacun des systèmes d'onglets
    $("div.systab").each(function() {
        var a = $("> div", this).detach(),
            c = this,
            b;
        // on ajoute le conteneur d'onglet avant ou après ( si s_bottom )
        $(this).html('<div class="' + ($(this).is(".s_bottom") ? "contents" : "tabs") + '"></div><div class="' + ($(this).is(".s_bottom") ?
            "tabs" : "contents") + '"></div>');
        $(a).each(function() {
            b = $(this).children(":first");
            b.is("span") ? (
                $("> div.tabs", c).append($(b).addClass("tab").data("content", $(this))), $(this).addClass("content").data("tab", b)) : $(this).remove()
        });
        $("> div.contents", this).append(a);
        b = $(".content:first,.content.selected", this).last();
        $(b).addClass("selected").siblings().hide();
        $(b).data("tab").addClass("selected")
    }).on("click", ".tab", d).filter(".s_hover").on("mouseenter", ".tab", d)
});
