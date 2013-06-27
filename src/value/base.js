/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012 - 2013
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/*jslint nomen: true, plusplus: true*/
/*global define: true*/

define(['utils/obj'], function (obj) {

    "use strict";

    var Value, NumberValue;

    /**
     * Base class for value classes.
     * @constructor
     */
    Value = function Value() {};

    obj.extend(Value.prototype, /** @lends Value.prototype */ {
        /**
         * Verifies this verifier object under the given instance.
         * @param {ElementList} elements
         * @param {Instance} instance
         * @return {Boolean}
         */
        evaluate: function (elements, instance) {
            return NaN;
        },

        /**
         * @todo
         */
        choose: function () {
            return [];
        }
    });

    /**
     * Wrapper class for plain numeric values.
     * @param {NumberValue} value
     * @augments Value
     * @constructor
     */
    NumberValue = function NumberValue(value) {
        /**
         * Store the value.
         * @type {Number}
         */
        this.value = value;
    };
    NumberValue.prototype = new Value();

    obj.inherit(Value, NumberValue, /** @lends NumberValue.prototype */ {
        evaluate: function (elements, fixtures) {
            return this.value;
        }
    });


    Value.expandNumber = function (v) {
        if (typeof v === 'number') {
            return new NumberValue(v);
        }

        return v;
    };

    return {
        Value: Value,
        NumberValue: NumberValue
    };
});
