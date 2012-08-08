/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012
        Michael Gerhäuser

    Licensed under the LGPL v3
*/


/**
 * Namespace for all classes, namespaces and objects in practice.
 * @namespace
 */
Assessor = {
    /**
     * @private
     */
    JXG: typeof JXG !== 'undefined' ? JXG : null,

    extend: function (o, e) {
        var i;

        for(i in e) {
            o[i] = e[i];
        }
    }
};


/**
 * Base class for all classes inside the Assessor namespace.
 * @constructor
 */
Assessor.Base = function () {
    /**
     * A flag to indicate this is an actual instance.
     * @type {Boolean}
     * @default true
     */
    this.expanded = true;

    /**
     * The namespace the class is in or <tt>null</tt> if the class is defined directly
     * in the main namespace.
     * @type {String}
     */
    this.namespace = null;

    /**
     * Classname of the object the current instance is created from.
     * @type {String}
     * @name class
     * @memberOf Assessor.Base.prototype
     */
    this['class'] = 'Base';

    /**
     * JSON string representing the constructor parameters as elements of an array.
     * @type {String}
     */
    this.parameters = '[]';
};

Assessor.extend(Assessor.Base.prototype, /** @lends Assessor.Base.prototype */ {
    /**
     * Generates a JSON representation of this object that can be used to restore it.
     * @return {String}
     */
    toJSON: function () {
        return '{' +
                '"namespace": "' + (this.namespace || 'null') + '",' +
                '"class": "' + this['class'] + '",' +
                '"parameters": ' + this.parameters +
            '}';
    },

    /**
     * Returns the JSON representation of the whole assessment and parses it. Can be used
     * for debugging.
     * @private
     * @return {Object}
     */
    analyze: function () {
        var o = {};

        if (JSON && JSON.parse) {
            o = JSON.parse(this.toJSON());
        }

        return o;
    }
});


/**
 * Sorts all elements of a JSXGraph board by their types.
 * @param {JXG.Board} board
 * @augments Assessor.Base
 * @constructor
 */
Assessor.ElementList = function (board) {
    /**
     * Holds all points.
     * @type {Array}
     */
    this.points = [];

    /**
     * Holds all lines
     * @type {Array}
     */
    this.lines = [];

    /**
     * Holds all circles.
     * @type {Array}
     */
    this.circles = [];

    /**
     * Holds all polygons.
     * @type {Array}
     */
    this.polygons = [];

    /**
     * Holds all angles.
     * @type {Array}
     */
    this.angles = [];

    var i, el;

    for (i = 0; i < board.objectsList.length; i++) {
        el = board.objectsList[i];

        if (!el.visProp.visible || el.visProp.priv) {
            continue;
        }

        if (el.elementClass === Assessor.JXG.OBJECT_CLASS_POINT) {
            this.points.push(el);
        } else if (el.elementClass === Assessor.JXG.OBJECT_CLASS_LINE) {
            this.lines.push(el);
        } else if (el.elementClass === Assessor.JXG.OBJECT_CLASS_CIRCLE) {
            this.circles.push(el);
        } else if (el.type === Assessor.JXG.OBJECT_TYPE_ANGLE) {
            this.angles.push(el);
        } else if (el.type === Assessor.JXG.OBJECT_TYPE_POLYGON) {
            this.polygons.push(el);
        }
    }

    Assessor.Utils.log('collected', this);
};
Assessor.ElementList.prototype = new Assessor.Base;


/**
 * Tracks the fixtures.
 * @param {Assessor.FixtureList} [fl] Optional import the fixtures from this list.
 * @augments Assessor.Base
 * @constructor
 */
Assessor.FixtureList = function (fl) {
    /**
     * The property name is the element name as introduced by the assessment author and
     * the property value is a reference to an element created during the actual assessment.
     * @type {Object}
     */
    this.list = {};

    if (fl) {
        this['import'](fl);
    }
};
Assessor.FixtureList.prototype = new Assessor.Base;

