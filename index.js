/*  jQuery Nice Select - v1.1.0
    https://github.com/hernansartorio/jquery-nice-select
    Made by Hernán Sartorio  */

(function ($) {
  $.fn.niceSelect = function (method) {
    // Methods
    if (typeof method == "string") {
      if (method == "update") {
        this.each(function () {
          var $select = $(this);
          var $dropdown = $(this).next(".nice-select");
          var open = $dropdown.hasClass("open");

          if ($dropdown.length) {
            $dropdown.remove();
            create_nice_select($select);

            if (open) {
              $select.next().trigger("click");
            }
          }
        });
      } else if (method == "destroy") {
        this.each(function () {
          var $select = $(this);
          var $dropdown = $(this).next(".nice-select");

          if ($dropdown.length) {
            $dropdown.remove();
            $select.css("display", "");
          }
        });
        if ($(".nice-select").length == 0) {
          $(document).off(".nice_select");
        }
      } else {
        console.log('Method "' + method + '" does not exist.');
      }
      return this;
    }

    // Hide native select
    this.hide();

    // Create custom markup
    this.each(function () {
      var $select = $(this);

      if (!$select.next().hasClass("nice-select")) {
        create_nice_select($select);
      }
    });

    function create_nice_select($select) {
      $select.after(
        $("<div></div>")
          .addClass("nice-select")
          .addClass($select.attr("class") || "")
          .addClass($select.attr("disabled") ? "disabled" : "")
          .addClass($select.prop("multiple") ? "has-multiple" : "")
          .attr("tabindex", $select.attr("disabled") ? null : "0")
          .html('<span class="current"></span><ul class="list"></ul>')
      );

      var $dropdown = $select.next();
      var $options = $select.find("option");
      var $selected = $select.find("option:selected");

      if ($select.prop("multiple")) {
        var selected = [];
        $selected.each(function () {
          selected.push($(this).data("display") || $(this).text());
        });
        $dropdown
          .find(".current")
          .html(selected.length ? selected.join(", ") : "Select Options");
      } else {
        $dropdown
          .find(".current")
          .html($selected.data("display") || $selected.text());
      }

      $options.each(function (i) {
        var $option = $(this);
        var display = $option.data("display");
        var value = $option.val();

        var isSelected =
          $option.is(":selected") && value !== "" && $select.prop("multiple")
            ? " selected"
            : $option.is(":selected") && !$select.prop("multiple")
            ? " selected"
            : "";

        $dropdown.find("ul").append(
          $("<li></li>")
            .attr("data-value", value)
            .attr("data-display", display || null)
            .addClass(
              "option" +
                isSelected +
                ($option.is(":disabled") ? " disabled" : "")
            )
            .html($option.text())
        );
      });
    }

    /* Event listeners */

    // Unbind existing events in case that the plugin has been initialized before
    $(document).off(".nice_select");

    // Open/close
    $(document).on("click.nice_select", ".nice-select", function (event) {
      var $dropdown = $(this);

      $(".nice-select").not($dropdown).removeClass("open");
      $dropdown.toggleClass("open");

      if ($dropdown.hasClass("open")) {
        $dropdown.find(".option");
        $dropdown.find(".focus").removeClass("focus");
        $dropdown.find(".selected").addClass("focus");
      } else {
        $dropdown.focus();
      }
    });

    // Close when clicking outside
    $(document).on("click.nice_select", function (event) {
      if ($(event.target).closest(".nice-select").length === 0) {
        $(".nice-select").removeClass("open").find(".option");
      }
    });

    // Option click
    $(document).on(
      "click.nice_select",
      ".nice-select .option:not(.disabled)",
      function (event) {
        var $option = $(this);
        var $dropdown = $option.closest(".nice-select");
        var $select = $dropdown.prev("select");

        if ($select.prop("multiple")) {
          event.stopPropagation();

          if (!$option.data("value")) {
            return;
          }

          $option.toggleClass("selected");

          var selectedValues = [];
          var selectedTexts = [];
          $dropdown.find(".selected").each(function () {
            if ($(this).data("value")) {
              selectedValues.push($(this).data("value"));
              selectedTexts.push($(this).data("display") || $(this).text());
            }
          });

          $dropdown
            .find(".current")
            .html(
              selectedTexts.length ? selectedTexts.join(", ") : "Select Options"
            );
          $select.val(selectedValues).trigger("change");
        } else {
          // Original single select behavior
          $dropdown.find(".selected").removeClass("selected");
          $option.addClass("selected");

          var text = $option.data("display") || $option.text();
          $dropdown.find(".current").text(text);

          $select.val($option.data("value")).trigger("change");
          $dropdown.removeClass("open");
          event.stopPropagation();
        }
      }
    );

    // Keyboard events
    $(document).on("keydown.nice_select", ".nice-select", function (event) {
      var $dropdown = $(this);
      var $focused_option = $(
        $dropdown.find(".focus") || $dropdown.find(".list .option.selected")
      );

      // Space or Enter
      if (event.keyCode == 32 || event.keyCode == 13) {
        if ($dropdown.hasClass("open")) {
          $focused_option.trigger("click");
        } else {
          $dropdown.trigger("click");
        }
        return false;
        // Down
      } else if (event.keyCode == 40) {
        if (!$dropdown.hasClass("open")) {
          $dropdown.trigger("click");
        } else {
          var $next = $focused_option.nextAll(".option:not(.disabled)").first();
          if ($next.length > 0) {
            $dropdown.find(".focus").removeClass("focus");
            $next.addClass("focus");
          }
        }
        return false;
        // Up
      } else if (event.keyCode == 38) {
        if (!$dropdown.hasClass("open")) {
          $dropdown.trigger("click");
        } else {
          var $prev = $focused_option.prevAll(".option:not(.disabled)").first();
          if ($prev.length > 0) {
            $dropdown.find(".focus").removeClass("focus");
            $prev.addClass("focus");
          }
        }
        return false;
        // Esc
      } else if (event.keyCode == 27) {
        if ($dropdown.hasClass("open")) {
          $dropdown.trigger("click");
        }
        // Tab
      } else if (event.keyCode == 9) {
        if ($dropdown.hasClass("open")) {
          return false;
        }
      }
    });

    // Detect CSS pointer-events support, for IE <= 10. From Modernizr.
    var style = document.createElement("a").style;
    style.cssText = "pointer-events:auto";
    if (style.pointerEvents !== "auto") {
      $("html").addClass("no-csspointerevents");
    }

    return this;
  };
})(jQuery);
