Assessor.ConstraintCollection = function () {
    var next;

    this.logs = [];

    this.fixtures = {};

    this.constraints = Array.prototype.slice.call(arguments, 0);

    this.log = function (str) {
        this.logs.push(str);
    };

    this.clearLog = function () {
        this.logs.length = 0;
    };

    this.addConstraints = function () {
        this.constraints.concat.apply(this.constraints, arguments);

        this.updateConstraints();
    };

    this.updateConstraints = function () {
        var i, c, co, newc = [],
            thor = function (Constructor, params) {
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
            };


        for (i = 0; i < this.constraints.length; i++) {
            if (typeof this.constraints[i] === 'string') {
                try {
                    c = JSON.parse(this.constraints[i]);
                    co = new (thor(Assessor[c.class], c.parameters))();
                    console.log(c, co);
                    newc.push(co);
                } catch (e) {
                    // meh, ignore it
                    console.log(e, e.stack);
                }
            } else {
                newc.push(this.constraints[i]);
            }
        }

        this.constraints = newc;
    };

    this.collect = function () {
        var i, j, tmp, c = {};

        for (i = 0; i < this.constraints.length; i++) {
            tmp = this.constraints.elements();
            for (j = 0; j < tmp.length; j++) {
                c[tmp[j]] = false;
            }
        }

        return c;
    };

    this.fixate = function (f) {
        var i;

        for (i in f) {
            if (f.hasOwnProperty(i) && !this.fixtures[i]) {
                this.log('fixing ' + i + ' to ' + f[i].name);
                this.fixtures[i] = f[i];
            }
        }
    };

    this.removeFixtures = function (f) {
        var i;

        for (i in f) {
            if (f.hasOwnProperty(i)) {
                this.log('deleting fixture of ' + i);
                delete this.fixtures[i];
            }
        }
    };

    this.clearFixtures = function () {
        this.fixtures = {};
    };

    this.verify = function (board) {
        this.clearFixtures();
        return this.next(board, 0);
    };

    this.simplifyFixtures = function (fixtures) {
        var t = {}, i;

        for (i in fixtures) {
            if (fixtures.hasOwnProperty(i)) {
                t[i] = fixtures[i].name;
            }
        }

        return t;
    };

    this.next = function (board, i) {
        var poss, constr, j, t;

        if (i >= this.constraints.length) {
            this.log('got a leaf!');
            return true;
        }

        constr = this.constraints[i];

        console.log('now collecting', constr.toJSON(), 'fixtures are', this.simplifyFixtures(this.fixtures));
        poss = constr.choose(board, this.fixtures);

        for (t = 0; t < poss.length; t++) {
            console.log('poss ', t, this.simplifyFixtures(poss[t]));
        }

        if (poss.length === 0) {
            console.log('i got 0 possibilities');

            if (constr.verify(board, this.fixtures)) {
                this.log('poss 0, verified, go next');
                return this.next(board, i + 1);
            } else {
                this.log('poss 0, not verified');
                return false;
            }
        } else {
            this.log('Constraint ' + constr.toJSON() + ' generated ' + poss.length + ' possibilities!');
            for (j = 0; j < poss.length; j++) {
                this.log('fixating', this.simplifyFixtures(this.fixtures));
                this.fixate(poss[j]);
                if (this.next(board, i + 1)) {
                    return true;
                } else {
                    this.removeFixtures(poss[j]);
                }
            }

            return false;
        }
    };

    this.updateConstraints();
};

Assessor.Constraint = function (value) {
    this.type = 'generic';

    this.value = value;

    this.flatCopy = function (o) {
        var r = {}, i;

        for (i in o) {
            r[i] = o[i];
        }

        return r;
    };

    this.elements = function () {
        return [];
    };

    this.choose = function (board, fixtures) {
        return [];
    };

    this.verify = function (board, fixtures) {
        return value;
    };

    this.toJSON = function () {
        return '{"type": "generic",' +
                '"class": "Constraint",' +
                '"parameters": [' + this.value + ']' +
            '}';
    };
};

