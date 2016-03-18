/*!
 * Clean Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2014 Start Bootstrap
 * Licensed under Apache 2.0 (https://github.com/IronSummitMedia/startbootstrap/blob/gh-pages/LICENSE)
 */

// Tooltip Init
$(function() {
    $("[data-toggle='tooltip']").tooltip();
});


// Contact form scripts
(function() {
  jQuery(document).ready(function($) {

    $('#contact-form #name').change(function(e) {
      if ($(this).val() == '') {
        $('#contact-form #name-form-group').addClass('has-error');
        $('#contact-form #name-required-alert').removeClass('hide');
      } else {
        $('#contact-form #name-form-group').removeClass('has-error');
        $('#contact-form #name-required-alert').addClass('hide');
      }
    });

    $('#contact-form #email').change(function(e) {
      if ($(this).val() == '') {
        $('#contact-form #email-form-group').addClass('has-error');
        $('#contact-form #email-required-alert').removeClass('hide');
      } else {
        $('#contact-form #email-form-group').removeClass('has-error');
        $('#contact-form #email-required-alert').addClass('hide');
      }
    });

    $('#contact-form #text').change(function(e) {
      if ($(this).val() == '') {
        $('#contact-form #text-form-group').addClass('has-error');
        $('#contact-form #text-required-alert').removeClass('hide');
      } else {
        $('#contact-form #text-form-group').removeClass('has-error');
        $('#contact-form #text-required-alert').addClass('hide');
      }
    });

    $('#contact-form').submit(function(e) {
      e.preventDefault();

      var data = {
        name: $('#contact-form #name').val(),
        email: $('#contact-form #email').val(),
        text: $('#contact-form #text').val(),
        recaptcha: grecaptcha.getResponse(),
      };

      // crappy form validation
      var valid = true;
      if (data.name == '') {
        if ($('#contact-form #name').val() == '') {
          $('#contact-form #name-form-group').addClass('has-error');
          $('#contact-form #name-required-alert').removeClass('hide');
        } else {
          $('#contact-form #name-form-group').removeClass('has-error');
          $('#contact-form #name-required-alert').addClass('hide');
        }
        valid = false;
      }
      if (data.email == '') {
        if ($('#contact-form #email').val() == '') {
          $('#contact-form #email-form-group').addClass('has-error');
          $('#contact-form #email-required-alert').removeClass('hide');
        } else {
          $('#contact-form #email-form-group').removeClass('has-error');
          $('#contact-form #email-required-alert').addClass('hide');
        }
        valid = false;
      }
      if (data.text == '') {
        if ($('#contact-form #text').val() == '') {
          $('#contact-form #text-form-group').addClass('has-error');
          $('#contact-form #text-required-alert').removeClass('hide');
        } else {
          $('#contact-form #text-form-group').removeClass('has-error');
          $('#contact-form #text-required-alert').addClass('hide');
        }
        valid = false;
      }
      if (!valid) {
        return;
      }

      // send request
      var posting = $.ajax({
        type: 'POST',
        url: "https://develcraft.com/api/send-mail",
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data)
      });
      posting
      .done(function (data) {
        if (data.success) {
          $('#send-success-alert').removeClass('hide');
          $('#contact-form-wrapper').addClass('hide');
        } else {
          if (data.reason === 'recaptcha_check_failed') {
            grecaptcha.reset();
            $('#contact-form #recaptcha-form-group').addClass('has-error');
            $('#contact-form #recaptcha-failed-alert').removeClass('hide');
          } else {
            console.log("submit contact form failed: " + data.reason);
            $('#send-failed-alert').removeClass('hide');
          }
        }
      })
      .fail(function(data) {
        $('#send-failed-alert').removeClass('hide');
      });
    });

  });
})();

/* I don't want to juggle with the header bar
 *
// Navigation Scripts to Show Header on Scroll-Up
jQuery(document).ready(function($) {
    var MQL = 1170;

    //primary navigation slide-in effect
    if ($(window).width() > MQL) {
        var headerHeight = $('.navbar-custom').height();
        $(window).on('scroll', {
                previousTop: 0
            },
            function() {
                var currentTop = $(window).scrollTop();
                //check if user is scrolling up
                if (currentTop < this.previousTop) {
                    //if scrolling up...
                    if (currentTop > 0 && $('.navbar-custom').hasClass('is-fixed')) {
                        $('.navbar-custom').addClass('is-visible');
                    } else {
                        $('.navbar-custom').removeClass('is-visible is-fixed');
                    }
                } else {
                    //if scrolling down...
                    $('.navbar-custom').removeClass('is-visible');
                    if (currentTop > headerHeight && !$('.navbar-custom').hasClass('is-fixed')) $('.navbar-custom').addClass('is-fixed');
                }
                this.previousTop = currentTop;
            });
    }
});
*/
