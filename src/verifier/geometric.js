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

    /**
     * Checks if three given points are collinear.
     * @param {String} A
     * @param {String} B
     * @param {String} C
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.Collinear = function (A, B, C) {
        this['class'] = "Collinear";

        /**
         * Stores the collinear points.
         * @type {Array}
         */
        this.points = [A, B, C];
    };
    Assessor.Verifier.Collinear.prototype = new Assessor.Verifier.Verifier();

    Assessor.extend(Assessor.Verifier.Collinear.prototype, /** @lends Assessor.Verifier.Collinear.prototype */ {
        choose: function (elements, fixtures) {
            var i, j, k, fix, new_fixtures = [];

            // rearrange the points, put the fixed ones at the end
            for (i = this.points.length - 1; i >= 0; i--) {
                if (fixtures[this.points[i]]) {
                    this.points.push.apply(this.points, this.points.splice(i, 1));
                }
            }
            Assessor.Utils.log('number of points', elements.points.length);
            // find all valid combinations depending on previous fixtures

            // all points fixed -> nothing to do
            if (fixtures[this.points[0]]) {
                Assessor.Utils.log('point1 fixed');
                return [];
            }

            Assessor.Utils.log('point 1 not fixed yet');
            for (i = 0; i < elements.points.length; i++) {
                if (fixtures.get(this.points[1])) {
                    Assessor.Utils.log('point2 fixed');
                    fix = new Assessor.FixtureList(fixtures);
                    fix.set(this.points[0], elements.points[i]);

                    if (this.verify(elements, fix)) {
                        new_fixtures.push(fix);
                    }
                } else {
                    Assessor.Utils.log('point 2 not fixed yet');
                    for (j = 0; j < elements.points.length; j++) {
                        if (fixtures.get(this.points[2])) {
                            Assessor.Utils.log('point3 fixed');
                            fix = new Assessor.FixtureList(fixtures);
                            fix.set(this.points[0], elements.points[i]);
                            fix.set(this.points[1], elements.points[j]);

                            if (this.verify(elements, fix)) {
                                new_fixtures.push(fix);
                            }
                        } else {
                            Assessor.Utils.log('point 3 not fixed');
                            for (k = 0; k < elements.points.length; k++) {
                                fix = new Assessor.FixtureList(fixtures);
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

            Assessor.Utils.log('collinear verifiy called');
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
                Assessor.Utils.log('lets test', A.name, B.name, C.name, ' for collinearity...');
                line = Assessor.JXG.Math.crossProduct(A.coords.usrCoords, B.coords.usrCoords);
                proj = Assessor.JXG.Math.Geometry.projectPointToLine(C, {stdform: line});

                this.score = Assessor.JXG.Math.Geometry.distance(proj.usrCoords.slice(1), C.coords.usrCoords.slice(1)) / A.Dist(B);

                res =  Assessor.JXG.Math.Geometry.distance(proj.usrCoords.slice(1), C.coords.usrCoords.slice(1)) / A.Dist(B) < 0.07;

                if (res) {
                    Assessor.Utils.log('collinear: ', A.name, B.name, C.name);
                }
            }

            return res;
        },

        toJSON: function () {
            this.parameters = '["' + this.points.join('", "') + '"]';
            return Assessor.Base.prototype.toJSON.call(this);
        }
    });
}(this));
