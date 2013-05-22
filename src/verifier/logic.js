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

    /** * Verifies the one of the given verifier verifies.
     * @param {Array} v
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.Or = function (v) {
        this['class'] = 'Or';

        /**
         * The verifier that should not be verified.
         * @type {Assessor.Verifier.Verifier}
         */
        this.verifiers = v;
    };
    Assessor.Verifier.Or.prototype = new Assessor.Verifier.Verifier();

    Assessor.extend(Assessor.Verifier.Or.prototype, /** @lends Assessor.Verifier.Or.prototype */ {
        choose: function (elements, fixtures) {
            var i,
                fix = [],
                result = [];

            for (i = 0; i < this.verifiers.length; i++) {
                fix = fix.concat(this.verifiers[i].choose(elements, fixtures));
            }

            for (i = 0; i < fix.length; i++) {
                if (this.verify(elements, fix[i])) {
                    result.push(fix[i]);
                }
            }

            return result;
        },

        verify: function (elements, fixtures) {
            var i,
                result = false;

            this.score = [];
            for (i = 0; i < this.verifiers.length; i++) {
                result = result || this.verifiers[i].verify(elements, fixtures);
                this.score.push(this.verifiers[i].score);
            }

            return result;
        },

        toJSON: function () {
            var i;

            this.parameters = [];
            for (i = 0; i < this.verifiers.length; i++) {
                this.parameters.push(this.verifiers[i].toJSON());
            }
            this.parameters = '[[' + this.parameters.join(', ') + ']]';
        }
    });


    /** * Verifies that all of the given verifier verify.
     * @param {Array} v
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.And = function (v) {
        this['class'] = 'And';

        /**
         * The verifier that should not be verified.
         * @type {Assessor.Verifier.Verifier}
         */
        this.verifiers = v;
    };
    Assessor.Verifier.And.prototype = new Assessor.Verifier.Or();

    Assessor.extend(Assessor.Verifier.And.prototype, /** @lends Assessor.Verifier.And.prototype */ {
        verify: function (elements, fixtures) {
            var i,
                result = true;

            this.score = [];
            for (i = 0; i < this.verifiers.length; i++) {
                result = result && this.verifiers[i].verify(elements, fixtures);
                this.score.push(this.verifiers[i].score);
            }

            return result;
        }
    });


    /**
     * Is always true.
     * @param {Assessor.Verifier.Verifier} v
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.True = function (v) {
        this['class'] = 'True';

        /**
         * The verifier that should not be verified.
         * @type {Assessor.Verifier.Verifier}
         */
        this.verifier = v;
    };
    Assessor.Verifier.True.prototype = new Assessor.Verifier.Verifier();

    Assessor.extend(Assessor.Verifier.True.prototype, /** @lends Assessor.Verifier.True.prototype */ {
        choose: function (elements, fixtures) {
            this.score = this.verifier.score;
            return this.verifier.choose(elements, fixtures);
        },

        verify: function (elements, fixtures) {
            this.verifier.verify(elements, fixtures);
            this.score = this.verifier.score;

            return true;
        },

        toJSON: function () {
            this.parameters = '[' + this.verifier.toJSON() + ']';
        }
    });

    Assessor.Verifier.Optional = Assessor.Verifier.True;

    /**
     * Verifies only of the given verifier does NOT verify.
     * @param {Assessor.Verifier.Verifier} v
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.Not = function (v) {
        this['class'] = 'Not';

        /**
         * The verifier that should not be verified.
         * @type {Assessor.Verifier.Verifier}
         */
        this.verifier = v;
    };
    Assessor.Verifier.Not.prototype = new Assessor.Verifier.Verifier();

    Assessor.extend(Assessor.Verifier.Not.prototype, /** @lends Assessor.Verifier.Not.prototype */ {
        choose: function (elements, fixtures) {
            return this.verifier.choose(elements, fixtures);
        },

        verify: function (elements, fixtures) {
            return !this.verifier.verify(elements, fixtures);
        },

        toJSON: function () {
            this.parameters = '[' + this.verifier.toJSON() + ']';
        }
    });
}(this));
