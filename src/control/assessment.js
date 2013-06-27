/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012 - 2013
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/*jslint nomen: true, plusplus: true*/
/*global define: true, require: true, JXG: true*/


define(['control/instance', 'utils/obj', 'utils/log'], function (Instance, obj, Log) {

    "use strict";

    /**
     * Assessment class, holds all verifiers for a given task.
     * @constructor
     */
    var Assessment = function Assessment() {
        // todo: check if more than one parameter is given or a single verifier.
        // in the first case: wrap an AND verifier around it
        // in the latter case: use the single verifier as the root node

        /**
         * Holds the constraints for this assessment.
         * @type {Verifier} The root node of the verifier tree
         */
        this.constraints = arguments;

        /**
         * Keeps track of the fixed elements
         * @type {Instance}
         */
        this.fixtures = new Instance();
    };

    obj.extend(Assessment.prototype, /** @lends Assessment.prototype */ {
        /**
         * Entry point for the verification algorithm.
         * @param {ElementList} elements
         * @param {Instance} [inst]
         * @return {Boolean}
         */
        verify: function (elements, inst) {
            this.fixtures.clear();
            if (inst) {
                this.fixtures['import'](inst);
            }

            return this.next(elements, 0);
        },

        /**
         * Collect all valid fixtures, not just the first one.
         * @param {ElementList} elements
         * @param {Array} success
         * @param {Instance} [inst]
         */
        collect: function (elements, success, inst) {
            this.fixtures.clear();
            if (inst) {
                this.fixtures['import'](inst);
            }

            this.next(elements, 0, success);

            return success;
        },

        /**
         * Backtracking algorithm to verify an assessment. This method goes through all verifiers in
         * {@link Assessment#constraints} and tries to map all <tt>elements</tt> to the correct
         * elements given by the author in the constraints such that all of the constraints are fulfilled.
         * @param {ElementList} elements
         * @param {Number} i
         * @param {Array} [success]
         * @return {Boolean}
         */
        next: function (elements, i, success) {
            var poss, constr, j, t, score = [], fixes;

            if (i >= this.constraints.length) {
                Log.log('got a leaf!');

                if (success) {
                    for (j = 0; j < this.constraints.length; j++) {
                        score = score.concat(this.constraints[j].score);
                    }

                    fixes = this.fixtures.simplify();
                    fixes._score_ = score;
                    t = JXG.toJSON(fixes);

                    if (JXG.indexOf(success, t) === -1) {
                        success.push(t);
                    }

                    return false;
                }

                return true;
            }

            constr = this.constraints[i];

            Log.log('now collecting', constr, 'fixtures are', this.fixtures.simplify());
            poss = constr.choose(elements, this.fixtures);

            for (t = 0; t < poss.length; t++) {
                Log.log('poss ', t, poss[t].simplify());
            }

            if (poss.length === 0) {
                Log.log('i got 0 possibilities');

                if (constr.verify(elements, this.fixtures)) {
                    Log.log('poss 0, verified, go next');
                    return this.next(elements, i + 1, success);
                }

                Log.log('poss 0, not verified');
                return false;
            }

            Log.log('Constraint ', constr, ' generated ' + poss.length + ' possibilities!');
            for (j = 0; j < poss.length; j++) {
                Log.log('fixating', this.fixtures.simplify());
                this.fixtures['import'](poss[j]);

                if (this.next(elements, i + 1, success)) {
                    return true;
                }

                this.fixtures.remove(poss[j]);
            }

            return false;
        }
    });

    return Assessment;
});
