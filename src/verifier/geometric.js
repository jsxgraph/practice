/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012 - 2013
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/*jslint nomen: true, plusplus: true*/
/*global define: true*/

define(['verifier/base', 'jsxgraph', 'utils/obj', 'utils/log'], function (Verifier, JXG, obj, Log) {

    "use strict";

    var Collinear;

    /**
     * Checks if three given points are collinear.
     * @param {String} A
     * @param {String} B
     * @param {String} C
     * @augments Verifier.Verifier
     * @constructor
     */
    Collinear = function Collinear(A, B, C) {
        /**
         * Stores the collinear points.
         * @type {Array}
         */
        this.points = [A, B, C];
    };

    obj.inherit(Verifier.Verifier, Collinear, /** @lends Collinear.prototype */ {
        choose: function (elements, fixtures) {
            var i, j, k, fix, new_fixtures = [];

            // rearrange the points, put the fixed ones at the end
            for (i = this.points.length - 1; i >= 0; i--) {
                if (fixtures[this.points[i]]) {
                    this.points.push.apply(this.points, this.points.splice(i, 1));
                }
            }
            Log.log('number of points', elements.points.length);
            // find all valid combinations depending on previous fixtures

            // all points fixed -> nothing to do
            if (fixtures[this.points[0]]) {
                Log.log('point1 fixed');
                return [];
            }

            Log.log('point 1 not fixed yet');
            for (i = 0; i < elements.points.length; i++) {
                if (fixtures.get(this.points[1])) {
                    Log.log('point2 fixed');
                    fix = fixtures.fork();
                    fix.set(this.points[0], elements.points[i]);

                    if (this.verify(elements, fix)) {
                        new_fixtures.push(fix);
                    }
                } else {
                    Log.log('point 2 not fixed yet');
                    for (j = 0; j < elements.points.length; j++) {
                        if (fixtures.get(this.points[2])) {
                            Log.log('point3 fixed');
                            fix = fixtures.fork();
                            fix.set(this.points[0], elements.points[i]);
                            fix.set(this.points[1], elements.points[j]);

                            if (this.verify(elements, fix)) {
                                new_fixtures.push(fix);
                            }
                        } else {
                            Log.log('point 3 not fixed');
                            for (k = 0; k < elements.points.length; k++) {
                                fix = fixtures.fork();
                                fix.set(this.points[0], elements.points[i]);
                                fix.set(this.points[1], elements.points[j]);
                                fix.set(this.points[2], elements.points[k]);

                                if (this.verify(elements, fix)) {
                                    new_fixtures.push(fix);
                                }
                            }
                        }
                    }
                }
            }

            return new_fixtures;
        },

        verify: function (elements, fixtures) {
            var A, B, C, res, proj, line;

            Log.log('collinear verifiy called');
            if (this.points.length < 3) {
                return false;
            }

            A = fixtures.get(this.points[0]);
            B = fixtures.get(this.points[1]);
            C = fixtures.get(this.points[2]);

            res = A && B && C;

            if (res && (C.id === A.id || C.id === B.id || A.id === B.id)) {
                res = false;
            }

            if (res) {
                Log.log('lets test', A.name, B.name, C.name, ' for collinearity...');
                line = JXG.Math.crossProduct(A.coords.usrCoords, B.coords.usrCoords);
                proj = JXG.Math.Geometry.projectPointToLine(C, {stdform: line});

                this.score = JXG.Math.Geometry.distance(proj.usrCoords.slice(1), C.coords.usrCoords.slice(1)) / A.Dist(B);

                res =  JXG.Math.Geometry.distance(proj.usrCoords.slice(1), C.coords.usrCoords.slice(1)) / A.Dist(B) < 0.07;

                if (res) {
                    Log.log('collinear: ', A.name, B.name, C.name);
                }
            }

            return res;
        }
    });

    Verifier.Collinear = Collinear;

    return Verifier;
});
