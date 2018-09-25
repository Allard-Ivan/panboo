;(function($) {
    "use strict";

var code = 'data-panboo';

$.fn.panboo = function(options) {
    return this.each(function() {
        options = options || {};

        if (this.panbooTimeout) {
            clearTimeout(this.panbooTimeout);
        }

        this.panbooTimeout = 0;

        var $cont = $(this);
        var $slides = $cont.children();
        var els = $slides.get();
        if (els.length < 2) {
            console.log('too few');
            return;
        }
        
        var config = {};
        var optsArr = [];
        $slides.each(function() {
            var attrValue = this.getAttribute(code);
            if (attrValue) {
                attrValue = JSON.parse(attrValue);
            }
            var $el = $(this);
            this.panbooW = $el.width();
            this.panbooH = $el.height();
            var opts = $.extend({}, $.fn.panboo.defaults, attrValue);
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
        $slides.not(':eq(0)').hide();

        $slides.each(function(i) {
            var opts = optsArr[i];
            var txFnIn = $.fn.panboo.transitions[opts.fxIn];
            var txFnOut = $.fn.panboo.transitions[opts.fxOut];
            if (txFnIn && txFnOut) {
                var resultIn = txFnIn($cont, true, opts);
                var resultOut = txFnOut($cont, false, opts);
                opts.cssBefore = resultIn.jimmi;
                opts.animIn = resultIn.aaja;
                opts.animOut = resultOut.jimmi;
                opts.cssAfter = resultOut.aaja;
                $.fn.panboo.commonSet(opts);
            }
        });

        config.slideCount = els.length;
        config.currSlide = first;
        config.nextSlide = 1;
        config.timeout = optsArr[first].timeout;
        if (config.timeout)  {
            this.panbooTimeout = setTimeout(function() {
                go(els, config, optsArr);
            }, config.timeout);
        }
    });
};

function go(els, config, optsArr) {
    if (config.busy) {
        return;
    }
    var p = els[0].parentNode, curr = els[config.currSlide], next = els[config.nextSlide];
    if (p.panbooTimeout === 0) {
        return;
    }
    if (optsArr[config.currSlide].before.length) {
        $.each(optsArr[config.currSlide].before, function(i, o) {o.apply(next, [curr, next, optsArr[config.currSlide]]);});
    }

    var after = function() {
        // $.each(config.after, function(i, o) {o.apply(next, [curr, next, config, fwd]);});
        config.timeout = optsArr[config.currSlide].timeout;
        $.each(optsArr[config.currSlide].after, function(i, o) {config.busy = 0;});
        if (config.timeout) {
            p.panbooTimeout = setTimeout(function() {go(els, config, optsArr);}, config.timeout);
        }
    };

    if (config.nextSlide !== config.currSlide) {
        config.busy = 1;
        $.fn.panboo.custom(curr, next, config, after, optsArr);
    }
    var roll = (config.nextSlide + 1) === els.length;
    config.nextSlide = roll ? 0 : config.nextSlide + 1;
    config.currSlide = roll ? els.length - 1 : config.nextSlide - 1;
}

$.fn.panboo.custom = function(curr, next, config, cb, optsArr) {
    var $l = $(curr), $n = $(next);
    var currOpts = optsArr[config.currSlide];
    var nextOpts = optsArr[config.nextSlide];
    $n.css(nextOpts.cssBefore);
    var fn = function() {$n.animate(nextOpts.animIn, nextOpts.speedIn, nextOpts.easeIn, cb);};
    $l.animate(currOpts.animOut, currOpts.speedOut, currOpts.easeOut, function() {
        $l.css(currOpts.cssAfter);
    });
    fn();
};

$.fn.panboo.transitions = {
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
    },
    blindY: function($cont, isIn) {
        var result = {};
        var h = $cont.css('overflow', 'hidden').height();
        h = isIn ? h : -h;
        result = { 
            "jimmi": {top : h},
            "aaja": {top: 0}
        };
        return result;
    },
    blindZ: function($cont, isIn) {
        var result = {};
        var w = $cont.css('overflow', 'hidden').width();
        var h = $cont.height();
        w = isIn ? w : -w;
        h = isIn ? h : -h;
        result = { 
            "jimmi": {left: w, top : h},
            "aaja": {left: 0, top: 0}
        };
        return result;
    },
    growX: function($cont, isIn, opts) {
        var result = {};
        if (isIn) {
            opts.before.push(function(curr, next, opts) {
                opts.cssBefore.left = this.panbooW / 2;
                opts.cssBefore.width = 0;
                opts.animIn.left = 0;
                opts.animIn.width = this.panbooW;
            });
        } else {
            opts.before.push(function(curr, next, opts) {
                opts.animOut.width = 0;
                opts.animOut.left = this.panbooW / 2;
                opts.cssAfter.width = this.panbooW;
                opts.cssAfter.left = 0;
            });
        }
        result = { 
            "jimmi": {},
            "aaja": {}
        };
        return result;
    },
    growY: function($cont, isIn, opts) {
        var result = {};
        if (isIn) {
            opts.before.push(function(curr, next, opts) {
                opts.cssBefore.top = this.panbooH / 2;
                opts.cssBefore.height = 0;
                opts.cssBefore.left = 0;
                opts.animIn.top = 0;
                opts.animIn.height = this.panbooH;
            });
        } else {
            opts.before.push(function(curr, next, opts) {
                opts.animOut.top = this.panbooH / 2;
                opts.animOut.height = 0;
                opts.cssAfter.top = 0;
                opts.cssAfter.height = this.panbooH;
                console.log('panbooH:' + this.panbooH);
            });
        }
        result = {
            "jimmi": {},
            "aaja": {}
        };
        return result;
    }
};

$.fn.panboo.commonSet = function(opts) {
    opts.cssBefore.display = 'block';
    opts.cssAfter.display = 'none';
};

$.fn.panboo.defaults = {
    animIn:     {},
    animOut:    {},
    after:      null,
    before:     null,
    cssBefore:  {},
    cssAfter:   {},
    height:     'auto',
    speedIn:    1000,
    speedOut:   1000,
    timeout:    1000
};
})(jQuery);