// Verify the number of elements
Assessor.NumberElements = function (what, number) {
    this.constructor();

    var collect = function (board, constraints) {
            var number = 0, e, el, i;

            for (e in board.objects) {
                if (board.objects.hasOwnProperty(e)) {
                    el = board.objects[e];

                    for (i in constraints) {
                        if (constraints.hasOwnProperty(i) && el[i] === constraints[i] && el.visProp && !el.visProp.priv) {
                            number++;
                        }
                    }
                }
            }

            return number;
        };


    this.type = '#elements';

    this.what = what;
    this.number = number;

    this.verify = function (board, fixtures) {
        var number;

        switch (this.what) {
            case 'point':
                number = collect(board, {
                        elementClass: JXG.OBJECT_CLASS_POINT
                    });
                break;
            case 'line':
                number = collect(board, {
                        elementClass: JXG.OBJECT_CLASS_LINE
                    });
                break;
            case 'circle':
                number = collect(board, {
                        elementClass: JXG.OBJECT_CLASS_CIRCLE
                    });
                break;
            case 'angle':
                number = collect(board, {
                        type: JXG.OBJECT_TYPE_ANGLE
                    });
                break;
            default:
                number = 0;
        }

        return number === this.number;
    };

    this.toJSON = function () {
        return '{' +
                '"type": "#elements",' +
                '"what": "' + this.what + '",' +
                '"number": ' + this.number + ', ' +
                '"class": "NumberElements",' +
                '"parameters": ["' + this.what + '", ' + this.number + ']' +
            '}';
    };
};
Assessor.NumberElements.prototype = new Assessor.Constraint;

// Verify collinearity of a set of points
Assessor.Collinear = function (weak) {
    this.constructor();

    this.type = 'collinear';

    this.points = Array.prototype.slice.call(arguments, 1);

    this.weak = weak;

    this.elements = function () {
        return this.points;
    };

    this.choose = function (board, fixtures) {
        var i, j, k, fix, new_fixtures = [];

        // rearrange the points, put the fixed ones at the end
        for (i = this.points.length - 1; i >= 0; i--) {
            if (fixtures[this.points[i]]) {
                this.points.push.apply(this.points, this.points.splice(i, 1));
            }
        }

        // find all valid combinations depending on previous fixtures

        // all points fixed -> nothing to do
        if (fixtures[this.points[0]]) {
            return [];
        } else {
            for (i = 0; i < board.objectsList.length; i++) {
                if (!JXG.isPoint(board.objectsList[i])) {
                    continue;
                }

                if (fixtures[this.points[1]]) {
                    fix = this.flatCopy(fixtures);
                    fix[this.points[0]] = board.objectsList[i];

                    if (this.verify(board, fix)) {
                        new_fixtures.push(fix);
                    }
                } else {
                    for (j = i + 1; j < board.objectsList.length; j++) {
                        if (!JXG.isPoint(board.objectsList[j])) {
                            continue;
                        }

                        if (fixtures[this.points[2]]) {
                            fix = this.flatCopy(fixtures);
                            fix[this.points[0]] = board.objectsList[i];
                            fix[this.points[1]] = board.objectsList[j];

                            if (this.verify(board, fix)) {
                                new_fixtures.push(fix);
                            }
                        } else {
                            for (k = j + 1; k < board.objectsList.length; k++) {
                                if (!JXG.isPoint(board.objectsList[k])) {
                                    continue;
                                }

                                fix = this.flatCopy(fixtures);
                                fix[this.points[0]] = board.objectsList[i];
                                fix[this.points[1]] = board.objectsList[j];
                                fix[this.points[2]] = board.objectsList[k];

                                if (this.verify(board, fix)) {
                                    new_fixtures.push(fix);
                                }
                            }
                        }
                    }
                }
            }
        }

        return new_fixtures;
    };

    this.verify = function (board, fixtures) {
        var A, B, C, res, proj, line;

        if (this.points.length < 3) {
            return false;
        }

        A = fixtures[this.points[0]];
        B = fixtures[this.points[1]];
        C = fixtures[this.points[2]];

        res = A && B && C;

        if (!this.weak && res && (C.id === A.id || C.id === B.id || A.id === B.id)) {
            res = false;
        }

        if (res) {
            line = JXG.Math.crossProduct(A.coords.usrCoords, B.coords.usrCoords);
            proj = JXG.Math.Geometry.projectPointToLine(C, {stdform: line});

            res =  JXG.Math.Geometry.distance(proj.usrCoords.slice(1), C.coords.usrCoords.slice(1))/A.Dist(B) < 0.07;

            if (res) {
                console.log('collinear: ', A.name, B.name, C.name);
            }
        }

        return res;
    };

    this.toJSON = function () {
        return '{' +
                '"type": "collinear",' +
                '"points": ["' + this.points.join('", "') + '"],' +
                '"class": "Collinear",' +
                '"parameters": [' + this.weak + ', "' + this.points.join('", "') + '"]' +
            '}';
    };
};
Assessor.Collinear.prototype = new Assessor.Constraint;

