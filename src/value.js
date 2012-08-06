/**
 * Base class for value objects.
 * @augments Assessor.Base
 * @constructor
 */
Assessor.Value.Value = function () {
    this.namespace = 'Value';
    this.class = 'Value';
    this.parameters = '[]';
};
Assessor.Value.Value.prototype = new Assessor.Base;

JXG.extend(Assessor.Value.Value.prototype, /** @lends Assessor.Value.Value.prototype */ {
    /**
     * Evaluates this value.
     * @param {Assessor.ElementList} elements
     * @param {Assessor.FixtureList} fixtures
     * @return {Number}
     */
    evaluate: function (elements, fixtures) {
        return NaN;
    },

    /**
     * Returns a list of possible fixtures for elements that are not fixed yet within the given <tt>fixtures</tt>.
     * @param {Assessor.ElementList} elements
     * @param {Assessor.FixtureList} fixtures
     * @return {Array}
     */
    choose: function (elements, fixtures) {
        return [];
    }
});


/**
 * Wrapper class for plain numeric values.
 * @param {Number} value
 * @augments Assessor.Value.Value
 * @constructor
 */
Assessor.Value.Number = function (value) {
    this.class = 'Number';

    /**
     * Store the value.
     * @type {Number}
     */
    this.value = value;
};
Assessor.Value.Number.prototype = new Assessor.Value.Value;

JXG.extend(Assessor.Value.Number.prototype, /** @lends Assessor.Value.Number.prototype */ {
    evaluate: function (elements, fixtures) {
        return this.value;
    },

    toJSON: function () {
        return this.value.toString();
    }
});


/**
 * Calculates the number of elements of the given type.
 * @param {String} what Possible values are <ul>
 *     <li>points</li>
 *     <li>lines</li>
 *     <li>circles</li>
 *     <li>polygons</li>
 *     <li>angles</li>
 * </ul>
 * @augments Assessor.Value.Value
 * @constructor
 */
Assessor.Value.NumberElements = function (what) {
    this.class = 'NumberElements';
    this.what = what;
};
Assessor.Value.NumberElements.prototype = new Assessor.Value.Value;

