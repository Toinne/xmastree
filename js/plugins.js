// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// slide creator
(function() {
    $.get('./data/engagorTeam.json', function (data) {
        var $textContainer = $('.text-container');

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                // slide 0 already set in html
                var slideId = parseInt(key, 10) + 1;
                var slide = '<section data-id="'+ slideId +'" class="slide" data-color="'+  data[key].color +'">' +
                                '<section class="number"> ' +
                                    '<p style="color: '+ data[key].color +'">' + data[key].count + '</p> ' +
                                '</section> ' +
                                '<section class="explanation"> ' +
                                    '<p>' +
                                        data[key].description +
                                    '</p> ' +
                                '</section> ' +
                            '</section>';
                $textContainer.append(slide);
            }
        }

        // creates and sets the width of the lines
        var $circle = $('section.circle');
        var $text = $('section.text-container');

        var circlePosition = $circle.offset();
        var textPosition = $text.offset();

        var lineWidth = parseInt(textPosition.left - (circlePosition.left + $circle.width()), 10);

        // create lines
        $('.slide').each(function (){
            if (parseInt($(this).attr('data-id'), 10) != 0) {
                var gradient = 'linear-gradient(to right, #414F58 50%, '+ $(this).attr('data-color') +' 50%)';
                $(this).append($('<div data-id="'+ $(this).attr('data-id') +'" class="line"></div>'));
                $(this).find('.line').css({
                    width: lineWidth,
                    marginLeft: (0 - lineWidth - 8)
                });
            }
        });
    });
}($));

// slider
(function () {
    var active = 0;
    var disabled = false; // disable while animation is running so you don't press twice

    $(document).keypress(function (e) {
        if (e.keyCode == 32 && !disabled) {
            disabled = true;

            e.preventDefault();

            var $slide = $('.slide.active');
            var id = parseInt($slide.attr('data-id'), 10);
            ++id;
            var $nextSlide = $('.slide[data-id="'+ id +'"]');

            // remove previous slide
            $slide.find('.line').fadeOut();
            $slide.addClass('out');
            $slide.removeClass('active');

            $nextSlide.addClass('in');
            $nextSlide.addClass('active');

            window.setTimeout(function () {
                --id;
                $nextSlide.find('.line').addClass('active');
                var event = new CustomEvent('nextSet', { detail: id });
                window.dispatchEvent(event);
                disabled = false;
            },3000)
        }
    });
})($, d3);