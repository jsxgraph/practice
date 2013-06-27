/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012 - 2013
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/*jslint nomen: true, plusplus: true*/
/*global define: true*/

define(['verifier/base', 'utils/obj', 'utils/log'], function (Verifier, obj, Log) {

    "use strict";

    var Or, And, True, Not;

    /** * Verifies the one of the given verifier verifies.
     * @param {Array} v
     * @augments Verifier.Verifier
     * @constructor
     */
    Or = function Or(v) {
        /**
         * The verifier that should not be verified.
         * @type {Verifier.Verifier}
         */
        this.verifiers = v;
    };

    obj.inherit(Verifier.Verifier, Or, /** @lends Or.prototype */ {
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
        }
    });


    /** * Verifies that all of the given verifier verify.
     * @param {Array} v
     * @augments Verifier.Verifier
     * @constructor
     */
    And = function And(v) {
        /**
         * The verifier that should not be verified.
         * @type {Verifier.Verifier}
         */
        this.verifiers = v;
    };

    obj.inherit(Verifier.Verifier, And, /** @lends And.prototype */ {
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


    /**Verifier
     * Is always true.
     * @param {Verifier.Verifier} v
     * @augments Verifier.Verifier
     * @constructor
     */
    True = function True(v) {
        /**
         * The verifier that should not be verified.
         * @type {Verifier.Verifier}
         */
        this.verifier = v;
    };

    obj.inherit(Verifier.Verifier, True, /** @lends True.prototype */ {
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

    /**
     * Verifies only of the given verifier does NOT verify.
     * @param {Verifier.Verifier} v
     * @augments Verifier.Verifier
     * @constructor
     */
    Not = function Not(v) {
        /**
         * The verifier that should not be verified.
         * @type {Verifier.Verifier}
         */
        this.verifier = v;
    };

    obj.inherit(Verifier.Verifier, Not, /** @lends Not.prototype */ {
        choose: function (elements, fixtures) {
            return this.verifier.choose(elements, fixtures);
        },

        verify: function (elements, fixtures) {
            return !this.verifier.verify(elements, fixtures);
        }
    });

    obj.extend(Verifier, {
        And: And,
        True: True,
        Optional: True,
        Or: Or,
        Not: Not
    });

    return Verifier;
});
