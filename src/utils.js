/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012
        Michael Gerhäuser

    Licensed under the LGPL v3
*/


/**
 * This namespaces contains a few misc helper functions and constants.
 * @namespace
 */
Assessor.Utils = {
    /**
     * Default value for acceptance ranges.
     * @type Number
     */
    eps: 1e-5,

    /**
     * Store all log messages.
     */
    logs: [],

    /**
     * Initialize a new instance of a class and use <tt>params</tt> as parameters.
     * @see http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
     * @param {Function} Constructor
     * @param {Array} params
     * @return {Object}
     */
    funstructor: function (Constructor, params) {
        // borrowed from http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply

        return function () {
            var Temp = function () {}, inst, ret;

            // Give the Temp constructor the Constructor's prototype
            Temp.prototype = Constructor.prototype;

            // Create a new instance
            inst = new Temp;

            // Call the original Constructor with the temp
            // instance as its context (i.e. its 'this' value)
            ret = Constructor.apply(inst, params);

            // If an object has been returned then return it otherwise
            // return the original instance.
            // (consistent with behaviour of the new operator)
            return Object(ret) === ret ? ret : inst;
        };
    },

    /**
     * Wrapper for {@link Assessor.Utils#funstructor} with exception "handling" (in this case, handling means ignoring).
     * @param {Function} classname
     * @param {Array} parameters
     * @return {Object}
     */
    expand: function (classname, parameters) {
        var co;

        try {
            co = new (this.funstructor(classname, parameters))();
        } catch (e) {
            // meh, ignore it
        }

        return co;
    },

    /**
     * Restore an array of assessment verifiers and values from their JSON representations.
     * @param {Array} a
     * @return {Array}
     */
    expandJSON: function (a) {
        var i, c, co, newc = [];

        for (i = 0; i < a.length; i++) {
            if (!a[i].expanded) {
                Assessor.Utils.log('not expaned');
                if (typeof a[i] === 'string') {
                    Assessor.Utils.log('parsing', a[i]);
                    c = JSON.parse(a[i]);
                } else {
                    Assessor.Utils.log('got an object', a[i]);
                    c = a[i];
                }

                if (c.namespace !== 'null') {
                    co = this.expand(Assessor[c.namespace][c['class']], c.parameters);
                } else {
                    co = this.expand(Assessor[c['class']], c.parameters);
                }
                newc.push(co);
            } else {
                Assessor.Utils.log('already expanded, push it to results');
                newc.push(a[i]);
            }
        }

        return newc;
    },

    /**
     * Creates an {@link Assessor.Value.Number} if the given value is not a verifier object.
     * @param {Number,Assessor.Value.Number} v
     * @return {Assessor.Value.Number}
     */
    expandNumber: function(v) {
        var o = v;

        if (typeof v !== 'undefined' && !v.expanded) {
            if (typeof v === 'number') {
                o = this.expand(Assessor.Value.Number, [v]);
            } else {
                o = this.expandJSON([v])[0];
            }
        }

        return o;
    },

    /**
     * Store all the parameters in one entry of the {@link Assessor.Utils#logs} array.
     */
    log: function () {
        this.logs.push(arguments);
    },

    /**
     * Dump the whole log into the console (if available).
     */
    dumpLog: function () {
        var i;

        if (!console || !console.log) {
            return;
        }

        for (i = 0; i < this.logs.length; i++) {
            console.log.apply(console, this.logs[i]);
        }
    }
};

