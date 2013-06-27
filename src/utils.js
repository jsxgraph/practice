/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012
        Michael Gerhäuser

    Licensed under the LGPL v3
*/


/**
 * @deprecated
 * @ignore
 * @private
 */


/**
 * This namespaces contains a few misc helper functions and constants.
 * @namespace
 */
Assessor.Utils = {
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
    }
};
