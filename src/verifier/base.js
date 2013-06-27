/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012 - 2013
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/*jslint nomen: true, plusplus: true*/
/*global define: true, require: true, JXG: true*/


define(['utils/obj'], function (obj) {

    "use strict";

    /**
     * Verifier base class
     * @constructor
     */
    var Verifier = function () {
        this.score = 0;

        return this;
    };

    obj.extend(Verifier.prototype, /** @lends Verifier.prototype */ {
        /**
         * Compiles a list of all instances that can be applied to this verifier while
         * this verifier is still valid under the given instance.
         * @param {ElementList} elements
         * @param {Instance} instance
         * @return {Array} An array of {@link Instance} objects.
         */
        choose: function (elements, instance) {
            return [];
        },

        /**
         * Verifies this verifier object under the given instance.
         * @param {ElementList} elements
         * @param {Instance} instance
         * @return {Boolean}
         */
        verify: function (elements, instance) {
            return false;
        }
    });

    return {
        Verifier: Verifier
    };
});
