// region GEOMETRIC

/**
 * Checks if three given points are collinear.
 * @param {String} A
 * @param {String} B
 * @param {String} C
 * @augments Assessor.Verifier.Verifier
 * @constructor
 */
Assessor.Verifier.Collinear = function (A, B, C) {
    this.class = "Collinear";

    /**
     * Stores the collinear points.
     * @type {Array}
     */
    this.points = [A, B, C];
};
Assessor.Verifier.Collinear.prototype = new Assessor.Verifier.Verifier;

JXG.extend(Assessor.Verifier.Collinear.prototype, /** @lends Assessor.Verifier.Collinear.prototype */ {
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
        } else {
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
            line = JXG.Math.crossProduct(A.coords.usrCoords, B.coords.usrCoords);
            proj = JXG.Math.Geometry.projectPointToLine(C, {stdform: line});

            res =  JXG.Math.Geometry.distance(proj.usrCoords.slice(1), C.coords.usrCoords.slice(1))/A.Dist(B) < 0.07;

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

// endregion GEOMETRIC

// region COMPARISON

/**
 * The value <tt>value</tt> has to be greater than or equal to <tt>min</tt> and lesser than
 * or equal to <tt>max</tt>.
 * @param {Number|Assessor.Value.Value} value
 * @param {Number|Assessor.Value.Value} min
 * @param {Number|Assessor.Value.Value} max
 * @augments Assessor.Verifier.Verifier
 * @constructor
 */
Assessor.Verifier.Between = function (value, min, max) {
    this.class = 'Between';

    /**
     * The value that is to be compared to {@link Assessor.Verifier.Between#min} and {@link Assessor.Verifier.Between#max}.
     * @type {Assessor.Value}
     */
    this.value = Assessor.Utils.expandNumber(value);

    /**
     * The lower bound for {@link Assessor.Verifier.Between#value}.
     * @type {Assessor.Value}
     */
    this.min = Assessor.Utils.expandNumber(min);

    /**
     * The upper bound for {@link Assessor.Verifier.Between#value}.
     * @type {Assessor.Value}
     */
    this.max = Assessor.Utils.expandNumber(max);
};
Assessor.Verifier.Between.prototype = new Assessor.Verifier.Verifier;

JXG.extend(Assessor.Verifier.Between.prototype, /** @lends Assessor.Verifier.Between.prototype */ {
    choose: function (elements, fixtures) {
        var vposs = this.value.choose(elements, fixtures),
            miposs, maposs, i, j, k, new_fixtures = [];

        for (i = 0; i < vposs.length; i++) {
            miposs = this.min.choose(elements, vposs[i]);
            if (miposs.length === 0) {
                miposs = [vposs[i]];
            }

            for (j = 0; j < miposs.length; j++) {
                maposs = this.max.choose(elements, miposs[j]);
                if(maposs.length === 0) {
                    maposs = [miposs[j]];
                }

                for (k = 0; k < maposs.length; k++) {
                    if (this.verify(elements, maposs[k])) {
                        new_fixtures.push(maposs[k]);
                    }
                }
            }
        }

        return new_fixtures;
    },

    verify: function (elements, fixtures) {
        var v = this.value.evaluate(elements, fixtures),
            min = this.min.evaluate(elements, fixtures),
            max = this.max.evaluate(elements, fixtures);

        return min <= v && v <= max;
    },

    toJSON: function () {
        this.parameters = '[' + this.value.toJSON() + ', ' + this.min + ', ' + this.max + ']';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});

/**
 * Base class for binary operators like {@link Assessor.Verifier.Equals} and
 * {@link Assessor.Verifier.Less}.
 * @param {Number|Assessor.Value.Value} lhs
 * @param {Number|Assessor.Value.Value} rhs
 * @augments Assessor.Verifier.Verifier
 * @constructor
 */
Assessor.Verifier.Binary = function (lhs, rhs) {
    this.class = 'Binary';

    /**
     * Left hand side of the equation.
     * @type {Assessor.Value}
     */
    this.lhs = Assessor.Utils.expandNumber(lhs);

    /**
     * Right hand side of the equation.
     * @type {Assessor.Value}
     */
    this.rhs = Assessor.Utils.expandNumber(rhs);
};
Assessor.Verifier.Binary.prototype = new Assessor.Verifier.Verifier;

JXG.extend(Assessor.Verifier.Binary.prototype, /** @lends Assessor.Verifier.Binary.prototype */ {
    choose: function (elements, fixtures) {
        var lposs = this.lhs.choose(elements, fixtures),
            rposs, new_fixtures = [], i, j;

        for (i = 0; i < lposs.length; i++) {
            rposs = this.rhs.choose(elements, lposs[i]);

            if (rposs.length === 0 && this.verify(elements, lposs[i])) {
                new_fixtures.push(lposs[i]);
            } else {
                for (j = 0; j < rposs.length; j++) {
                    if (this.verify(elements, rposs[j])) {
                        new_fixtures.push(rposs[j]);
                    }
                }
            }
        }

        return new_fixtures;
    },

    toJSON: function () {
        this.parameters = '[' + this.lhs.toJSON() + ', ' + this.rhs.toJSON() + ']';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});

/**
 * Compares two values and is valid only if those are equal or within a certain acceptance
 * range defined by <tt>eps</tt>.
 * @param {Number|Assessor.Value.Value} lhs
 * @param {Number|Assessor.Value.Value} rhs
 * @param {Number} [eps=1e-5]
 * @augments Assessor.Verifier.Binary
 * @constructor
 */
Assessor.Verifier.Equals = function (lhs, rhs, eps) {
    Assessor.Verifier.Binary.call(this, lhs, rhs);
    this.class = 'Equals';

    /**
     * Allow a small difference when comparing {@link Assessor.Verifier.Equals#lhs}
     * and {@link Assessor.Verifier.Equals#rhs}.
     * @type {Number}
     */
    this.eps = eps || 1e-5;
};
Assessor.Verifier.Equals.prototype = new Assessor.Verifier.Binary;

JXG.extend(Assessor.Verifier.Equals.prototype, /** @lends Assessor.Verifier.Equals.prototype */ {
    verify: function (elements, fixtures) {
        var lhs = this.lhs.evaluate(elements, fixtures),
            rhs = this.rhs.evaluate(elements, fixtures);

        return Math.abs(lhs - rhs) <= this.eps;
    },

    toJSON: function () {
        this.parameters = '[' + this.lhs.toJSON() + ', ' + this.rhs.toJSON() + ', ' + this.eps + ']';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});

/**
 * Compares two {@link Assessor.Value.Value} objects and verifies only if the <tt>lhs</tt> value is less
 * than the <tt>rhs</tt> value.
 * @param {Number|Assessor.Value.Value} lhs
 * @param {Number|Assessor.Value.Value} rhs
 * @augments Assessor.Verifier.Binary
 * @constructor
 */
Assessor.Verifier.Less = function (lhs, rhs) {
    Assessor.Verifier.Binary.call(this, lhs, rhs);
    this.class = 'Less';
};
Assessor.Verifier.Less.prototype = new Assessor.Verifier.Binary;

JXG.extend(Assessor.Verifier.Less.prototype, /** @lends Assessor.Verifier.Less.prototype */ {
    verify: function (elements, fixtures) {
        var lhs = this.lhs.evaluate(elements, fixtures),
            rhs = this.rhs.evaluate(elements, fixtures);

        return lhs < rhs;
    }
});

/**
 * Compares two {@link Assessor.Value.Value} objects and verifies only if the <tt>lhs</tt> value is less
 * than or equal to the <tt>rhs</tt> value.
 * @param {Number|Assessor.Value.Value} lhs
 * @param {Number|Assessor.Value.Value} rhs
 * @param {Number} [eps=1e-5]
 * @augments Assessor.Verifier.Binary
 * @constructor
 */
Assessor.Verifier.LEQ = function (lhs, rhs, eps) {
    Assessor.Verifier.Binary.call(this, lhs, rhs);
    this.class = 'LEQ';

    /**
     * Allow a small difference when comparing {@link Assessor.Verifier.Equals#lhs}
     * and {@link Assessor.Verifier.Equals#rhs}.
     * @type {Number}
     */
    this.eps = eps || 1e-5;
};
Assessor.Verifier.LEQ.prototype = new Assessor.Verifier.Binary;

JXG.extend(Assessor.Verifier.LEQ.prototype, /** @lends Assessor.Verifier.LEQ.prototype */ {
    verify: function (elements, fixtures) {
        var lhs = this.lhs.evaluate(elements, fixtures),
            rhs = this.rhs.evaluate(elements, fixtures);

        return lhs - rhs <= this.eps;
    },

    toJSON: function () {
        return Assessor.Verifier.Equals.prototype.toJSON.call(this);
    }
});

/**
 * Compares two {@link Assessor.Value.Value} objects and verifies only if the <tt>lhs</tt> value is greater
 * than the <tt>rhs</tt> value.
 * @param {Number|Assessor.Value.Value} lhs
 * @param {Number|Assessor.Value.Value} rhs
 * @augments Assessor.Verifier.Binary
 * @constructor
 */
Assessor.Verifier.Greater = function (lhs, rhs) {
    Assessor.Verifier.Binary.call(this, lhs, rhs);
    this.class = 'Greater';
};
Assessor.Verifier.Greater.prototype = new Assessor.Verifier.Binary;

JXG.extend(Assessor.Verifier.Greater.prototype, /** Assessor.Verifier.Greater.prototype */ {
    verify: function (elements, fixtures) {
        var lhs = this.lhs.evaluate(elements, fixtures),
            rhs = this.rhs.evaluate(elements, fixtures);

        return lhs > rhs;
    }
});

/**
 * Compares two {@link Assessor.Value.Value} objects and verifies only if the <tt>lhs</tt> value is greater
 * than or equal to the <tt>rhs</tt> value.
 * @param {Number|Assessor.Value.Value} lhs
 * @param {Number|Assessor.Value.Value} rhs
 * @param {Number} [eps=1e-5]
 * @augments Assessor.Verifier.Binary
 * @constructor
 */
Assessor.Verifier.GEQ = function (lhs, rhs, eps) {
    Assessor.Verifier.Binary.call(this, lhs, rhs);
    this.class = 'GEQ';

    /**
     * Allow a small difference when comparing {@link Assessor.Verifier.Equals#lhs}
     * and {@link Assessor.Verifier.Equals#rhs}.
     * @type {Number}
     */
    this.eps = eps || 1e-5;
};
Assessor.Verifier.GEQ.prototype = new Assessor.Verifier.Binary;

JXG.extend(Assessor.Verifier.GEQ.prototype, /** @lends Assessor.Verifier.GEQ.prototype */ {
    verify: function (elements, fixtures) {
        var lhs = this.lhs.evaluate(elements, fixtures),
            rhs = this.rhs.evaluate(elements, fixtures);

        return lhs - rhs >= this.eps;
    },

    toJSON: function () {
        return Assessor.Verifier.Equals.prototype.toJSON.call(this);
    }
});


/**
 * Verifies only of the given verifier does NOT verify.
 * @param {Assessor.Verifier.Verifier} v
 * @augments Assessor.Verifier.Verifier
 * @constructor
 */
Assessor.Verifier.Not = function (v) {
    this.class = 'Not';

    /**
     * The verifier that should not be verified.
     * @type {Assessor.Verifier.Verifier}
     */
    this.verifier = v;
};
Assessor.Verifier.Not.prototype = new Assessor.Verifier.Verifier;

JXG.extend(Assessor.Verifier.Not.prototype, /** @lends Assessor.Verifier.Not.prototype */ {
    choose: function (elements, fixtures) {
        return this.verifier.choose(elements, fixtures);
    },

    verify: function (elements, fixtures) {
        return !this.verifier.verify(elements, fixtures);
    },

    toJSON: function () {
        this.parameters = '[' + this.verifier.toJSON() + ']';
    }
});

// endregion COMPARISON

// region EXISTENCE
/**
 * There exists a line and this line is defined by the two given points.
 * @param {String} l Line
 * @param {String} A Point
 * @param {String} B Point
 * @augments Assessor.Verifier.Verifier
 * @constructor
 */
Assessor.Verifier.Line = function (l, A, B) {
    this.class = 'Line';

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

JXG.extend(Assessor.Verifier.Line.prototype, /** @lends Assessor.Verifier.Line.prototype */{
    choose: function (elements, fixtures) {
        var new_fixtures = [], fix, i, j;

        for (i = 0; i < elements.lines.length; i++) {
            fix = new Assessor.FixtureList(fixtures);
            fix.set(this.line, elements.lines[i]);

            for (j = 0; j < 2; j++) {
                fix.set(this.points[j], elements.lines[i]['point' + (j+1)]);
            }

            if (this.verify(elements, fix)) {
                new_fixtures.push(fix);
            }
        }

        return new_fixtures;
    },

    verify: function (elements, fixtures) {
        var l = fixtures.get(this.line),
            A = fixtures.get(this.points[0]),
            B = fixtures.get(this.points[1]);

        return l
            && JXG.indexOf(elements.points, l.point1) > -1 && JXG.indexOf(elements.points, l.point2) > -1
            && ((l.point1 === A && l.point2 === B) || (l.point1 === B && l.point2 === A));
    },

    toJSON: function () {
        this.parameters = '["' + this.line + '", "' + this.points.join('", "') + '"]';
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
    this.class = 'Angle';
    this.name = alpha;
    this.points = [A, B, C];
};
Assessor.Verifier.Angle.prototype = new Assessor.Verifier.Verifier;

JXG.extend(Assessor.Verifier.Angle.prototype, /** @lends Assessor.Verifier.Angle.prototype */ {
    choose: function (elements, fixtures) {
        var i, j, a, fix, new_fixtures = [];

        // find all valid combinations depending on previous fixtures
        for (i = 0; i < elements.angles.length; i++) {
            a = elements.angles[i];

            Assessor.Utils.log('checking out angle', a.name, 'with value', a.Value()*180/Math.PI);

            fix = new Assessor.FixtureList(fixtures);
            fix.set(this.name, a);

            for (j = 0; j < 3; j++) {
                fix.set(this.points[j], JXG.getRef(a.board, a.parents[j]));
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
            p[i] = p[i] || JXG.getRef(a.board, a.parents[i]);
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
    this.class = 'Polygon';

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

JXG.extend(Assessor.Verifier.Polygon.prototype, {
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
                fix.set(this.points[j], JXG.getRef(p.board, p.vertices[j]));
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

// endregion EXISTENCE