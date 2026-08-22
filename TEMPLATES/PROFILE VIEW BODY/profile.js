<script type="text/javascript">
//<![CDATA[
(function () {
  "use strict";

  function initializeLitsoProfile() {
    var profile = document.querySelector(
      "[data-litso-profile]"
    );

    if (
      !profile ||
      profile.getAttribute(
        "data-litso-profile-ready"
      ) === "true"
    ) {
      return;
    }

    profile.setAttribute(
      "data-litso-profile-ready",
      "true"
    );

    var tabs = profile.querySelectorAll(
      "[data-litso-profile-tab]"
    );

    var panels = profile.querySelectorAll(
      "[data-litso-profile-panel]"
    );


    /* =====================================================
       ONGLETS
       ===================================================== */

    function activateTab(tabName, moveFocus) {
      var selectedTab = null;

      Array.prototype.forEach.call(
        tabs,
        function (tab) {
          var active =
            tab.getAttribute(
              "data-litso-profile-tab"
            ) === tabName;

          tab.classList.toggle(
            "is-active",
            active
          );

          tab.setAttribute(
            "aria-selected",
            active ? "true" : "false"
          );

          tab.setAttribute(
            "tabindex",
            active ? "0" : "-1"
          );

          if (active) {
            selectedTab = tab;
          }
        }
      );

      Array.prototype.forEach.call(
        panels,
        function (panel) {
          var active =
            panel.getAttribute(
              "data-litso-profile-panel"
            ) === tabName;

          panel.classList.toggle(
            "is-active",
            active
          );

          panel.hidden = !active;

          if (active) {
            panel.scrollTop = 0;
          }
        }
      );

      if (
        moveFocus &&
        selectedTab
      ) {
        selectedTab.focus();
      }
    }


    Array.prototype.forEach.call(
      tabs,
      function (tab, index) {
        tab.addEventListener(
          "click",
          function () {
            activateTab(
              tab.getAttribute(
                "data-litso-profile-tab"
              ),
              false
            );
          }
        );

        tab.addEventListener(
          "keydown",
          function (event) {
            if (
              event.key !== "ArrowLeft" &&
              event.key !== "ArrowRight" &&
              event.key !== "Home" &&
              event.key !== "End"
            ) {
              return;
            }

            event.preventDefault();

            var targetIndex = index;

            if (event.key === "ArrowRight") {
              targetIndex =
                (index + 1) % tabs.length;
            }

            if (event.key === "ArrowLeft") {
              targetIndex =
                (index - 1 + tabs.length) %
                tabs.length;
            }

            if (event.key === "Home") {
              targetIndex = 0;
            }

            if (event.key === "End") {
              targetIndex =
                tabs.length - 1;
            }

            activateTab(
              tabs[targetIndex].getAttribute(
                "data-litso-profile-tab"
              ),
              true
            );
          }
        );
      }
    );

    activateTab("identity", false);


    /* =====================================================
       ÉDITION AJAX DES CHAMPS
       ===================================================== */

    if (
      !window.jQuery ||
      typeof jQuery.toJSON !== "function"
    ) {
      return;
    }

    var $ = window.jQuery;

    $(profile)
      .find("[id^='field_id']")
      .each(function () {
        var field = $(this);
        var editable = field.find(
          ".field_editable"
        );

        if (
          !editable.is("span, div")
        ) {
          return;
        }

        field.on(
          "mouseenter",
          function () {
            if (
              !field
                .find(".field_editable.invisible")
                .is("span, div")
            ) {
              return;
            }

            if (
              field.find(
                ".ajax-profil_edit"
              ).length
            ) {
              return;
            }

            field
              .find(".field_uneditable")
              .addClass("ajax-profil_hover");

            field.addClass(
              "ajax-profil_parent"
            );

            var editButton = $(
              "<button>",
              {
                type: "button",
                class: "ajax-profil_edit",
                title: "{L_FIELD_EDIT_VALUE}",
                "aria-label":
                  "{L_FIELD_EDIT_VALUE}"
              }
            );

            editButton.append(
              $("<img>", {
                src: "{AJAX_EDIT_IMG}",
                alt: ""
              })
            );

            field.append(editButton);

            editButton.on(
              "click",
              function () {
                field
                  .find(".field_uneditable")
                  .removeClass(
                    "ajax-profil_hover"
                  )
                  .addClass("invisible");

                field
                  .find(".field_editable")
                  .removeClass("invisible");

                var validButton = $(
                  "<button>",
                  {
                    type: "button",
                    class:
                      "ajax-profil_valid",
                    title: "{L_VALIDATE}",
                    "aria-label":
                      "{L_VALIDATE}"
                  }
                );

                validButton.append(
                  $("<img>", {
                    src: "{AJAX_VALID_IMG}",
                    alt: ""
                  })
                );

                field
                  .find(".field_editable")
                  .append(validButton);

                editButton.remove();

                validButton.on(
                  "click",
                  function () {
                    var content = [];

                    field
                      .find(
                        ".field_editable [name]"
                      )
                      .each(function () {
                        var input = $(this);

                        var special =
                          input.is(
                            "input[type='radio'], input[type='checkbox']"
                          );

                        if (
                          !special ||
                          input.is(":checked")
                        ) {
                          content.push([
                            input.attr("name"),
                            input.val()
                          ]);
                        }
                      });

                    var fieldId =
                      field.attr("id").substring(8);

                    $.post(
                      "{U_AJAX_PROFILE}",
                      {
                        id: fieldId,
                        user: "{CUR_USER_ID}",
                        active:
                          "{CUR_USER_ACTIVE}",
                        content:
                          $.toJSON(content),
                        tid: "{TID}"
                      },
                      function (data) {
                        $.each(
                          data,
                          function (
                            responseId,
                            item
                          ) {
                            var target =
                              $(
                                "#field_id" +
                                responseId
                              );

                            if (
                              item.indexOf(
                                "error : "
                              ) === 0
                            ) {
                              var error =
                                target.find(
                                  ".form-error"
                                );

                              if (!error.length) {
                                error = $(
                                  "<div>",
                                  {
                                    class:
                                      "form-error"
                                  }
                                );

                                target
                                  .find(
                                    ".field_editable"
                                  )
                                  .append(error);
                              }

                              error.text(
                                item.substring(8)
                              );

                              return;
                            }

                            target
                              .find(
                                ".form-error"
                              )
                              .remove();

                            target
                              .find(
                                ".field_uneditable"
                              )
                              .html(item)
                              .removeClass(
                                "invisible"
                              );

                            target
                              .find(
                                ".field_editable"
                              )
                              .addClass(
                                "invisible"
                              );

                            target
                              .find(
                                ".ajax-profil_valid"
                              )
                              .remove();
                          }
                        );
                      },
                      "json"
                    );
                  }
                );
              }
            );
          }
        );

        field.on(
          "mouseleave",
          function () {
            if (
              field
                .find(".field_editable")
                .hasClass("invisible")
            ) {
              field
                .find(
                  ".field_uneditable"
                )
                .removeClass(
                  "ajax-profil_hover"
                );

              field
                .find(".ajax-profil_edit")
                .remove();
            }
          }
        );
      });
  }


  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLitsoProfile,
      { once: true }
    );
  } else {
    initializeLitsoProfile();
  }
})();
//]]>
</script>
