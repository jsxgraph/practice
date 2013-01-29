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
     * Collect all valid fixtures, not just the first one.
     * @param {JXG.Board} board
     * @param {Array} success
     */
    collect: function (board, success) {
        var e = new Assessor.ElementList(board);

        this.fixtures.clear();

        this.next(e, 0, success);

        return success;
    },

    /**
     * Backtracking algorithm to verify an assessment. This method goes through all verifiers in
     * {@link Assessor.Assessment#constraints} and tries to map all <tt>elements</tt> to the correct
     * elements given by the author in the constraints such that all of the constraints are fulfilled.
     * @param {Assessor.ElementList} elements
     * @param {Number} i
     * @param {Array} [success]
     * @return {Boolean}
     */
    next: function (elements, i, success) {
        var poss, constr, j, t;

        if (i >= this.constraints.length) {
            Assessor.Utils.log('got a leaf!');

            if (success) {
                t = JXG.toJSON(this.fixtures.simplify());

                if (JXG.indexOf(success, t) === -1) {
                    success.push(t);
                }

                return false;
            }

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
                return this.next(elements, i + 1, success);
            } else {
                Assessor.Utils.log('poss 0, not verified');
                return false;
            }
        } else {
            Assessor.Utils.log('Constraint ' + constr.toJSON() + ' generated ' + poss.length + ' possibilities!');
            for (j = 0; j < poss.length; j++) {
                Assessor.Utils.log('fixating', this.fixtures.simplify());
                this.fixtures['import'](poss[j]);
                if (this.next(elements, i + 1, success)) {
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