Assessor.extend(Assessor.FixtureList.prototype, /** @lends Assessor.FixtureList.prototype */ {
    /**
     * Retrieve the current fixture of a given element.
     * @param {String} name
     * @return {JXG.GeometryElement}
     */
    'get': function (name) {
        return this.list[name];
    },

    /**
     * Add a new fixture.
     * @param {Object} name
     * @param {JXG.GeometryElement} element
     */
    'set': function (name, element) {
        if (!this.list[name]) {
            this.list[name] = element;
        }

        return !this.list[name];
    },

    /**
     * Clear all the fixtures.
     */
    clear: function () {
        this.list = {};
    },

    /**
     * Import fixtures from another fixture list.
     * @param {Assessor.FixtureList} fl
     */
    'import': function (fl) {
        var i;

        for (i in fl.list) {
            if (!this.list[i]) {
                this.list[i] = fl.list[i];
            }
        }
    },

    /**
     * Remove fixtures.
     * @params {Assessor.FixtureList} fl
     */
    remove: function (fl) {
        var i;

        for (i in fl.list) {
            delete this.list[i];
        }
    },

    /**
     * Replaces the target references by the elements names.
     * @return {Object}
     */
    simplify: function () {
        var t = {}, i;

        for (i in this.list) {
            if (this.list.hasOwnProperty(i)) {
                t[i] = this.list[i].name;
            }
        }

        return t;
    }
});


/**
 * Contains all the verifier objects.
 * @namespace
 */
Assessor.Verifier = {};

/**
 * Contains all value objects.
 * @namespace
 */
Assessor.Value = {};

/**
 * Verifier base class
 * @augments Assessor.Base
 * @constructor
 */
Assessor.Verifier.Verifier = function () {
    this.namespace = 'Verifier';
    this['class'] = "Verifier";
};
Assessor.Verifier.Verifier.prototype = new Assessor.Base;

Assessor.extend(Assessor.Verifier.Verifier.prototype, /** @lends Assessor.Verifier.Verifier.prototype */ {
    /**
     * Compiles a list of all fixtures that can be applied to this verifier while
     * this verifier is still valid under the given fixtures.
     * @param {Assessor.ElementList} elements
     * @param {Assessor.FixtureList} fixtures
     * @return {Array} An array of {@link Assessor.FixtureList} objects.
     */
    choose: function (elements, fixtures) {
        return [];
    },

    /**
     * Verifies this verifier object under the given fixtures.
     * @param {Assessor.ElementList} elements
     * @param {Assessor.FixtureList} fixtures
     * @return {Boolean}
     */
    verify: function (elements, fixtures) {
        return false;
    }
});

/**
 * Assessment class, holds all verifiers for a given task.
 * @augments Assessor.Verifier.Verifier
 * @constructor
 */
Assessor.Assessment = function () {
    this.namespace = null;
    this['class'] = "Assessment";

    /**
     * Holds the constraints for this assessment.
     * @type {Array} Array of {@link Assessor.Verifier} instances.
     */
    this.constraints = Assessor.Utils.expandJSON(arguments);

    /**
     * Keeps track of the fixed elements
     * @type {Assessor.FixtureList}
     */
    this.fixtures = new Assessor.FixtureList();
};
Assessor.Assessment.prototype = new Assessor.Verifier.Verifier;

