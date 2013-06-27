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

    /**
     * Tracks the fixtures.
     * @param {Instance} [inst] Optional import the fixtures from this list.
     * @augments Assessor.Base
     * @constructor
     */
    var Instance = function Instance(inst) {
        /**
         * The property name is the element name as introduced by the assessment author and
         * the property value is a reference to an element created during the actual assessment.
         * @type {Object}
         */
        this.list = {};

        if (inst) {
            this['import'](inst);
        }

        return this;
    };

    /**
     * Expand a simplified Instance into a Instance.
     * @param {string} list
     * @param {object} elements
     * @static
     */
    Instance.expand = function (list, elements) {
        var i,
            r = {},
            t = JSON.parse(list);

        for (i in t) {
            if (t.hasOwnProperty(i)) {
                r[i] = elements[t[i]] || t[i];
            }
        }

        return r;
    };

    obj.extend(Instance.prototype, /** @lends Instance.prototype */ {
        /**
         * Retrieve the current fixture of a given element.
         * @param {String} name
         * @return {JXG.GeometryElement}
         */
        'get': function (name) {
            return this.list[name];
        },

        /**
         * Add a new fixture.
         * @param {Object} name
         * @param {JXG.GeometryElement} element
         */
        'set': function (name, element) {
            if (!this.list[name]) {
                this.list[name] = element;
            }

            return !this.list[name];
        },

        /**
         * Clear all the data.
         */
        clear: function () {
            this.list = {};
        },

        /**
         * Return a indepent copy of this instance.
         */
        fork: function () {
            return new Instance(this);
        },

        /**
         * Import the Instance data from another Instance.
         * @param {string|Instance} inst A Instance or a simplified list in a string.
         */
        'import': function (inst) {
            var i, l;

            if (inst.list) {
                l = inst.list;
            } else {
                l = inst;
            }

            for (i in l) {
                if (l.hasOwnProperty(i)) {
                    if (!this.list[i]) {
                        this.list[i] = l[i];
                    }
                }
            }
        },

        /**
         * Remove fixtures.
         * @param {Instance} inst
         */
        remove: function (inst) {
            var i;

            for (i in inst.list) {
                if (inst.list.hasOwnProperty(i)) {
                    delete this.list[i];
                }
            }
        },

        /**
         * Replaces the target references by the elements names.
         * @return {Object}
         */
        simplify: function () {
            var t = {}, i;

            for (i in this.list) {
                if (this.list.hasOwnProperty(i)) {
                    t[i] = (this.list[i] && this.list[i].id) || this.list[i];
                }
            }

            return t;
        }
    });

    return Instance;
});
