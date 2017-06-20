(function (module, exports, isBrowser) {
    'use strict';

    var _ = isBrowser ?
        window._ :
        require('lodash');

    var HbsHelpers = module.exports = {
        repeat: function repeat(n, options) {
            var hasNumber = isNumber(n);
            var context = {};
            var self = this;

            if (!hasNumber) {
                options = n;
            }

            if (self && self.context) {
                _.merge(self, self.context);
            }

            if (options.hasOwnProperty('hash')) {
                _.merge(options, options.hash);
            }
            _.merge(options, options.hash);

            if (options.count) {
                n = options.count;
                hasNumber = true;
            }

            _.merge(options, self, context);
            if (hasNumber) {
                console.log('~~# will render preating block');
                return block(options);
            } else {
                return options.inverse(options);
            }

            function block(opts) {
                opts = opts || {};
                var str = '';

                var hash = opts.hash || {};
                hash.start = hash.start || 0;

                for (var i = hash.start; i < n + hash.start; i++) {
                    hash.index = i;

                    str += opts.fn(opts, {data: hash});
                }
                return str;
            }

            function isNumber(n) {
                return (!!(+n) && !Array.isArray(n)) && isFinite(n)
                    || n === '0'
                    || n === 0;
            }
        },
        lt: function (a, b) {
            return a < b;
        },
        lte: function (a, b) {
            return a <= b;
        },
        gte: function (a, b) {
            return a >= b;
        },
        gt: function (a, b) {
            return a > b;
        },
        eq: function (a, b) {
            return a == b;
        },
        inc: function (x, n) {
            if (n === undefined) n = 1;
            return x + n;
        },
        dec: function (x, n) {
            if (n === undefined) n = 1;
            return x - n;
        },
        extra: function (options) {
            return options.fn(_.merge({}, this, options.hash));
        }
    };

    // Browser
    if (isBrowser) {
        window.HbsHelpers = HbsHelpers;
    }

})( // hack to have it work both in nodejs and in browser
    typeof module === 'undefined' ? {} : module,
    typeof exports === 'undefined'? (window.HbsHelpers = {}) : exports,
    typeof module === 'undefined'
);