// Verify the value of an angle between three given points ABC.
// The angle will be measure counter clockwise:
//
//         + C
//        /
//       /-+ <- this angle
//      /   \
//     +-------------------+
//     B                   A
//
Assessor.Angle = function (value) {
    this.constructor();

    this.type = 'angle';

    this.points = Array.prototype.slice.call(arguments, 1);
    this.value = value;

    this.elements = function () {
        return this.points;
    };

    this.choose = function (board, fixtures) {
        var i, a, fix, new_fixtures = [];

        // find all valid combinations depending on previous fixtures
        for (i = 0; i < board.objectsList.length; i++) {
            a = board.objectsList[i];

            // check type
            if (a.type === JXG.OBJECT_TYPE_ANGLE) {
                console.log('checking out angle', a.name, 'with value', a.Value()*180/Math.PI);

                fix = this.flatCopy(fixtures);

                // check if the dependencies and the fixtures work out
                fix[this.points[0]] = fix[this.points[0]] || JXG.getRef(a.board, a.parents[0]);
                if (fix[this.points[0]].id !== a.parents[0]) {
                    console.log('point 1 is wrong');
                    // nah, point1 is already set but doesn't match with what it is set to
                    // -> NEXT
                    continue;
                }

                fix[this.points[1]] = fix[this.points[1]] || JXG.getRef(a.board, a.parents[1]);
                if (fix[this.points[1]].id !== a.parents[1]) {
                    console.log('point 2 is wrong');
                    // nah, point1 is already set but doesn't match with what it is set to
                    // -> NEXT
                    continue;
                }

                fix[this.points[2]] = fix[this.points[2]] || JXG.getRef(a.board, a.parents[2]);
                if (fix[this.points[2]].id !== a.parents[2]) {
                    console.log('point 3 is wrong');
                    // nah, point1 is already set but doesn't match with what it is set to
                    // -> NEXT
                    continue;
                }
console.log('fixtures are all set', fix, this.verify(board, fix));
                if (this.verify(board, fix)) {
                    new_fixtures.push(fix);
                }
            }
        }

        return new_fixtures;
    };

    this.verify = function (board, fixtures) {
        var A, B, C, res;

        if (this.points.length < 3) {
            return false;
        }

        A = fixtures[this.points[0]];
        B = fixtures[this.points[1]];
        C = fixtures[this.points[2]];

        //A && B && C && console.log('checking &lt;' + A.name + B.name + C.name + ' = ' + JXG.Math.Geometry.trueAngle(A, B, C));
        res = A && B && C && A.id !== B.id && A.id !== C.id && B.id !== C.id && Math.abs(JXG.Math.Geometry.trueAngle(A, B, C) - this.value) <= 5;

        if (res) {
            console.log('verified angle &lt;' + A.name + B.name + C.name + ' = ' + JXG.Math.Geometry.trueAngle(A, B, C) + ' / ' + this.value);
        }

        return res;
    };

    this.toJSON = function () {
        return '{' +
                '"type": "angle",' +
                '"points": ["' + this.points.join('", "') + '"],' +
                '"value": ' + this.value + ', ' +
                '"class": "Angle",' +
                '"parameters": [' + this.value + ', "' + this.points.join('", "') + '"]' +
            '}';
    };
};
Assessor.Angle.prototype = new Assessor.Constraint;