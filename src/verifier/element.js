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
     * There exists a line and this line is defined by the two given points.
     * @param {String} A Point
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.Point = function (A) {
        this['class'] = 'Point';

        /**
         * The points defining the line
         * @type {Array}
         */
        this.point = A;
    };
    Assessor.Verifier.Point.prototype = new Assessor.Verifier.Verifier();

    Assessor.extend(Assessor.Verifier.Point.prototype, /** @lends Assessor.Verifier.Point.prototype */{
        choose: function (elements, fixtures) {
            var new_fixtures = [], fix, i, j;

            if (fixtures.get(this.point)) {
                return [];
            }

            for (i = 0; i < elements.points.length; i++) {
                fix = new Assessor.FixtureList(fixtures);
                fix.set(this.point, elements.points[i]);
                if (this.verify(elements, fix)) {
                    new_fixtures.push(fix);
                }
            }

            return new_fixtures;
        },

        verify: function (elements, fixtures) {
            var res,
                p = fixtures.get(this.point);

            res = p && (p.elementClass === JXG.OBJECT_CLASS_POINT);

            return res;
        },

        toJSON: function () {
            this.parameters = '["' + this.point + '"]';

            return Assessor.Base.prototype.toJSON.call(this);
        }
    });


    /**
     * There exists a line and this line is defined by the two given points.
     * @param {String} l Line
     * @param {String} A Point
     * @param {String} B Point
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.Line = function (l, A, B) {
        this['class'] = 'Line';

        /**
         * Store the identifier of the line.
         * @type {String}
         */
        this.line = l;

        /**
         * The points defining the line
         * @type {Array}
         */
        this.points = [A, B];
    };
    Assessor.Verifier.Line.prototype = new Assessor.Verifier.Verifier;

    Assessor.extend(Assessor.Verifier.Line.prototype, /** @lends Assessor.Verifier.Line.prototype */{
        choose: function (elements, fixtures) {
            var new_fixtures = [], fix, i, j;

            if (fixtures.get(this.line) && !(this.points[0] || this.points[1])) {
                return [];
            }

            for (i = 0; i < elements.lines.length; i++) {
                for (j = 0; j < 2; j++) {
                    fix = new Assessor.FixtureList(fixtures);
                    fix.set(this.line, elements.lines[i]);

                    fix.set(this.points[j], elements.lines[i].point1);
                    fix.set(this.points[(j + 1) % 2], elements.lines[i].point2);

                    if (this.verify(elements, fix)) {
                        new_fixtures.push(fix);
                    }
                }
            }

            return new_fixtures;
        },

        verify: function (elements, fixtures) {
            var res,
                l = fixtures.get(this.line),
                A = fixtures.get(this.points[0]),
                B = fixtures.get(this.points[1]);

            res = l && (l.elementClass === JXG.OBJECT_CLASS_LINE);

            if (this.points[0] && this.points[1]) {
                res = res && Assessor.JXG.indexOf(elements.points, l.point1) > -1 && Assessor.JXG.indexOf(elements.points, l.point2) > -1 &&
                    ((l.point1 === A && l.point2 === B) || (l.point1 === B && l.point2 === A));
            }

            return res;
        },

        toJSON: function () {
            if (this.points[0] && this.points[1]) {
                this.parameters = '["' + this.line + '", "' + this.points.join('", "') + '"]';
            } else {
                this.parameters = '["' + this.line + '"]';
            }

            return Assessor.Base.prototype.toJSON.call(this);
        }
    });


    /**
     * The angle <tt>alpha</tt> is defined by three points <tt>A, B</tt>, and <tt>C</tt>.
     * @param {String} alpha
     * @param {String} A
     * @param {String} B
     * @param {String} C
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.Angle = function (alpha, A, B, C) {
        this['class'] = 'Angle';
        this.name = alpha;
        this.points = [A, B, C];
    };
    Assessor.Verifier.Angle.prototype = new Assessor.Verifier.Verifier;

    Assessor.extend(Assessor.Verifier.Angle.prototype, /** @lends Assessor.Verifier.Angle.prototype */ {
        choose: function (elements, fixtures) {
            var i, j, a, fix, new_fixtures = [];

            // find all valid combinations depending on previous fixtures
            for (i = 0; i < elements.angles.length; i++) {
                a = elements.angles[i];

                Assessor.Utils.log('checking out angle', a.name, 'with value', a.Value()*180/Math.PI);

                fix = new Assessor.FixtureList(fixtures);
                fix.set(this.name, a);

                for (j = 0; j < 3; j++) {
                    fix.set(this.points[j], Assessor.JXG.getRef(a.board, a.parents[j]));
                }

                if (this.verify(elements, fix)) {
                    new_fixtures.push(fix);
                }
            }

            return new_fixtures;
        },

        verify: function (elements, fixtures) {
            var a = fixtures.get(this.name),
                p = [fixtures.get(this.points[0]),
                    fixtures.get(this.points[1]),
                    fixtures.get(this.points[2])],
                i;

            if (!a) {
                return false;
            }

            for (i = 0; i < 3; i++) {
                // check if the dependencies and the fixtures work out
                p[i] = p[i] || Assessor.JXG.getRef(a.board, a.parents[i]);
                if (p[i].id !== a.parents[i]) {
                    // nah, point (i+1) is already set but doesn't match with what it is set to
                    Assessor.Utils.log('point', i + 1, 'is wrong');
                    return false;
                }
            }

            return true;
        },

        toJSON: function () {
            this.parameters = '["' + this.name + '", "' + this.points.join('", "') + '"]';
            return Assessor.Base.prototype.toJSON.call(this);
        }
    });

    /**
     * Assume the existence of a polygon defined by the given points.
     * @param {String} p
     * @param {String} A|B|C|... Arbitrary number of points
     * @augments Assessor.Verifier.Verifier
     * @constructor
     */
    Assessor.Verifier.Polygon = function (p, A) {
        this['class'] = 'Polygon';

        /**
         * A polygon.
         * @type {String}
         */
        this.polygon = p;

        /**
         * An array of points that define the polygon.
         * @type {Array}
         */
        this.points = Array.prototype.slice.call(arguments, 1);
    };
    Assessor.Verifier.Polygon.prototype = new Assessor.Verifier.Verifier;

    Assessor.extend(Assessor.Verifier.Polygon.prototype, {
        choose: function (elements, fixtures) {
            var i, j, p, fix, new_fixtures = [];

            // find all valid combinations depending on previous fixtures
            for (i = 0; i < elements.polygons.length; i++) {
                p = elements.polygons[i];

                if (this.points.length !== p.vertices.length - 1) {
                    continue;
                }

                Assessor.Utils.log('checking out polygon', p.name);

                fix = new Assessor.FixtureList(fixtures);
                fix.set(this.polygon, p);
                for (j = 0; j < this.points.length; j++) {
                    fix.set(this.points[j], Assessor.JXG.getRef(p.board, p.vertices[j]));
                }

                if (this.verify(elements, fix)) {
                    new_fixtures.push(fix);
                }
            }

            return new_fixtures;
        },

        verify: function (elements, fixtures) {
            var a = fixtures.get(this.polygon),
                p = [],
                i;

            if (!a || a.vertices.length - 1 !== this.points.length) {
                Assessor.Utils.log('polygon undefined or vertices length doesn\'t match', a);
                return false;
            }

            for (i = 0; i < this.points.length; i++) {
                p.push(fixtures.get(this.points[i]));
            }

            for (i = 0; i < this.points.length; i++) {
                // check if the dependencies and the fixtures work out
                p[i] = p[i] || a.vertices[i];
                if (p[i].id !== a.vertices[i].id) {
                    // nah, point (i+1) is already set but doesn't match with what it is set to
                    Assessor.Utils.log('point', i + 1, 'is wrong');
                    return false;
                }
            }

            return true;
        },

        toJSON: function () {
            this.parameters = '["' + this.polygon + '", "' + this.points.join('", "') + '"]';
            return Assessor.Base.prototype.toJSON.call(this);
        }
    });
}(this));
