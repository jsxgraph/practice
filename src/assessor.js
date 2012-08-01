/**
 * Base class for all classes inside the Assessor namespace
 * @constructor
 */
Assessor.Base = function () {
    this.logs = [];
    this.expanded = true;
    this.class = 'Base';
    this.parameters = '[]';
};

JXG.extend(Assessor.Base.prototype, {
    log: function () {
        //this.logs.push(arguments);
        console.log.apply(console, arguments);
    },

    clearLog: function () {
        this.logs.length = 0;
    },

    toJSON: function () {
        return '{' +
                '"class": "' + this.class + '",' +
                '"parameters": ' + this.parameters +
            '}';
    },

    analyze: function () {
        var o = {};

        if (JSON && JSON.parse) {
            o = JSON.parse(this.toJSON());
        }

        return o;
    },

    simplifyFixtures: function (f) {
        var t = {}, i;

        for (i in f) {
            if (f.hasOwnProperty(i)) {
                t[i] = f[i].name;
            }
        }

        return t;
    },

    flatCopy: function (o) {
        var r = {}, i;

        for (i in o) {
            r[i] = o[i];
        }

        return r;
    },

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

    expand: function (classname, parameters) {
        var co;

        try {
            co = new (this.funstructor(classname, parameters))();
        } catch (e) {
            // meh, ignore it
            this.log(e, e.stack);
        }

        return co;
    },

    expandJSON: function (a) {
        var i, c, co, newc = [];

        for (i = 0; i < a.length; i++) {
            if (typeof a[i] === 'string' || !a[i].expanded) {
                c = JSON.parse(a[i]);
                co = this.expand(Assessor[c.class], c.parameters);
            } else {
                newc.push(a[i]);
            }
        }

        return newc;
    }
});

/**
 * Verifier base class
 * @constructor
 */
Assessor.Verifier = function () {
    this.class = "Verifier";
};
Assessor.Verifier.prototype = new Assessor.Base;

JXG.extend(Assessor.Verifier.prototype, {
    choose: function (elements, fixtures) {
        return [];
    },

    verify: function (elements, fixtures) {
        return false;
    },

    expandNumber: function(v) {
        var o = v;

        if (!v.expanded) {
            o = this.expand(Assessor.Number, [v]);
        }

        return o;
    }
});

/**
 * Assessment class, holds all verifiers for a given task.
 * @constructor
 */
Assessor.Assessment = function () {
    this.class = "Assessment";
    this.constraints = this.expandJSON(arguments);
    this.fixtures = {};
};
Assessor.Assessment.prototype = new Assessor.Verifier;

JXG.extend(Assessor.Assessment.prototype, {
    clearFixtures: function () {
        this.fixtures = {};
    },

    addFixtures: function (f) {
        var i;

        for (i in f) {
            if (f.hasOwnProperty(i) && !this.fixtures[i]) {
                this.log('fixing ' + i + ' to ' + f[i].name);
                this.fixtures[i] = f[i];
            }
        }
    },

    removeFixtures: function (f) {
        var i;

        for (i in f) {
            if (f.hasOwnProperty(i)) {
                this.log('deleting fixture of ' + i);
                delete this.fixtures[i];
            }
        }
    },

    collect: function (board) {
        var elements = {
                points: [],
                lines: [],
                circles: [],
                angles: [],
                polygons: []
        }, i, el;

        for (i = 0; i < board.objectsList.length; i++) {
            el = board.objectsList[i];

            if (!el.visProp.visible || el.visProp.priv) {
                continue;
            }

            if (el.elementClass === JXG.OBJECT_CLASS_POINT) {
                elements.points.push(el);
            } else if (el.elementClass === JXG.OBJECT_CLASS_LINE) {
                elements.lines.push(el);
            } else if (el.elementClass === JXG.OBJECT_CLASS_CIRCLE) {
                elements.circles.push(el);
            } else if (el.type === JXG.OBJECT_TYPE_ANGLE) {
                elements.angles.push(el);
            } else if (el.type === JXG.OBJECT_TYPE_POLYGON) {
                elements.polygons.push(el);
            }
        }

        this.log('collected', elements);

        return elements;
    },

    verify: function (board) {
        var e = this.collect(board);

        this.clearFixtures();

        return this.next(e, 0);
    },

    next: function (elements, i) {
        var poss, constr, j, t;

        if (i >= this.constraints.length) {
            this.log('got a leaf!');
            return true;
        }

        constr = this.constraints[i];

        this.log('now collecting', constr.toJSON(), 'fixtures are', this.simplifyFixtures(this.fixtures));
        poss = constr.choose(elements, this.fixtures);

        for (t = 0; t < poss.length; t++) {
            this.log('poss ', t, this.simplifyFixtures(poss[t]));
        }

        if (poss.length === 0) {
            this.log('i got 0 possibilities');

            if (constr.verify(elements, this.fixtures)) {
                this.log('poss 0, verified, go next');
                return this.next(elements, i + 1);
            } else {
                this.log('poss 0, not verified');
                return false;
            }
        } else {
            this.log('Constraint ' + constr.toJSON() + ' generated ' + poss.length + ' possibilities!');
            for (j = 0; j < poss.length; j++) {
                this.log('fixating', this.simplifyFixtures(this.fixtures));
                this.addFixtures(poss[j]);
                if (this.next(elements, i + 1)) {
                    return true;
                } else {
                    this.removeFixtures(poss[j]);
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