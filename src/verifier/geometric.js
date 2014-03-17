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

    /**
     * Verifies that both given elements do not represent the same.
     * @param {String} e1
     * @param {String} e2
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.NotIdentical = function (e1, e2) {
        this['class'] = 'NotIdentical';

        /**
         * Stores the two elements.
         * @type Array
         */
        this.el = [e1, e2];

        return this;
    };
    Assessor.Verifier.NotIdentical.prototype = new Assessor.Verifier.Verifier();

    Assessor.extend(Assessor.Verifier.NotIdentical.prototype, /** @lends Assessor.Verifier.NotIdentical.prototype */ {
        choose: function (elements, fixtures) {
            // the elements have to be chosen before
            return [];
        },

        verify: function (elements, fixtures) {
            var a, b, res;

            if (this.el.length < 2) {
                return false;
            }

            a = fixtures.get(this.el[0]);
            b = fixtures.get(this.el[1]);

            res = a && b && a.id !== b.id;

            return res;
        },

        toJSON: function () {
            this.parameters = '["' + this.el[0] + '", "' + this.el[1] + '"]';
            return Assessor.Base.prototype.toJSON.call(this);
        }
    });


    /**
     * Checks if the given point lies near a circle or an element of type curve.
     * @param {String} point
     * @param {String} c
     * @param {String} [eps]
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.OnCircleCurve = function (point, c, eps) {
        this['class'] = 'OnCircleCurve';

        this.eps = eps || 0.2;
        this.point = point;
        this.c = c;
    };
    Assessor.Verifier.OnCircleCurve.prototype = new Assessor.Verifier.Verifier();

    Assessor.extend(Assessor.Verifier.OnCircleCurve.prototype, /** @lends Assessor.Verifier.OnCircleCurve.prototype */ {
        choose: function (elements, fixtures) {
            var fix, i, j,
                circleCurves = elements.circles.concat(elements.curves);
                cancel = false,
                new_fixtures = [];

            for (i = 0; i < elements.points.length; i++) {
                for (j = 0; j < circleCurves.length; j++) {

                    fix = new Assessor.FixtureList(fixtures);
                    fix.set(this.point, elements.points[i]);

                    if (fixtures.get(this.c)) {
                        cancel = true;
                    } else {
                        fix.set(this.c, circleCurves[j]);
                    }

                    if (this.verify(elements, fix)) {
                        new_fixtures.push(fix);
                    }

                    if (cancel) {
                        break;
                    }
                }
            }

            return new_fixtures;
        },

        verify: function (elements, fixtures) {
            var c, p, v, res, eps;

            Assessor.Utils.log('point on line verifiy called');
            c = fixtures.get(this.c);
            p = fixtures.get(this.point);

            res = c && p;

            if (res) {
                // we could change options.precision.haspoint to extend the search radius
                eps = c.board.options.precision.hasPoint;
                c.board.options.precision.hasPoint = this.eps * 50;
                v = c.hasPoint(p.coords.scrCoords[1], p.coords.scrCoords[2]);
                Assessor.Utils.log('testing', p.id, 'on', c.id, '; result:', v);

                c.board.options.precision.hasPoint = eps;

                res =  v;

                this.score = v;

                if (res) {
                    Assessor.Utils.log('match: ', c.name, p.name);
                }
            }

            return res;
        },

        toJSON: function () {
            this.parameters = '["' + this.point + '", "' + this.c + '"]';
            return Assessor.Base.prototype.toJSON.call(this);
        }
    });

    /**
     * Checks if the given lines lie (almost) parallel.
     * @param {String} l1
     * @param {String} l2
     * @param {String} [eps]
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.Parallel = function (l1, l2, eps) {
        this['class'] = 'Parallel';

        /**
         * Store the identifiers.
         * @type Array
         */
        this.lines = [l1, l2];

        this.eps = eps || 0.07;

        return this;
    };
    Assessor.Verifier.Parallel.prototype = new Assessor.Verifier.Verifier();

    Assessor.extend(Assessor.Verifier.Parallel.prototype, /** @lends Assessor.Verifier.Parallel.prototype */ {
        choose: function (elements, fixtures) {
            var fix, i, j,
                new_fixtures = [];

            // rearrange the points, put the fixed ones at the end
            if (fixtures.get(this.lines[0])) {
                i = this.lines[0];
                this.lines[0] = this.lines[1];
                this.lines[1] = i;
            }

            if (fixtures.get(this.lines[0])) {
                // all fixed
                return [];
            }

            for (i = 0; i < elements.lines.length; i++) {
                if (fixtures.get(this.lines[1])) {
                    fix = new Assessor.FixtureList(fixtures);
                    fix.set(this.lines[0], elements.lines[i]);

                    if (this.verify(elements, fix)) {
                        new_fixtures.push(fix);
                    }
                } else {
                    for (j = i + 1; j < elements.lines.length; j++) {
                        fix = new Assessor.FixtureList(fixtures);
                        fix.set(this.lines[0], elements.lines[i]);
                        fix.set(this.lines[1], elements.lines[j]);

                        if (this.verify(elements, fix)) {
                            new_fixtures.push(fix);
                        }
                    }
                }
            }

            return new_fixtures;
        },

        verify: function (elements, fixtures) {
            var a, b, res, slope;

            Assessor.Utils.log('parallel verifiy called');
            if (this.lines.length < 2) {
                return false;
            }

            a = fixtures.get(this.lines[0]);
            b = fixtures.get(this.lines[1]);

            res = a && b;

            if (!res || (a.elementClass !== JXG.OBJECT_CLASS_LINE) || (b.elementClass !== JXG.OBJECT_CLASS_LINE) || (a.id === b.id)) {
                res = false;
            }

            if (res) {
                Assessor.Utils.log('lets test', a.name, b.name, ' for parallelity...');
                slope = (a.stdform[1] * b.stdform[2]) - (a.stdform[2] * b.stdform[1]);
                Assessor.Utils.log('testing', a.id, b.id, 'slope', slope);
                res =  Math.abs(slope) < this.eps;

                this.score = slope;

                if (res) {
                    Assessor.Utils.log('match: ', a.name, b.name);
                }
            }

            return res;
        },

        toJSON: function () {
            this.parameters = '["' + this.lines[0] + '", "' + this.lines[1] + '"]';
            return Assessor.Base.prototype.toJSON.call(this);
        }
    });

    /**
     * Verifies that the given lines lie (almost) orthogonal to each other.
     * @param {String} l1
     * @param {String} l2
     * @param {String} [eps]
     * @augments Assessor.Verifier.Parallel
     * @constructor
     */
    Assessor.Verifier.Normal = function (l1, l2, eps) {
        this['class'] = 'Normal';

        this.eps = eps || 0.2;

        /**
         * Store the line identifiers.
         * @type Array
         */
        this.lines = [l1, l2];

        return this;
    };
    Assessor.Verifier.Normal.prototype = new Assessor.Verifier.Parallel();

    Assessor.extend(Assessor.Verifier.Normal.prototype, /** @type Assessor.Verifier.Normal.prototype */ {
        // we derive this from Parallel, so we don't have to reimplement/copy&paste the choose implementation
        verify: function (elements, fixtures) {
            var a, b, res, slope;

            Assessor.Utils.log('normal verifiy called');
            if (this.lines.length < 2) {
                return false;
            }

            a = fixtures.get(this.lines[0]);
            b = fixtures.get(this.lines[1]);

            res = a && b;

            if (!res || (a.elementClass !== JXG.OBJECT_CLASS_LINE) || (b.elementClass !== JXG.OBJECT_CLASS_LINE) || (a.id === b.id)) {
                res = false;
            }

            if (res) {
                Assessor.Utils.log('lets test', a.name, b.name, ' for orthogonality...');
                slope = (a.stdform[1] * b.stdform[1]) + (a.stdform[2] * b.stdform[2]);
                Assessor.Utils.log('testing', a.id, b.id, 'slope', slope);
                res =  Math.abs(slope) < this.eps;

                this.score = slope;

                if (res) {
                    Assessor.Utils.log('match: ', a.name, b.name);
                }
            }

            return res;
        },

        toJSON: function () {
            this.parameters = '["' + this.lines[0] + '", "' + this.lines[1] + '", ' + this.eps + ']';
            return Assessor.Base.prototype.toJSON.call(this);
        }
    });

    /**
     * Checks if the given point lies near the given line.
     * @param {String} l
     * @param {String} p
     * @param {String} [eps]
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.PointOnLine = function (l, p, eps) {
        this['class'] = 'PointOnLine';

        this.eps = eps || 0.2;

        this.line = l;
        this.point = p;

        return this;
    };
    Assessor.Verifier.PointOnLine.prototype = new Assessor.Verifier.Verifier();

    Assessor.extend(Assessor.Verifier.PointOnLine.prototype, /** @lends Assessor.Verifier.PointOnLine.prototype */ {
        choose: function (elements, fixtures) {
            var fix, i, j, cancel = false,
                new_fixtures = [];

            for (i = 0; i < elements.points.length; i++) {
                for (j = 0; j < elements.lines.length; j++) {
                    fix = new Assessor.FixtureList(fixtures);
                    fix.set(this.point, elements.points[i]);

                    if (fixtures.get(this.line)) {
                        cancel = true;
                    } else {
                        fix.set(this.line, elements.lines[j]);
                    }

                    if (this.verify(elements, fix)) {
                        new_fixtures.push(fix);
                    }

                    if (cancel) {
                        break;
                    }
                }
            }

            return new_fixtures;
        },

        verify: function (elements, fixtures) {
            var l, p, v, res;

            Assessor.Utils.log('point on line verifiy called', this.point, 'on', this.line);
            l = fixtures.get(this.line);
            p = fixtures.get(this.point);

            res = !!(l && l.stdform && p && p.coords);

            if (res) {
                v = JXG.Math.innerProduct(l.stdform, p.coords.usrCoords, 3);
                Assessor.Utils.log('testing', l.id, 'on', p.id, '; result:', v);

                res =  Math.abs(v) < this.eps;

                this.score = v;

                if (res) {
                    Assessor.Utils.log('match: ', l.name, p.name);
                }
            }

            return res;
        },

        toJSON: function () {
            this.parameters = '["' + this.line + '", "' + this.point + '", ' + this.eps + ']';
            return Assessor.Base.prototype.toJSON.call(this);
        }
    });

}(this));
