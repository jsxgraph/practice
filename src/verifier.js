
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
                    for (j = i + 1; j < elements.points.length; j++) {
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
                            for (k = j + 1; k < elements.points.length; k++) {
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
    this.value = value;
    this.min = min;
    this.max = max;
};
Assessor.Between.prototype = new Assessor.Verifier;

JXG.extend(Assessor.Between.prototype, {
    choose: function (elements, fixtures) {
        var poss = this.value.choose(elements, fixtures),
            i, new_fixtures = [];

        for (i = 0; i < poss.length; i++) {
            if (this.verify(elements, poss[i])) {
                new_fixtures.push(poss[i]);
            }
        }

        return new_fixtures;
    },

    verify: function (elements, fixtures) {
        var v = this.value.evaluate(elements, fixtures);
        return this.min <= v && v <= this.max;
    },

    toJSON: function () {
        this.parameters = '[' + this.value.toJSON() + ', ' + this.min + ', ' + this.max + ']';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});