JXG.extend(Assessor.Value.NumberElements.prototype, /** @lends Assessor.Value.NumberElements.prototype */ {
    evaluate: function (elements, fixtures) {
        return elements[this.what].length;
    },

    toJSON: function () {
        this.parameters = '["' + this.what + '"]';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});


/**
 * Measure an angle. Contrary to the {@link Assessor.Value.Angle3P} evaluator this one assumes the existence of
 * an angle element defined by the {@link Assessor.Verifier.Angle} verifier.
 * @param {String} a
 * @augments Assessor.Value.Value
 * @constructor
 */
Assessor.Value.Angle = function (a) {
    this.class = 'Angle';

    /**
     * Contains the angle identifier.
     * @type {String}
     */
    this.angle = a;

};
Assessor.Value.Angle.prototype = new Assessor.Value.Value;

JXG.extend(Assessor.Value.Angle.prototype, /** @lends Assessor.Value.Angle.prototype */ {
    evaluate: function (elements, fixtures) {
        var A, B, C, res, a = fixtures.get(this.angle);

        if(!a) {
            return false;
        }

        A = JXG.getRef(a.board, a.parents[0]);
        B = JXG.getRef(a.board, a.parents[1]);
        C = JXG.getRef(a.board, a.parents[2]);

        res = A && B && C && A.id !== B.id && A.id !== C.id && B.id !== C.id;

        if (res) {
            res = JXG.Math.Geometry.trueAngle(A, B, C);

            Assessor.Utils.log('angle &lt;' + A.name + B.name + C.name + ' = ' + res);
        } else {
            res = NaN;
        }

        return res;
    },

    choose: function (elements, fixtures) {
        var new_fixtures = [], fix, i;

        if (!fixtures.get(this.angle)) {
            for (i = 0; i < elements.angles; i++) {
                fix = new Assessor.FixtureList(fixtures);
                fix.set(this.angle, elements.angles[i]);
            }
        }

        return new_fixtures;
    },

    toJSON: function () {
        this.parameters = '["' + this.angle + '"]';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});

/**
 * Measure an angle that is defined by any three points instead of an angle element. For the latter, use
 * {@link Assessor.Value.Angle}.
 * @param {String} A
 * @param {String} B
 * @param {String} C
 * @augments Assessor.Value.Value
 * @constructor
 */
Assessor.Value.Angle3P = function (A, B, C) {
    this.class = 'Angle3P';

    /**
     * Contains the three points defining the angle.
     * @type {Array}
     */
    this.points = [A, B, C];
};
Assessor.Value.Angle3P.prototype = new Assessor.Value.Value;

JXG.extend(Assessor.Value.Angle3P.prototype, /** @lends Assessor.Value.Angle3P.prototype */ {
    evaluate: function (elements, fixtures) {
        var A, B, C, res;

        A = fixtures.get(this.points[0]);
        B = fixtures.get(this.points[1]);
        C = fixtures.get(this.points[2]);

        res = A && B && C && A.id !== B.id && A.id !== C.id && B.id !== C.id;

        if (res) {
            res = JXG.Math.Geometry.trueAngle(A, B, C);

            Assessor.Utils.log('angle &lt;' + A.name + B.name + C.name + ' = ' + res);
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
                    fix = new Assessor.FixtureList(fixtures);

                    fix.set(this.points[0], elements.points[i]);
                    fix.set(this.points[1], elements.points[j]);
                    fix.set(this.points[2], elements.points[k]);

                    new_fixtures.push(fix);
                }
            }
        }

        return new_fixtures;
    },

    toJSON: function () {
        this.parameters = '["' + this.points.join('", "') + '"]';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});


/**
 * Determine the distance between two points.
 * @param {String} A
 * @param {String} B
 * @augments Assessor.Value.Value
 * @constructor
 */
Assessor.Value.Distance = function (A, B) {
    this.class = 'Distance';

    /**
     * Contains the points.
     * @type {Array}
     */
    this.points = [A, B];
};
Assessor.Value.Distance.prototype = new Assessor.Value.Value;

JXG.extend(Assessor.Value.Distance.prototype, /** @lends Assessor.Value.Distance.prototype */ {
    evaluate: function (elements, fixtures) {
        var A, B, res;

        A = fixtures.get(this.points[0]);
        B = fixtures.get(this.points[1]);

        res = A && B && A.id !== B.id;

        if (res) {
            res = A.Dist(B);

            Assessor.Utils.log('|' + A.name + B.name + '| = ' + res);
        } else {
            res = NaN;
        }

        return res;
    },

    choose: function (elements, fixtures) {
        var i, j, fix, new_fixtures = [];

        for (i = 0; i < elements.points.length; i++) {
            for (j = i + 1; j < elements.points.length; j++) {
                fix = new Assessor.FixtureList(fixtures);
                fix.set(this.points[0], elements.points[i]);
                fix.set(this.points[1], elements.points[j]);

                new_fixtures.push(fix);
            }
        }

        return new_fixtures;
    },

    toJSON: function () {
        this.parameters = '["' + this.points.join('", "') + '"]';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});

/**
 * Determine either the <tt>X</tt> or <tt>Y</tt> coordinate of a point.
 * @param {string} A
 * @param {String} [what='X'] Feasible values are <tt>X</tt> and <tt>Y</tt>. If another value is
 * given or this parameter is not given at all it falls back to <tt>X</tt>.
 * @augments Assessor.Value.Value
 * @constructor
 */
Assessor.Value.XY = function (A, what) {
    this.class = 'XY';

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
Assessor.Value.XY.prototype = new Assessor.Value.Value;

JXG.extend(Assessor.Value.XY.prototype, /** @lends Assessor.Value.XY.prototype */ {
    evaluate: function (elements, fixtures) {
        this.what = this.what.toLowerCase && this.what.toLowerCase() === 'y' ? 'Y' : 'X';
        return fixtures.get(this.point) ? fixtures.get(this.point)[this.what]() : NaN;
    },

    choose: function (elements, fixtures) {
        var new_fixtures = [], fix, i;

        if (!fixtures.get(this.point)) {
            for (i = 0; i < elements.points.length; i++) {
                fix = new Assessor.FixtureList(fixtures);
                fix.set(this.point, elements.points[i]);
                new_fixtures.push(fix);
            }
        }

        return new_fixtures;
    },

    toJSON: function () {
        this.parameters = '["' + this.point + '", "' + this.what + '"]';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});

/**
 * Determine the slope or y intersect of a line.
 * @param {String} l
 * @param {String} [what='y'] Accepts <tt>slope</tt> and <tt>y</tt>. If another value is
 * given or this parameter is not given at all it falls back to <tt>y</tt>.
 * @augments Assessor.Value.Value
 * @constructor
 */
Assessor.Value.SlopeY = function (l, what) {
    this.class = 'SlopeY';

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
Assessor.Value.SlopeY.prototype = new Assessor.Value.Value;

JXG.extend(Assessor.Value.SlopeY.prototype, /** @lends Assessor.Value.SlopeY.prototype */ {
    evaluate: function (elements, fixtures) {
        this.what = this.what.toLowerCase && this.what.toLowerCase() === 'slope' ? 'getSlope' : 'getRise';
        return fixtures.get(this.line) ? fixtures.get(this.line)[this.what]() : NaN;
    },

    choose: function (elements, fixtures) {
        var new_fixtures = [], fix, i;

        if (!fixtures.get(this.line)) {
            for (i = 0; i < elements.lines.length; i++) {
                fix = new Assessor.FixtureList(fixtures);
                fix.set(this.line, elements.lines[i]);
                new_fixtures.push(fix);
            }
        }

        return new_fixtures;
    },

    toJSON: function () {
        this.parameters = '["' + this.what + '", "' + this.line + '"]';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});

/**
 * Counts the number of vertices of a polygon.
 * @param {String} p
 * @augments Assessor.Value.Value
 * @constructor
 */
Assessor.Value.Vertices = function (p) {
    this.class = 'Vertices';

    /**
     * A polygon.
     * @type {String}
     */
    this.polygon = p;
};
Assessor.Value.Vertices.prototype = new Assessor.Value.Value;

JXG.extend(Assessor.Value.Vertices.prototype, {
    evaluate: function (elements, fixtures) {
        var p = fixtures.get(this.polygon);

        if (p) {
            Assessor.Utils.log('polygon', this.polygon, 'has', p.vertices.length - 1, 'vertices');
        }

        return p && p.vertices ? p.vertices.length - 1 : NaN;
    },

    choose: function (elements, fixtures) {
        var new_fixtures = [], fix, i;

        if (!fixtures.get(this.line)) {
            for (i = 0; i < elements.polygons.length; i++) {
                fix = new Assessor.FixtureList(fixtures);
                fix.set(this.polygon, elements.polygons[i]);
                new_fixtures.push(fix);
            }
        }

        return new_fixtures;
    },

    toJSON: function () {
        this.parameters = '["' + this.polygon + '"]';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});