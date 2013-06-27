/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012 - 2013
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/*jslint nomen: true, plusplus: true*/
/*global define: true*/

define(['verifier/base', 'value/base', 'config', 'utils/obj', 'utils/log'], function (Verifier, Value, CONF, obj, Log) {

    "use strict";

    var Between, Binary, Equals, Less, LEQ, Greater, GEQ, Score;

    /**
     * The value <tt>value</tt> has to be greater than or equal to <tt>min</tt> and lesser than
     * or equal to <tt>max</tt>.
     * @param {Number|Value} value
     * @param {Number|Value} min
     * @param {Number|Value} max
     * @augments Verifier.Verifier
     * @constructor
     */
    Between = function Between(value, min, max) {
        /**
         * The value that is to be compared to {@link Between#min} and {@link Between#max}.
         * @type {Value}
         */
        this.value = Value.Value.expandNumber(value);

        /**
         * The lower bound for {@link Between#value}.
         * @type {Value}
         */
        this.min = Value.Value.expandNumber(min);

        /**
         * The upper bound for {@link Between#value}.
         * @type {Value}
         */
        this.max = Value.Value.expandNumber(max);
    };

    obj.inherit(Verifier.Verifier, Between, /** @lends Between.prototype */ {
        choose: function (elements, fixtures) {
            var miposs, maposs, i, j, k,
                vposs = this.value.choose(elements, fixtures),
                new_fixtures = [];

            for (i = 0; i < vposs.length; i++) {
                miposs = this.min.choose(elements, vposs[i]);
                if (miposs.length === 0) {
                    miposs = [vposs[i]];
                }

                for (j = 0; j < miposs.length; j++) {
                    maposs = this.max.choose(elements, miposs[j]);
                    if (maposs.length === 0) {
                        maposs = [miposs[j]];
                    }

                    for (k = 0; k < maposs.length; k++) {
                        if (this.verify(elements, maposs[k])) {
                            new_fixtures.push(maposs[k]);
                        }
                    }
                }
            }

            return new_fixtures;
        },

        verify: function (elements, fixtures) {
            var v = this.value.evaluate(elements, fixtures),
                min = this.min.evaluate(elements, fixtures),
                max = this.max.evaluate(elements, fixtures);

            Log.log('verify between', min, max, v, v instanceof Value.Value);

            return min <= v && v <= max;
        }
    });

    /**
     * Base class for binary operators like {@link Equals} and {@link Less}.
     * @param {Number|Value} lhs
     * @param {Number|Value} rhs
     * @augments Verifier.Verifier
     * @constructor
     */
    Binary = function Binary(lhs, rhs) {
        /**
         * Left hand side of the equation.
         * @type {Value}
         */
        this.lhs = Value.Value.expandNumber(lhs);

        /**
         * Right hand side of the equation.
         * @type {Value}
         */
        this.rhs = Value.Value.expandNumber(rhs);
    };

    obj.inherit(Verifier.Verifier, Binary, /** @lends Binary.prototype */ {
        choose: function (elements, fixtures) {
            var rposs, i, j,
                lposs = this.lhs.choose(elements, fixtures),
                new_fixtures = [];

            for (i = 0; i < lposs.length; i++) {
                rposs = this.rhs.choose(elements, lposs[i]);

                if (rposs.length === 0 && this.verify(elements, lposs[i])) {
                    new_fixtures.push(lposs[i]);
                } else {
                    for (j = 0; j < rposs.length; j++) {
                        if (this.verify(elements, rposs[j])) {
                            new_fixtures.push(rposs[j]);
                        }
                    }
                }
            }

            return new_fixtures;
        }
    });

    /**
     * Compares two values and is valid only if those are equal or within a certain acceptance
     * range defined by <tt>eps</tt>.
     * @param {Number|Value} lhs
     * @param {Number|Value} rhs
     * @param {Number} [eps=CONF#eps]
     * @augments Binary
     * @constructor
     */
    Equals = function Equals(lhs, rhs, eps) {
        Equals.base.constructor.call(this, lhs, rhs);

        /**
         * Allow a small difference when comparing {@link Equals#lhs} and {@link Equals#rhs}.
         * @type {Number}
         */
        this.eps = eps || CONF.eps;
    };

    obj.inherit(Binary, Equals, /** @lends Equals.prototype */ {
        verify: function (elements, fixtures) {
            var lhs = this.lhs.evaluate(elements, fixtures),
                rhs = this.rhs.evaluate(elements, fixtures);

            Log.log('verify equals', lhs, rhs);

            return Math.abs(lhs - rhs) <= this.eps;
        }
    });

    /**
     * Compares two {@link Value} objects and verifies only if the <tt>lhs</tt> value is less
     * than the <tt>rhs</tt> value.
     * @param {Number|Value} lhs
     * @param {Number|Value} rhs
     * @augments Binary
     * @constructor
     */
    Less = function Less(lhs, rhs) {
        Binary.call(this, lhs, rhs);
    };

    obj.inherit(Binary, Less, /** @lends Less.prototype */ {
        verify: function (elements, fixtures) {
            var lhs = this.lhs.evaluate(elements, fixtures),
                rhs = this.rhs.evaluate(elements, fixtures);

            return lhs < rhs;
        }
    });

    /**
     * Compares two {@link Value} objects and verifies only if the <tt>lhs</tt> value is less
     * than or equal to the <tt>rhs</tt> value.
     * @param {Number|Value} lhs
     * @param {Number|Value} rhs
     * @param {Number} [eps=CONF#eps]
     * @augments Binary
     * @constructor
     */
    LEQ = function LEQ(lhs, rhs, eps) {
        Binary.call(this, lhs, rhs);

        /**
         * Allow a small difference when comparing {@link Equals#lhs}
         * and {@link Equals#rhs}.
         * @type {Number}
         */
        this.eps = eps || CONF.eps;
    };

    obj.inherit(Binary, LEQ, /** @lends LEQ.prototype */ {
        verify: function (elements, fixtures) {
            var lhs = this.lhs.evaluate(elements, fixtures),
                rhs = this.rhs.evaluate(elements, fixtures);

            return lhs - rhs <= this.eps;
        }
    });

    /**
     * Compares two {@link Value} objects and verifies only if the <tt>lhs</tt> value is greater
     * than the <tt>rhs</tt> value.
     * @param {Number|Value} lhs
     * @param {Number|Value} rhs
     * @augments Binary
     * @constructor
     */
    Greater = function Greater(lhs, rhs) {
        Binary.call(this, lhs, rhs);
    };

    obj.inherit(Binary, Greater, /** @lends Greater.prototype */ {
        verify: function (elements, fixtures) {
            var lhs = this.lhs.evaluate(elements, fixtures),
                rhs = this.rhs.evaluate(elements, fixtures);

            return lhs > rhs;
        }
    });

    /**
     * Compares two {@link Value} objects and verifies only if the <tt>lhs</tt> value is greater
     * than or equal to the <tt>rhs</tt> value.
     * @param {Number|Value} lhs
     * @param {Number|Value} rhs
     * @param {Number} [eps=CONF#eps]
     * @augments Binary
     * @constructor
     */
    GEQ = function GEQ(lhs, rhs, eps) {
        /**
         * Allow a small difference when comparing {@link Equals#lhs} and {@link Equals#rhs}.
         * @type {Number}
         */
        Binary.call(this, lhs, rhs);

        this.eps = eps || CONF.eps;
    };

    obj.inherit(Binary, GEQ, /** @lends GEQ.prototype */ {
        verify: function (elements, fixtures) {
            var lhs = this.lhs.evaluate(elements, fixtures),
                rhs = this.rhs.evaluate(elements, fixtures);

            return lhs - rhs >= -this.eps;
        }
    });

    /**
     * Simply uses the given value to generate a score value.
     * @param {Number|Value} val
     * @augments Verifier
     * @constructor
     */
    Score = function Score(val) {
        /**
         * The value that will form the score of this Verifier
         * @type {Value}
         */
        this.val = Value.Value.expandNumber(val);
    };

    obj.inherit(Verifier.Verifier, Score, /** Score.prototype */ {
        choose: function (elements, fixtures) {
            return [];
        },

        verify: function (elements, fixtures) {
            this.score = [this.val.evaluate(elements, fixtures)];

            return true;
        }
    });

    obj.extend(Verifier, {
        Between: Between,
        Binary: Binary,
        Equals: Equals,
        Less: Less,
        LEQ: LEQ,
        Greater: Greater,
        GEQ: GEQ,
        Score: Score
    });

    return Verifier;
});
