/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012 - 2013
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/*jslint nomen:true, plusplus:true*/
/*global define: true*/

define(['value/base', 'jsxgraph', 'utils/obj', 'utils/log'], function (Value, JXG, obj, Log) {

    "use strict";

    var NumberElements, Angle, Angle3P, Distance, XY, SlopeY, Vertices;

    /**
     * Calculates the number of elements of the given type.
     * @param {String} what Possible values are <ul>
     *     <li>points</li>
     *     <li>lines</li>
     *     <li>circles</li>
     *     <li>polygons</li>
     *     <li>angles</li>
     * </ul>
     * @augments Value.Value
     * @constructor
     */
    NumberElements = function NumberElements(what) {
        this.what = what;
    };

    obj.inherit(Value.Value, NumberElements, /** @lends NumberElements.prototype */ {
        evaluate: function (elements, fixtures) {
            Log.log('eval number of elements');
            return elements[this.what].length;
        }
    });


    /**
     * Measure an angle. Contrary to the {@link Angle3P} evaluator this one assumes the existence of
     * an angle element defined by the {@link Angle} verifier.
     * @param {String} a
     * @augments Value.Value
     * @constructor
     */
    Angle = function Angle(a) {
        /**
         * Contains the angle identifier.
         * @type {String}
         */
        this.angle = a;
    };

    obj.inherit(Value.Value, Angle, /** @lends Angle.prototype */ {
        evaluate: function (elements, fixtures) {
            var A, B, C, res, a = fixtures.get(this.angle);

            if (!a) {
                return false;
            }

            A = a.board.select(a.parents[0]);
            B = a.board.select(a.parents[1]);
            C = a.board.select(a.parents[2]);

            res = A && B && C && A.id !== B.id && A.id !== C.id && B.id !== C.id;

            if (res) {
                res = JXG.Math.Geometry.trueAngle(A, B, C);

                Log.log('angle &lt;' + A.name + B.name + C.name + ' = ' + res);
            } else {
                res = NaN;
            }

            return res;
        },

        choose: function (elements, fixtures) {
            var new_fixtures = [], fix, i;

            if (!fixtures.get(this.angle)) {
                for (i = 0; i < elements.angles; i++) {
                    fix = fixtures.fork();
                    fix.set(this.angle, elements.angles[i]);
                }
            }

            return new_fixtures;
        }
    });

    /**
     * Measure an angle that is defined by any three points instead of an angle element. For the latter, use
     * {@link Angle}.
     * @param {String} A
     * @param {String} B
     * @param {String} C
     * @augments Value/Value
     * @constructor
     */
    Angle3P = function Angle3P(A, B, C) {
        /**
         * Contains the three points defining the angle.
         * @type {Array}
         */
        this.points = [A, B, C];
    };

    obj.inherit(Value.Value, Angle3P, /** @lends Angle3P.prototype */ {
        evaluate: function (elements, fixtures) {
            var A, B, C, res;

            A = fixtures.get(this.points[0]);
            B = fixtures.get(this.points[1]);
            C = fixtures.get(this.points[2]);

            res = A && B && C && A.id !== B.id && A.id !== C.id && B.id !== C.id;

            if (res) {
                res = JXG.Math.Geometry.trueAngle(A, B, C);

                Log.log('angle &lt;' + A.name + B.name + C.name + ' = ' + res);
            } else {
                res = NaN;
            }

            return res;
        },

        choose: function (elements, fixtures) {
            var i, j, k, l, fix, new_fixtures = [];

            for (i = 0; i < elements.points.length; i++) {
                for (j = 0; j < elements.points.length; j++) {
                    for (k = 0; k < elements.points.length; k++) {
                        fix = fixtures.fork();

                        fix.set(this.points[0], elements.points[i]);
                        fix.set(this.points[1], elements.points[j]);
                        fix.set(this.points[2], elements.points[k]);

                        new_fixtures.push(fix);
                    }
                }
            }

            return new_fixtures;
        }
    });


    /**
     * Determine the distance between two points.
     * @param {String} A
     * @param {String} B
     * @augments Value.Value
     * @constructor
     */
    Distance = function Distance(A, B) {
        /**
         * Contains the points.
         * @type {Array}
         */
        this.points = [A, B];
    };

    obj.inherit(Value.Value, Distance, /** @lends Distance.prototype */ {
        evaluate: function (elements, fixtures) {
            var A, B, res;

            A = fixtures.get(this.points[0]);
            B = fixtures.get(this.points[1]);

            res = A && B && A.id !== B.id;

            if (res) {
                res = A.Dist(B);

                Log.log('|' + A.name + B.name + '| = ' + res);
            } else {
                res = NaN;
            }

            return res;
        },

        choose: function (elements, fixtures) {
            var i, j, fix, new_fixtures = [];

            for (i = 0; i < elements.points.length; i++) {
                for (j = i + 1; j < elements.points.length; j++) {
                    fix = fixtures.fork();
                    fix.set(this.points[0], elements.points[i]);
                    fix.set(this.points[1], elements.points[j]);

                    new_fixtures.push(fix);
                }
            }

            return new_fixtures;
        }
    });

    /**
     * Determine either the <tt>X</tt> or <tt>Y</tt> coordinate of a point.
     * @param {string} A
     * @param {String} [what='X'] Feasible values are <tt>X</tt> and <tt>Y</tt>. If another value is
     * given or this parameter is not given at all it falls back to <tt>X</tt>.
     * @augments Value.Value
     * @constructor
     */
    XY = function XY(A, what) {
        /**
         * The point which coordinate is to be measure.
         * @type {String}
         */
        this.point = A;

        /**
         * The oordinate we are measuring.
         * @type {String}
         */
        this.what = what;
    };

    obj.inherit(Value.Value, XY, /** @lends XY.prototype */ {
        evaluate: function (elements, fixtures) {
            this.what = this.what.toLowerCase && this.what.toLowerCase() === 'y' ? 'Y' : 'X';

            Log.log('XY');

            return fixtures.get(this.point) ? fixtures.get(this.point)[this.what]() : NaN;
        },

        choose: function (elements, fixtures) {
            var new_fixtures = [], fix, i;

            if (!fixtures.get(this.point)) {
                for (i = 0; i < elements.points.length; i++) {
                    fix = fixtures.fork();
                    fix.set(this.point, elements.points[i]);
                    new_fixtures.push(fix);
                }
            }

            return new_fixtures;
        }
    });

    /**
     * Determine the slope or y intersect of a line.
     * @param {String} l
     * @param {String} [what='y'] Accepts <tt>slope</tt> and <tt>y</tt>. If another value is
     * given or this parameter is not given at all it falls back to <tt>y</tt>.
     * @augments Value.Value
     * @constructor
     */
    SlopeY = function SlopeY(l, what) {
        /**
         * An identifier for a line
         * @type {String}
         */
        this.line = l;

        /**
         * <tt>y</tt> or <tt>slope</tt>.
         * @type {String}
         */
        this.what = what;
    };

    obj.inherit(Value.Value, SlopeY, /** @lends SlopeY.prototype */ {
        evaluate: function (elements, fixtures) {
            this.what = this.what.toLowerCase && this.what.toLowerCase() === 'slope' ? 'getSlope' : 'getRise';
            return fixtures.get(this.line) ? fixtures.get(this.line)[this.what]() : NaN;
        },

        choose: function (elements, fixtures) {
            var new_fixtures = [], fix, i;

            if (!fixtures.get(this.line)) {
                for (i = 0; i < elements.lines.length; i++) {
                    fix = fixtures.fork();
                    fix.set(this.line, elements.lines[i]);
                    new_fixtures.push(fix);
                }
            }

            return new_fixtures;
        }
    });

    /**
     * Counts the number of vertices of a polygon.
     * @param {String} p
     * @augments Value.Value
     * @constructor
     */
    Vertices = function (p) {
        /**
         * A polygon.
         * @type {String}
         */
        this.polygon = p;
    };

    obj.inherit(Value.Value, Vertices.prototype, {
        evaluate: function (elements, fixtures) {
            var p = fixtures.get(this.polygon);

            if (p) {
                Log.log('polygon', this.polygon, 'has', p.vertices.length - 1, 'vertices');
            }

            return p && p.vertices ? p.vertices.length - 1 : NaN;
        },

        choose: function (elements, fixtures) {
            var new_fixtures = [], fix, i;

            if (!fixtures.get(this.line)) {
                for (i = 0; i < elements.polygons.length; i++) {
                    fix = fixtures.fork();
                    fix.set(this.polygon, elements.polygons[i]);
                    new_fixtures.push(fix);
                }
            }

            return new_fixtures;
        }
    });

    obj.extend(Value, {
        NumberElements: NumberElements,
        Angle: Angle,
        Angle3P: Angle3P,
        Distance: Distance,
        XY: XY,
        SlopeY: SlopeY,
        Vertices: Vertices
    });

    return Value;
});
