/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/*jslint nomen:true, plusplus:true*/
/*global JXG:true, Assessor:true*/

(function (global) {

    "use strict";

    /**
     * The value <tt>value</tt> has to be greater than or equal to <tt>min</tt> and lesser than
     * or equal to <tt>max</tt>.
     * @param {Number|Assessor.Value.Value} value
     * @param {Number|Assessor.Value.Value} min
     * @param {Number|Assessor.Value.Value} max
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.Between = function (value, min, max) {
        this['class'] = 'Between';

        /**
         * The value that is to be compared to {@link Assessor.Verifier.Between#min} and {@link Assessor.Verifier.Between#max}.
         * @type {Assessor.Value}
         */
        this.value = Assessor.Utils.expandNumber(value);

        /**
         * The lower bound for {@link Assessor.Verifier.Between#value}.
         * @type {Assessor.Value}
         */
        this.min = Assessor.Utils.expandNumber(min);

        /**
         * The upper bound for {@link Assessor.Verifier.Between#value}.
         * @type {Assessor.Value}
         */
        this.max = Assessor.Utils.expandNumber(max);
    };
    Assessor.Verifier.Between.prototype = new Assessor.Verifier.Verifier();

    Assessor.extend(Assessor.Verifier.Between.prototype, /** @lends Assessor.Verifier.Between.prototype */ {
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

            return min <= v && v <= max;
        },

        toJSON: function () {
            this.parameters = '[' + this.value.toJSON() + ', ' + this.min.toJSON() + ', ' + this.max.toJSON() + ']';
            return Assessor.Base.prototype.toJSON.call(this);
        }
    });

    /**
     * Base class for binary operators like {@link Assessor.Verifier.Equals} and
     * {@link Assessor.Verifier.Less}.
     * @param {Number|Assessor.Value.Value} lhs
     * @param {Number|Assessor.Value.Value} rhs
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.Binary = function (lhs, rhs) {
        this['class'] = 'Binary';

        /**
         * Left hand side of the equation.
         * @type {Assessor.Value}
         */
        this.lhs = Assessor.Utils.expandNumber(lhs);

        /**
         * Right hand side of the equation.
         * @type {Assessor.Value}
         */
        this.rhs = Assessor.Utils.expandNumber(rhs);
    };
    Assessor.Verifier.Binary.prototype = new Assessor.Verifier.Verifier();

    Assessor.extend(Assessor.Verifier.Binary.prototype, /** @lends Assessor.Verifier.Binary.prototype */ {
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
        },

        toJSON: function () {
            this.parameters = '[' + this.lhs.toJSON() + ', ' + this.rhs.toJSON() + ']';
            return Assessor.Base.prototype.toJSON.call(this);
        }
    });

    /**
     * Compares two values and is valid only if those are equal or within a certain acceptance
     * range defined by <tt>eps</tt>.
     * @param {Number|Assessor.Value.Value} lhs
     * @param {Number|Assessor.Value.Value} rhs
     * @param {Number} [eps=1e-5]
     * @augments Assessor.Verifier.Binary
     * @constructor
     */
    Assessor.Verifier.Equals = function (lhs, rhs, eps) {
        Assessor.Verifier.Binary.call(this, lhs, rhs);
        this['class'] = 'Equals';

        /**
         * Allow a small difference when comparing {@link Assessor.Verifier.Equals#lhs}
         * and {@link Assessor.Verifier.Equals#rhs}.
         * @type {Number}
         */
        this.eps = eps || 1e-5;
    };
    Assessor.Verifier.Equals.prototype = new Assessor.Verifier.Binary();

    Assessor.extend(Assessor.Verifier.Equals.prototype, /** @lends Assessor.Verifier.Equals.prototype */ {
        verify: function (elements, fixtures) {
            var lhs = this.lhs.evaluate(elements, fixtures),
                rhs = this.rhs.evaluate(elements, fixtures);

            return Math.abs(lhs - rhs) <= this.eps;
        },

        toJSON: function () {
            this.parameters = '[' + this.lhs.toJSON() + ', ' + this.rhs.toJSON() + ', ' + this.eps + ']';
            return Assessor.Base.prototype.toJSON.call(this);
        }
    });

    /**
     * Compares two {@link Assessor.Value.Value} objects and verifies only if the <tt>lhs</tt> value is less
     * than the <tt>rhs</tt> value.
     * @param {Number|Assessor.Value.Value} lhs
     * @param {Number|Assessor.Value.Value} rhs
     * @augments Assessor.Verifier.Binary
     * @constructor
     */
    Assessor.Verifier.Less = function (lhs, rhs) {
        Assessor.Verifier.Binary.call(this, lhs, rhs);
        this['class'] = 'Less';
    };
    Assessor.Verifier.Less.prototype = new Assessor.Verifier.Binary();

    Assessor.extend(Assessor.Verifier.Less.prototype, /** @lends Assessor.Verifier.Less.prototype */ {
        verify: function (elements, fixtures) {
            var lhs = this.lhs.evaluate(elements, fixtures),
                rhs = this.rhs.evaluate(elements, fixtures);

            return lhs < rhs;
        }
    });

    /**
     * Compares two {@link Assessor.Value.Value} objects and verifies only if the <tt>lhs</tt> value is less
     * than or equal to the <tt>rhs</tt> value.
     * @param {Number|Assessor.Value.Value} lhs
     * @param {Number|Assessor.Value.Value} rhs
     * @param {Number} [eps=1e-5]
     * @augments Assessor.Verifier.Binary
     * @constructor
     */
    Assessor.Verifier.LEQ = function (lhs, rhs, eps) {
        Assessor.Verifier.Binary.call(this, lhs, rhs);
        this['class'] = 'LEQ';

        /**
         * Allow a small difference when comparing {@link Assessor.Verifier.Equals#lhs}
         * and {@link Assessor.Verifier.Equals#rhs}.
         * @type {Number}
         */
        this.eps = eps || 1e-5;
    };
    Assessor.Verifier.LEQ.prototype = new Assessor.Verifier.Binary();

    Assessor.extend(Assessor.Verifier.LEQ.prototype, /** @lends Assessor.Verifier.LEQ.prototype */ {
        verify: function (elements, fixtures) {
            var lhs = this.lhs.evaluate(elements, fixtures),
                rhs = this.rhs.evaluate(elements, fixtures);

            return lhs - rhs <= this.eps;
        },

        toJSON: function () {
            return Assessor.Verifier.Equals.prototype.toJSON.call(this);
        }
    });

    /**
     * Compares two {@link Assessor.Value.Value} objects and verifies only if the <tt>lhs</tt> value is greater
     * than the <tt>rhs</tt> value.
     * @param {Number|Assessor.Value.Value} lhs
     * @param {Number|Assessor.Value.Value} rhs
     * @augments Assessor.Verifier.Binary
     * @constructor
     */
    Assessor.Verifier.Greater = function (lhs, rhs) {
        Assessor.Verifier.Binary.call(this, lhs, rhs);
        this['class'] = 'Greater';
    };
    Assessor.Verifier.Greater.prototype = new Assessor.Verifier.Binary();

    Assessor.extend(Assessor.Verifier.Greater.prototype, /** @lends Assessor.Verifier.Greater.prototype */ {
        verify: function (elements, fixtures) {
            var lhs = this.lhs.evaluate(elements, fixtures),
                rhs = this.rhs.evaluate(elements, fixtures);

            return lhs > rhs;
        }
    });

    /**
     * Compares two {@link Assessor.Value.Value} objects and verifies only if the <tt>lhs</tt> value is greater
     * than or equal to the <tt>rhs</tt> value.
     * @param {Number|Assessor.Value.Value} lhs
     * @param {Number|Assessor.Value.Value} rhs
     * @param {Number} [eps=1e-5]
     * @augments Assessor.Verifier.Binary
     * @constructor
     */
    Assessor.Verifier.GEQ = function (lhs, rhs, eps) {
        Assessor.Verifier.Binary.call(this, lhs, rhs);
        this['class'] = 'GEQ';

        /**
         * Allow a small difference when comparing {@link Assessor.Verifier.Equals#lhs}
         * and {@link Assessor.Verifier.Equals#rhs}.
         * @type {Number}
         */
        this.eps = eps || 1e-5;
    };
    Assessor.Verifier.GEQ.prototype = new Assessor.Verifier.Binary();

    Assessor.extend(Assessor.Verifier.GEQ.prototype, /** @lends Assessor.Verifier.GEQ.prototype */ {
        verify: function (elements, fixtures) {
            var lhs = this.lhs.evaluate(elements, fixtures),
                rhs = this.rhs.evaluate(elements, fixtures);

            return lhs - rhs >= -this.eps;
        },

        toJSON: function () {
            return Assessor.Verifier.Equals.prototype.toJSON.call(this);
        }
    });

    Assessor.Verifier.Score = function (val) {
        this['class'] = 'Score';

        this.val = val;
    };
    Assessor.Verifier.Score.prototype = new Assessor.Verifier.Verifier();

    Assessor.extend(Assessor.Verifier.Score.prototype, /** Assessor.Verifier.Score.prototype */ {
        choose: function (elements, fixtures) {
            return [];
        },

        verify: function (elements, fixtures) {
            this.score = [this.val.evaluate(elements, fixtures)];
            return true;
        },

        toJSON: function () {
            this.parameters = '[' + this.val.toJSON() + ']';
        }
    });

}(this));
