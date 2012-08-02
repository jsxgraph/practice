
Assessor.Collinear = function (A, B, C) {
    this.class = "Collinear";
    this.points = [A, B, C];
};
Assessor.Collinear.prototype = new Assessor.Verifier;

JXG.extend(Assessor.Collinear.prototype, {
    choose: function (elements, fixtures) {
        var i, j, k, fix, new_fixtures = [];

        // rearrange the points, put the fixed ones at the end
        for (i = this.points.length - 1; i >= 0; i--) {
            if (fixtures[this.points[i]]) {
                this.points.push.apply(this.points, this.points.splice(i, 1));
            }
        }
        this.log('number of points', elements.points.length);
        // find all valid combinations depending on previous fixtures

        // all points fixed -> nothing to do
        if (fixtures[this.points[0]]) {
            this.log('point1 fixed');
            return [];
        } else {
            this.log('point 1 not fixed yet');
            for (i = 0; i < elements.points.length; i++) {
                if (fixtures[this.points[1]]) {
                    this.log('point2 fixed');
                    fix = this.flatCopy(fixtures);
                    fix[this.points[0]] = elements.points[i];

                    if (this.verify(elements, fix)) {
                        new_fixtures.push(fix);
                    }
                } else {
                    this.log('point 2 not fixed yet');
                    for (j = 0; j < elements.points.length; j++) {
                        if (fixtures[this.points[2]]) {
                            this.log('point3 fixed');
                            fix = this.flatCopy(fixtures);
                            fix[this.points[0]] = elements.points[i];
                            fix[this.points[1]] = elements.points[j];

                            if (this.verify(elements, fix)) {
                                new_fixtures.push(fix);
                            }
                        } else {
                            this.log('point 3 not fixed');
                            for (k = 0; k < elements.points.length; k++) {
                                fix = this.flatCopy(fixtures);
                                fix[this.points[0]] = elements.points[i];
                                fix[this.points[1]] = elements.points[j];
                                fix[this.points[2]] = elements.points[k];

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

        this.log('collinear verifiy called');
        if (this.points.length < 3) {
            return false;
        }

        A = fixtures[this.points[0]];
        B = fixtures[this.points[1]];
        C = fixtures[this.points[2]];

        res = A && B && C;

        if (res && (C.id === A.id || C.id === B.id || A.id === B.id)) {
            res = false;
        }

        if (res) {
            this.log('lets test', A.name, B.name, C.name, ' for collinearity...');
            line = JXG.Math.crossProduct(A.coords.usrCoords, B.coords.usrCoords);
            proj = JXG.Math.Geometry.projectPointToLine(C, {stdform: line});

            res =  JXG.Math.Geometry.distance(proj.usrCoords.slice(1), C.coords.usrCoords.slice(1))/A.Dist(B) < 0.07;

            if (res) {
                this.log('collinear: ', A.name, B.name, C.name);
            }
        }

        return res;
    },

    toJSON: function () {
        this.parameters = '["' + this.points.join('", "') + '"]';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});

Assessor.Between = function (value, min, max) {
    this.class = 'Between';
    this.value = this.expandNumber(value);
    this.min = this.expandNumber(min);
    this.max = this.expandNumber(max);
};
Assessor.Between.prototype = new Assessor.Verifier;

JXG.extend(Assessor.Between.prototype, {
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


Assessor.Equals = function (lhs, rhs, eps) {
    this.class = 'Equals';
    this.lhs = this.expandNumber(lhs);
    this.rhs = this.expandNumber(rhs);

    this.eps = eps || 1e-5;
};
Assessor.Equals.prototype = new Assessor.Verifier;

JXG.extend(Assessor.Equals.prototype, {
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

    verify: function (elements, fixtures) {
        var lhs = this.lhs.evaluate(elements, fixtures),
            rhs = this.rhs.evaluate(elements, fixtures);

        return Math.abs(lhs - rhs) <= this.eps;
    },

    toJSON: function () {
        this.parameters = '[' + this.lhs.toJSON() + ', ' + this.rhs.toJSON() + ']';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});


Assessor.Line = function (l, A, B) {
    this.class = 'Line';
    this.line = l;
    this.points = [A, B];
};
Assessor.Line.prototype = new Assessor.Verifier;

JXG.extend(Assessor.Line.prototype, {
    choose: function (elements, fixtures) {
        var new_fixtures = [], fix, i, j, push = false;

        for (i = 0; i < elements.lines.length; i++) {
            fix = this.flatCopy(fixtures);

            if (!fix[this.line]) {
                fix[this.line] = elements.lines[i];
            }

            for (j = 0; j < 2; j++) {
                if (!fix[this.points[j]]) {
                    fix[this.points[j]] = elements.lines[i]['point' + (j+1)];
                }
            }

            if (this.verify(elements, fix)) {
                new_fixtures.push(fix);
            }
        }

        return new_fixtures;
    },

    verify: function (elements, fixtures) {
        return fixtures[this.line]
            && JXG.indexOf(elements.points, fixtures[this.line].point1) > -1 && JXG.indexOf(elements.points, fixtures[this.line].point2) > -1
            && ((fixtures[this.line].point1 === fixtures[this.points[0]] && fixtures[this.line].point2 === fixtures[this.points[1]])
            || (fixtures[this.line].point1 === fixtures[this.points[1]] && fixtures[this.line].point2 === fixtures[this.points[0]]));
    },

    toJSON: function () {
        this.parameters = '["' + this.line + '", "' + this.points.join('", "') + '"]';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});


Assessor.Angle = function (name, A, B, C) {
    this.class = 'Angle';
    this.name = name;
    this.points = [A, B, C];
};
Assessor.Angle.prototype = new Assessor.Verifier;

JXG.extend(Assessor.Angle.prototype, {
    choose: function (elements, fixtures) {
        var i, a, fix, new_fixtures = [];

        // find all valid combinations depending on previous fixtures
        for (i = 0; i < elements.angles.length; i++) {
            a = elements.angles[i];

            this.log('checking out angle', a.name, 'with value', a.Value()*180/Math.PI);

            fix = this.flatCopy(fixtures);

            fix[this.name] = fix[this.name] || a;
            fix[this.points[0]] = fix[this.points[0]] || JXG.getRef(a.board, a.parents[0]);
            fix[this.points[1]] = fix[this.points[1]] || JXG.getRef(a.board, a.parents[1]);
            fix[this.points[2]] = fix[this.points[2]] || JXG.getRef(a.board, a.parents[2]);

            if (this.verify(elements, fix)) {
                new_fixtures.push(fix);
            }
        }

        return new_fixtures;
    },

    verify: function (elements, fixtures) {
        var a = fixtures[this.name];

        if (!a) {
            return false;
        }
        // check if the dependencies and the fixtures work out
        fixtures[this.points[0]] = fixtures[this.points[0]] || JXG.getRef(a.board, a.parents[0]);
        if (fixtures[this.points[0]].id !== a.parents[0]) {
            this.log('point 1 is wrong');
            // nah, point1 is already set but doesn't match with what it is set to
            return false;
        }

        fixtures[this.points[1]] = fixtures[this.points[1]] || JXG.getRef(a.board, a.parents[1]);
        if (fixtures[this.points[1]].id !== a.parents[1]) {
            this.log('point 2 is wrong');
            // nah, point1 is already set but doesn't match with what it is set to
            return false;
        }

        fixtures[this.points[2]] = fixtures[this.points[2]] || JXG.getRef(a.board, a.parents[2]);
        if (fixtures[this.points[2]].id !== a.parents[2]) {
            this.log('point 3 is wrong');
            // nah, point1 is already set but doesn't match with what it is set to
            return false;
        }

        return true;
    },

    toJSON: function () {
        this.parameters = '["' + this.name + '", "' + this.points.join('", "') + '"]';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});