Assessor.extend(Assessor.Assessment.prototype, /** @lends Assessor.Assessment.prototype */ {
    /**
     * Entry point for the verification algorithm.
     * @param {JXG.Board} board
     * @return {Boolean}
     */
    verify: function (board) {
        var e = new Assessor.ElementList(board);

        this.fixtures.clear();

        return this.next(e, 0);
    },

    /**
     * Backtracking algorithm to verify an assessment. This method goes through all verifiers in
     * {@link Assessor.Assessment#constraints} and tries to map all <tt>elements</tt> to the correct
     * elements given by the author in the constraints such that all of the constraints are fulfilled.
     * @param {Assessor.ElementList} elements
     * @param {Number} i
     * @return {Boolean}
     */
    next: function (elements, i) {
        var poss, constr, j, t;

        if (i >= this.constraints.length) {
            Assessor.Utils.log('got a leaf!');
            return true;
        }

        constr = this.constraints[i];

        Assessor.Utils.log('now collecting', constr.toJSON(), 'fixtures are', this.fixtures.simplify());
        poss = constr.choose(elements, this.fixtures);

        for (t = 0; t < poss.length; t++) {
            Assessor.Utils.log('poss ', t, poss[t].simplify());
        }

        if (poss.length === 0) {
            Assessor.Utils.log('i got 0 possibilities');

            if (constr.verify(elements, this.fixtures)) {
                Assessor.Utils.log('poss 0, verified, go next');
                return this.next(elements, i + 1);
            } else {
                Assessor.Utils.log('poss 0, not verified');
                return false;
            }
        } else {
            Assessor.Utils.log('Constraint ' + constr.toJSON() + ' generated ' + poss.length + ' possibilities!');
            for (j = 0; j < poss.length; j++) {
                Assessor.Utils.log('fixating', this.fixtures.simplify());
                this.fixtures['import'](poss[j]);
                if (this.next(elements, i + 1)) {
                    return true;
                } else {
                    this.fixtures.remove(poss[j]);
                }
            }

            return false;
        }
    },

    toJSON: function () {
        var i, p = [];

        for (i = 0; i < this.constraints.length; i++) {
            p.push(this.constraints[i].toJSON());
        }
        this.parameters = '[' + p.join(', ') + ']';

        return Assessor.Base.prototype.toJSON.call(this);
    }
});

/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012
        Michael Gerhäuser

    Licensed under the LGPL v3
*/


/**
 * This namespaces contains a few misc helper functions and constants.
 * @namespace
 */
Assessor.Utils = {
    /**
     * Default value for acceptance ranges.
     * @type Number
     */
    eps: 1e-5,

    /**
     * Store all log messages.
     */
    logs: [],

    /**
     * Initialize a new instance of a class and use <tt>params</tt> as parameters.
     * @see http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
     * @param {Function} Constructor
     * @param {Array} params
     * @return {Object}
     */
    funstructor: function (Constructor, params) {
        // borrowed from http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply

        return function () {
            var Temp = function () {}, inst, ret;

            // Give the Temp constructor the Constructor's prototype
            Temp.prototype = Constructor.prototype;

            // Create a new instance
            inst = new Temp;

            // Call the original Constructor with the temp
            // instance as its context (i.e. its 'this' value)
            ret = Constructor.apply(inst, params);

            // If an object has been returned then return it otherwise
            // return the original instance.
            // (consistent with behaviour of the new operator)
            return Object(ret) === ret ? ret : inst;
        };
    },

    /**
     * Wrapper for {@link Assessor.Utils#funstructor} with exception "handling" (in this case, handling means ignoring).
     * @param {Function} classname
     * @param {Array} parameters
     * @return {Object}
     */
    expand: function (classname, parameters) {
        var co;

        try {
            co = new (this.funstructor(classname, parameters))();
        } catch (e) {
            // meh, ignore it
        }

        return co;
    },

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
    },

    /**
     * Creates an {@link Assessor.Value.Number} if the given value is not a verifier object.
     * @param {Number,Assessor.Value.Number} v
     * @return {Assessor.Value.Number}
     */
    expandNumber: function(v) {
        var o = v;

        if (typeof v !== 'undefined' && !v.expanded) {
            o = this.expand(Assessor.Value.Number, [v]);
        }

        return o;
    },

    /**
     * Store all the parameters in one entry of the {@link Assessor.Utils#logs} array.
     */
    log: function () {
        this.logs.push(arguments);
    },

    /**
     * Dump the whole log into the console (if available).
     */
    dumpLog: function () {
        var i;

        if (!console || !console.log) {
            return;
        }

        for (i = 0; i < this.logs.length; i++) {
            console.log.apply(console, this.logs[i]);
        }
    }
};

/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012
        Michael Gerhäuser

    Licensed under the LGPL v3
