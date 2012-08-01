
Assessor.Value = function () {
    this.class = 'Value';
    this.parameters = '[]';
};
Assessor.Value.prototype = new Assessor.Base;

JXG.extend(Assessor.Value.prototype, {
    evaluate: function (elements, fixtures) {
        return NaN;
    },

    choose: function (elements, fixtures) {
        return [];
    }
});


Assessor.NumberElements = function (what) {
    this.class = 'NumberElements';
    this.what = what;
};
Assessor.NumberElements.prototype = new Assessor.Verifier;

JXG.extend(Assessor.NumberElements.prototype, {
    evaluate: function (elements, fixtures) {
        return elements[this.what].length;
    },

    toJSON: function () {
        this.parameters = '["' + this.what + '"]';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});


Assessor.Angle = function (name, A, B, C) {
    this.name = name;
    this.points = [A, B, C];
};
Assessor.Angle.prototype = new Assessor.Value;

JXG.extend(Assessor.Angle.prototype, {
    evaluate: function (elements, fixtures) {
        var A, B, C, res;

        if (this.points.length < 3) {
            return NaN;
        }

        A = fixtures[this.points[0]];
        B = fixtures[this.points[1]];
        C = fixtures[this.points[2]];

        res = A && B && C && A.id !== B.id && A.id !== C.id && B.id !== C.id;

        if (res) {
            res = JXG.Math.Geometry.trueAngle(A, B, C);

            this.log('angle &lt;' + A.name + B.name + C.name + ' = ' + res);
        } else {
            res = NaN;
        }

        return res;
    },

    choose: function (elements, fixtures) {
        var i, a, fix, new_fixtures = [];

        // find all valid combinations depending on previous fixtures
        for (i = 0; i < elements.angles.length; i++) {
            a = elements.angles[i];

            this.log('checking out angle', a.name, 'with value', a.Value()*180/Math.PI);

            fix = this.flatCopy(fixtures);

            // check if the dependencies and the fixtures work out
            fix[this.points[0]] = fix[this.points[0]] || JXG.getRef(a.board, a.parents[0]);
            if (fix[this.points[0]].id !== a.parents[0]) {
                this.log('point 1 is wrong');
                // nah, point1 is already set but doesn't match with what it is set to
                // -> NEXT
                continue;
            }

            fix[this.points[1]] = fix[this.points[1]] || JXG.getRef(a.board, a.parents[1]);
            if (fix[this.points[1]].id !== a.parents[1]) {
                this.log('point 2 is wrong');
                // nah, point1 is already set but doesn't match with what it is set to
                // -> NEXT
                continue;
            }

            fix[this.points[2]] = fix[this.points[2]] || JXG.getRef(a.board, a.parents[2]);
            if (fix[this.points[2]].id !== a.parents[2]) {
                this.log('point 3 is wrong');
                // nah, point1 is already set but doesn't match with what it is set to
                // -> NEXT
                continue;
            }

            new_fixtures.push(fix);
        }

        return new_fixtures;
    },

    toJSON: function () {
        this.parameters = '["' + this.name + '", "' + this.points.join('", "') + '"]';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});


Assessor.Angle3P = function (A, B, C) {
    this.class = "Angle3P";
    this.points = [A, B, C];
};
Assessor.Angle3P.prototype = new Assessor.Angle;

JXG.extend(Assessor.Angle3P.prototype, {
    choose: function (elements, fixtures) {
        var i, j, k, fix, new_fixtures = [];

        for (i = 0; i < elements.points.length; i++) {
            for (j = 0; j < elements.points.length; j++) {
                for (k = 0; k < elements.points.length; k++) {
                    fix = this.flatCopy(fixtures);
                    if (!fix[this.points[0]]) {
                        fix[this.points[0]] = elements.points[i];
                    }

                    if (!fix[this.points[1]]) {
                        fix[this.points[1]] = elements.points[j];
                    }

                    if (!fix[this.points[2]]) {
                        fix[this.points[2]] = elements.points[k];
                    }

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