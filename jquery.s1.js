;(function($) {
    "use strict";

$.fn.cycle = function(options) {
    return this.each(function() {
        options = options || {};

        if (this.cycleTimeout) {
            clearTimeout(this.cycleTimeout);
        }

        this.cycleTimeout = 0;
        this.cyclePause = 0;

        var $cont = $(this);
        var $slides = $cont.children();
        var els = $slides.get();
        if (els.length < 2) {
            console.log('too few');
            return;
        }

        var optsArr = [];
        $slides.each(function() {
            if (!this.getAttribute('slideshow')) {
                console.log('less slideshow');
                return;
            }
            var opts = $.extend({}, $.fn.cycle.defaults, JSON.parse(this.getAttribute('slideshow')));
            opts.before = [];
            opts.after = [];
            opts.after.unshift(function() {opts.busy = 0;});
            
            var cls = this.className;
            opts.width = parseInt((cls.match(/w:(\d+)/) || [])[1], 10) || opts.width;
            opts.height = parseInt((cls.match(/w:(\d+)/) || [])[1], 10) || opts.height;
            opts.timeout = parseInt((cls.match(/w:(\d+)/) || [])[1], 10) || opts.timeout;

            if (opts.width) {
                $cont.width(opts.width);
            }
            if (opts.height && opts.height != 'auto') {
                $cont.height(opts.height);
            }
            optsArr.push(opts);
        });

        if ($cont.css('position') === 'static') {
            $cont.css('position', 'relative');
        }

        var first = 0;
        $slides.css({position: 'absolute', top: 0}).each(function(i) {
            $(this).css('z-index', els.length - i);
        });
        $(els[first]).css('opacity', 1).show();

        $slides.each(function(i) {
            var opts = optsArr[i];
            var txFnIn = $.fn.cycle.transitions[opts.fxIn];
            var txFnOut = $.fn.cycle.transitions[opts.fxOut];
            if (txFnIn && txFnOut) {
                var resultIn = txFnIn($cont, true);
                var resultOut = txFnOut($cont, false);
                opts.cssBefore = resultIn.jimmi;
                opts.animIn = resultIn.aaja;
                opts.animOut = resultOut.jimmi;
                opts.cssAfter = resultOut.aaja;
                $.fn.cycle.commonSet(opts);
            }
        });

        // $slides.each(function() {
        //     var $el = $(this);
        //     this.cycleH = (opts.fit && opts.height) ? opts.height : $el.height;
        //     this.cycleW = (opts.fit && opts.width) ? opts.width : $el.width;
        // });

        // if (opts.timeout) {
        //     while ((opts.timeout - opts.speed) < 250) {
        //         opts.timeout += opts.speed;
        //     }
        // }
        // opts.speedIn = opts.speed;
        // opts.speedOut = opts.speed;
        var config = {};
        config.slideCount = els.length;
        config.currSlide = first;
        config.nextSlide = 1;
        config.timeout = optsArr[first].timeout;
        // var e0 = $slides[first];
        // if (opts.before.length) {
        //     opts.before[0].apply(e0, [e0, e0, opts, true]);
        // }
        // if (opts.after.length > 1) {
        //     opts.after[1].apply(e0, [e0, e0, opts, true]);
        // }
        if (config.timeout)  {
            this.cycleTimeout = setTimeout(function() {
                go(els, config, 0, !config.rev, optsArr);
            }, config.timeout);
        }
    });
};

function go(els, config, manual, fwd, optsArr) {
    var p = els[0].parentNode, curr = els[config.currSlide], next = els[config.nextSlide];
    if (p.cycleTimeout === 0 && !manual) {
        return;
    }
    // if (config.before.length) {
    //     $.each(config.before, function(i, o) {o.apply(next, [curr, next, config, fwd]);});
    // }

    var after = function() {
        // $.each(config.after, function(i, o) {o.apply(next, [curr, next, config, fwd]);});
        config.timeout = optsArr[config.nextSlide].timeout;
        console.log(config.timeout);
        if (config.timeout) {
            console.log('121');
            p.cycleTimeout = setTimeout(function() {go(els, config, 0, !config.rev, optsArr);}, config.timeout);
        }
    };

    if (config.nextSlide !== config.currSlide) {
        $.fn.cycle.custom(curr, next, config, after, optsArr);
    }
    var roll = (config.nextSlide + 1) === els.length;
    config.nextSlide = roll ? 0 : config.nextSlide + 1;
    config.currSlide = roll ? els.length - 1 : config.nextSlide - 1;

}

$.fn.cycle.custom = function(curr, next, config, cb, optsArr) {
    var $l = $(curr), $n = $(next);
    var currOpts = optsArr[config.currSlide];
    var nextOpts = optsArr[config.nextSlide];
    // opts.cssBefore.opacity = 0;
    // opts.cssBefore.left = 0;
    $n.css(nextOpts.cssBefore);
    // console.log(opts.animOut);
    var fn = function() {$n.animate(nextOpts.animIn, nextOpts.speedIn, nextOpts.easeIn, cb);};
    $l.animate(currOpts.animOut, currOpts.speedOut, currOpts.easeOut, function() {
        $l.css(currOpts.cssAfter);
    });
    fn();
};

// $.fn.cycle.transitions = {
//     fade: function($cont, $slides, opts) {
//         $slides.not(':eq(0)').hide();
//         opts.cssBefore = {opacity: 0, display: 'block'};
//         opts.cssAfter = {display: 'none'};
//         opts.animOut = {opacity: 0};
//         opts.animIn = {opacity: 1};
//     },
//     blindX: function($cont, $slides, opts) {
//         var w = $cont.css('overflow', 'hidden').width();
//         // opts.before.push(function(curr, next, opts) {
//         //     $.fn.cycle.commonReset(curr, next, opts);
//         //     // opts.animIn.width = next.cycleW;
//         //     // opts.animOut.left = curr.cycleW;
//         // });
//         // opts.cssBefore.left = w;
//         // opts.cssBefore.top = 0;
//         // opts.animIn.left = 0;
//         // opts.animOut.left = w;

//         // opts.cssBefore = {left: w, display: 'block'};
//         // opts.animIn = {left: 0};

//         // opts.animOut = {opacity: 0};
//         // opts.cssAfter = {display: 'none', opacity: 1};

//         opts.cssBefore = {opacity: 0, display: 'block'};
//         opts.animIn = {opacity: 1};

//         opts.animOut = {left: -w};
//         opts.cssAfter = {display: 'none', left: 0};
//     }
// };

$.fn.cycle.transitions = {
    fade: function($cont, isIn) {
        var result = {};
        result = { 
            "jimmi": {opacity : 0},
            "aaja": {opacity: 1}
        };
        return result;
    },
    blindX: function($cont, isIn) {
        var result = {};
        var w = $cont.css('overflow', 'hidden').width();
        w = isIn ? w : -w;
        result = { 
            "jimmi": {left : w},
            "aaja": {left: 0}
        };
        return result;
    }
}

$.fn.cycle.commonSet = function(opts) {
    opts.cssBefore.display = 'block';
    opts.cssAfter.display = 'none';
};

$.fn.cycle.commonReset = function(curr, next, opts, w, h , rev) {
    $(opts.elements).not(curr).hide();
    if (typeof opts.cssBefore.opacity === 'undefined') {
        // opts.cssBefore.opacity = 0;
    }
    opts.cssBefore.display = 'block';
    if (opts.slideResize && w !== false && next.cycleW > 0) {
        opts.cssBefore.width = next.cycleW;
    }
    if (opts.slideResize && h !== false && next.cycleH > 0) {
        opts.cssBefore.height = next.cycleH;
    }
    opts.cssAfter = opts.cssAfter || {};
    opts.cssAfter.display = 'none';
    $(curr).css('zIndex', opts.slideCount + (rev? 1 : 0));
    $(next).css('zIndex', opts.slideCount + (rev? 0 : 1));
};

$.fn.cycle.defaults = {
    animIn:     {},
    animOut:    {},
    fx:         'blindX',
    after:      null,
    before:     null,
    cssBefore:  {},
    cssAfter:   {},
    delay:      0,
    fit:        0,
    height:     'auto',
    speed:      1000,
    speedIn:    1000,
    speedOut:   1000,
    timeout:    1000
};
})(jQuery);