*/


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
    this['class'] = "Collinear";

    /**
     * Stores the collinear points.
     * @type {Array}
     */
    this.points = [A, B, C];
};
Assessor.Verifier.Collinear.prototype = new Assessor.Verifier.Verifier;

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
            line = Assessor.JXG.Math.crossProduct(A.coords.usrCoords, B.coords.usrCoords);
            proj = Assessor.JXG.Math.Geometry.projectPointToLine(C, {stdform: line});

            res =  Assessor.JXG.Math.Geometry.distance(proj.usrCoords.slice(1), C.coords.usrCoords.slice(1))/A.Dist(B) < 0.07;

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
    this['class'] = 'Between';

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

Assessor.extend(Assessor.Verifier.Between.prototype, /** @lends Assessor.Verifier.Between.prototype */ {
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
        this.parameters = '[' + this.value.toJSON() + ', ' + this.min.toJSON() + ', ' + this.max.toJSON() + ']';
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
    this['class'] = 'Binary';

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

Assessor.extend(Assessor.Verifier.Binary.prototype, /** @lends Assessor.Verifier.Binary.prototype */ {
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
    this['class'] = 'Equals';

    /**
     * Allow a small difference when comparing {@link Assessor.Verifier.Equals#lhs}
     * and {@link Assessor.Verifier.Equals#rhs}.
     * @type {Number}
     */
    this.eps = eps || 1e-5;
};
Assessor.Verifier.Equals.prototype = new Assessor.Verifier.Binary;

Assessor.extend(Assessor.Verifier.Equals.prototype, /** @lends Assessor.Verifier.Equals.prototype */ {
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
    this['class'] = 'Less';
};
Assessor.Verifier.Less.prototype = new Assessor.Verifier.Binary;

Assessor.extend(Assessor.Verifier.Less.prototype, /** @lends Assessor.Verifier.Less.prototype */ {
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
    this['class'] = 'LEQ';

    /**
     * Allow a small difference when comparing {@link Assessor.Verifier.Equals#lhs}
     * and {@link Assessor.Verifier.Equals#rhs}.
     * @type {Number}
     */
    this.eps = eps || 1e-5;
};
Assessor.Verifier.LEQ.prototype = new Assessor.Verifier.Binary;

Assessor.extend(Assessor.Verifier.LEQ.prototype, /** @lends Assessor.Verifier.LEQ.prototype */ {
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
    this['class'] = 'Greater';
};
Assessor.Verifier.Greater.prototype = new Assessor.Verifier.Binary;

Assessor.extend(Assessor.Verifier.Greater.prototype, /** @lends Assessor.Verifier.Greater.prototype */ {
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
    this['class'] = 'GEQ';

    /**
     * Allow a small difference when comparing {@link Assessor.Verifier.Equals#lhs}
     * and {@link Assessor.Verifier.Equals#rhs}.
     * @type {Number}
     */
    this.eps = eps || 1e-5;
};
Assessor.Verifier.GEQ.prototype = new Assessor.Verifier.Binary;

Assessor.extend(Assessor.Verifier.GEQ.prototype, /** @lends Assessor.Verifier.GEQ.prototype */ {
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
    this['class'] = 'Not';

    /**
     * The verifier that should not be verified.
     * @type {Assessor.Verifier.Verifier}
     */
    this.verifier = v;
};
Assessor.Verifier.Not.prototype = new Assessor.Verifier.Verifier;

Assessor.extend(Assessor.Verifier.Not.prototype, /** @lends Assessor.Verifier.Not.prototype */ {
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
            && Assessor.JXG.indexOf(elements.points, l.point1) > -1 && Assessor.JXG.indexOf(elements.points, l.point2) > -1
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

// endregion EXISTENCE

/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012
        Michael Gerhäuser

    Licensed under the LGPL v3
*/


/**
 * Base class for value objects.
 * @augments Assessor.Base
 * @constructor
 */
Assessor.Value.Value = function () {
    this.namespace = 'Value';
    this['class'] = 'Value';
    this.parameters = '[]';
};
Assessor.Value.Value.prototype = new Assessor.Base;

Assessor.extend(Assessor.Value.Value.prototype, /** @lends Assessor.Value.Value.prototype */ {
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
    this['class'] = 'Number';

    /**
     * Store the value.
     * @type {Number}
     */
    this.value = value;
};
Assessor.Value.Number.prototype = new Assessor.Value.Value;

Assessor.extend(Assessor.Value.Number.prototype, /** @lends Assessor.Value.Number.prototype */ {
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
    this['class'] = 'NumberElements';
    this.what = what;
};
Assessor.Value.NumberElements.prototype = new Assessor.Value.Value;

Assessor.extend(Assessor.Value.NumberElements.prototype, /** @lends Assessor.Value.NumberElements.prototype */ {
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
    this['class'] = 'Angle';

    /**
     * Contains the angle identifier.
     * @type {String}
     */
    this.angle = a;

};
Assessor.Value.Angle.prototype = new Assessor.Value.Value;

Assessor.extend(Assessor.Value.Angle.prototype, /** @lends Assessor.Value.Angle.prototype */ {
    evaluate: function (elements, fixtures) {
        var A, B, C, res, a = fixtures.get(this.angle);

        if(!a) {
            return false;
        }

        A = Assessor.JXG.getRef(a.board, a.parents[0]);
        B = Assessor.JXG.getRef(a.board, a.parents[1]);
        C = Assessor.JXG.getRef(a.board, a.parents[2]);

        res = A && B && C && A.id !== B.id && A.id !== C.id && B.id !== C.id;

        if (res) {
            res = Assessor.JXG.Math.Geometry.trueAngle(A, B, C);

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
    this['class'] = 'Angle3P';

    /**
     * Contains the three points defining the angle.
     * @type {Array}
     */
    this.points = [A, B, C];
};
Assessor.Value.Angle3P.prototype = new Assessor.Value.Value;

Assessor.extend(Assessor.Value.Angle3P.prototype, /** @lends Assessor.Value.Angle3P.prototype */ {
    evaluate: function (elements, fixtures) {
        var A, B, C, res;

        A = fixtures.get(this.points[0]);
        B = fixtures.get(this.points[1]);
        C = fixtures.get(this.points[2]);

        res = A && B && C && A.id !== B.id && A.id !== C.id && B.id !== C.id;

        if (res) {
            res = Assessor.JXG.Math.Geometry.trueAngle(A, B, C);

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
    this['class'] = 'Distance';

    /**
     * Contains the points.
     * @type {Array}
     */
    this.points = [A, B];
};
Assessor.Value.Distance.prototype = new Assessor.Value.Value;

Assessor.extend(Assessor.Value.Distance.prototype, /** @lends Assessor.Value.Distance.prototype */ {
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
    this['class'] = 'XY';

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

Assessor.extend(Assessor.Value.XY.prototype, /** @lends Assessor.Value.XY.prototype */ {
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
    this['class'] = 'SlopeY';

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

Assessor.extend(Assessor.Value.SlopeY.prototype, /** @lends Assessor.Value.SlopeY.prototype */ {
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
    this['class'] = 'Vertices';

    /**
     * A polygon.
     * @type {String}
     */
    this.polygon = p;
};
Assessor.Value.Vertices.prototype = new Assessor.Value.Value;

Assessor.extend(Assessor.Value.Vertices.prototype, {
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

/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012
        Michael Gerhäuser

    Licensed under the LGPL v3
*/


(function () {
    var i, s, n, files = ['assessor', 'utils', 'verifier', 'value'],
        requirePath = '';

    var require = function(libraryName) {
        document.write('<script type="text/javascript" src="' + libraryName + '"><\/script>');
    };

    if (typeof document !== 'undefined' && typeof Assessor === 'undefined') {
        for (i=0;i<document.getElementsByTagName("script").length;i++) {
            s = document.getElementsByTagName("script")[i];
            if (s.src && s.src.match(/practice\.js(\?.*)?$/)) {
                requirePath = s.src.replace(/practice\.js(\?.*)?$/,'');
                for (n = 0; n < files.length; n++) {
                    (function (include) {
                        require(requirePath + include + '.js');
                    })(files[n]);
                }
            }
        }
    }

    if (typeof Assessor !== 'undefined' && typeof module !== 'undefined') {
        module.exports = function (JXG) {
            Assessor.JXG = JXG;
            return Assessor;
        };
    }
})();
