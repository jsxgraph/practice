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

    var Point, Line, Angle, Polygon;

    /**
     * There exists a line and this line is defined by the two given points.
     * @param {String} A Point
     * @augments Verifier.Verifier
     * @constructor
     */
    Point = function Point(A) {
        /**
         * The points defining the line
         * @type {Array}
         */
        this.point = A;
    };

    obj.inherit(Verifier.Verifier, Point, /** @lends Point.prototype */{
        choose: function (elements, fixtures) {
            var new_fixtures = [], fix, i, j;

            if (fixtures.get(this.point)) {
                return [];
            }

            for (i = 0; i < elements.points.length; i++) {
                fix = fixtures.fork();
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
        }
    });

    /**
     * There exists a line and this line is defined by the two given points.
     * @param {String} l Line
     * @param {String} A Point
     * @param {String} B Point
     * @augments Verifier.Verifier
     * @constructor
     */
    Line = function Line(l, A, B) {
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

    obj.inherit(Verifier.Verifier, Line, /** @lends Line.prototype */{
        choose: function (elements, fixtures) {
            var new_fixtures = [], fix, i, j;

            if (fixtures.get(this.line) && !(this.points[0] || this.points[1])) {
                return [];
            }

            for (i = 0; i < elements.lines.length; i++) {
                for (j = 0; j < 2; j++) {
                    fix = fixtures.fork();
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
                res = res && JXG.indexOf(elements.points, l.point1) > -1 && JXG.indexOf(elements.points, l.point2) > -1 &&
                    ((l.point1 === A && l.point2 === B) || (l.point1 === B && l.point2 === A));
            }

            return res;
        }
    });


    /**
     * The angle <tt>alpha</tt> is defined by three points <tt>A, B</tt>, and <tt>C</tt>.
     * @param {String} alpha
     * @param {String} A
     * @param {String} B
     * @param {String} C
     * @augments Verifier.Verifier
     * @constructor
     */
    Angle = function Angle(alpha, A, B, C) {
        this.name = alpha;
        this.points = [A, B, C];
    };

    obj.inherit(Verifier.Verifier, Angle, /** @lends Angle.prototype */ {
        choose: function (elements, fixtures) {
            var i, j, a, fix, new_fixtures = [];

            // find all valid combinations depending on previous fixtures
            for (i = 0; i < elements.angles.length; i++) {
                a = elements.angles[i];

                Log.log('checking out angle', a.name, 'with value', a.Value() * 180 / Math.PI);

                fix = fixtures.fork();
                fix.set(this.name, a);

                for (j = 0; j < 3; j++) {
                    fix.set(this.points[j], a.board.select(a.parents[j]));
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
                p[i] = p[i] || a.board.select(a.parents[i]);
                if (p[i].id !== a.parents[i]) {
                    // nah, point (i+1) is already set but doesn't match with what it is set to
                    Log.log('point', i + 1, 'is wrong');
                    return false;
                }
            }

            return true;
        }
    });

    /**
     * Assume the existence of a polygon defined by the given points.
     * @param {String} p
     * @param {String} A|B|C|... Arbitrary number of points
     * @augments Verifier.Verifier
     * @constructor
     */
    Polygon = function Polygon(p, A) {
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

    obj.inherit(Verifier.Verifier, Polygon, /** @lends Polygon.prototype */ {
        choose: function (elements, fixtures) {
            var i, j, p, fix, new_fixtures = [];

            // find all valid combinations depending on previous fixtures
            for (i = 0; i < elements.polygons.length; i++) {
                p = elements.polygons[i];

                if (this.points.length === p.vertices.length - 1) {
                    Log.log('checking out polygon', p.name);

                    fix = fixtures.fork();
                    fix.set(this.polygon, p);
                    for (j = 0; j < this.points.length; j++) {
                        fix.set(this.points[j], p.board.select(p.vertices[j]));
                    }

                    if (this.verify(elements, fix)) {
                        new_fixtures.push(fix);
                    }
                }
            }

            return new_fixtures;
        },

        verify: function (elements, fixtures) {
            var a = fixtures.get(this.polygon),
                p = [],
                i;

            if (!a || a.vertices.length - 1 !== this.points.length) {
                Log.log('polygon undefined or vertices length doesn\'t match', a);
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
                    Log.log('point', i + 1, 'is wrong');
                    return false;
                }
            }

            return true;
        }
    });

    obj.extend(Verifier, {
        Point: Point,
        Line: Line,
        Angle: Angle,
        Polygon: Polygon
    });

    return Verifier;
});
