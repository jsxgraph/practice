/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012 - 2013
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/*jslint nomen: true, plusplus: true*/
/*global define: true*/

define(['value/base', 'utils/obj', 'utils/log'], function (Value, obj, Log) {

    "use strict";

    var Sum, Div;

    /**
     * The sum of a bunch of values.
     * @param {Array} v
     * @constructor
     */
    Sum = function Sum(v) {
        /**
         * The list of values.
         * @type {Array}
         */
        this.values = v;
    };
    obj.inherit(Value.Value, Sum, /** @lends Sum.prototype */ {
        evaluate: function (elements, fixtures) {
            var i,
                sum = 0;

            for (i = 0; i < this.values.length; i++) {
                sum += this.values[i].evaluate(elements, fixtures);
            }

            return sum;
        }
    });

    /**
     * Quotient of v1 and v2.
     * @param {Value.Value} v1
     * @param {Value.Value} v2
     * @constructor
     */
    Div = function Div(v1, v2) {
        /**
         * Dividend.
         * @type Assessor.Value.Value
         */
        this.v1 = Value.Value.expandNumber(v1);

        /**
         * Divisor.
         * @type Assessor.Value.Value
         */
        this.v2 = Value.Value.expandNumber(v2);
    };

    obj.inherit(Value.Value, Div.prototype, /** @lends Div.prototype */ {
        evaluate: function (elements, fixtures) {
            this.score = [this.evaluate(elements, fixtures)];
            return this.v1.evaluate(elements, fixtures) / this.v2.evaluate(elements, fixtures);
        }
    });

    return {
        Sum: Sum,
        Div: Div
    };
});
