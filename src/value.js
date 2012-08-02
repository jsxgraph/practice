
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


Assessor.Number = function (value) {
    this.class = 'Number';
    this.value = value;
};
Assessor.Number.prototype = new Assessor.Value;

JXG.extend(Assessor.Number.prototype, {
    evaluate: function (elements, fixtures) {
        return this.value;
    },

    toJSON: function () {
        return this.value.toString();
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


Assessor.MAngle = function (a) {
    this.class = 'MAngle';
    this.angle = a;

};
Assessor.MAngle.prototype = new Assessor.Value;

JXG.extend(Assessor.MAngle.prototype, {
    evaluate: function (elements, fixtures) {
        var A, B, C, res, a = fixtures[this.angle];

        if(!a) {
            return false;
        }

        A = JXG.getRef(a.board, a.parents[0]);
        B = JXG.getRef(a.board, a.parents[1]);
        C = JXG.getRef(a.board, a.parents[2]);

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
        var new_fixtures = [], fix, i;

        if (!fixtures[this.angle]) {
            for (i = 0; i < elements.angles; i++) {
                fix = this.flatCopy(fixtures);
                fix[this.angle] = elements.angles[i];
            }
        }

        return new_fixtures;
    },

    toJSON: function () {
        this.parameters = '["' + this.angle + '"]';
        return Assessor.Base.prototype.toJSON.call(this);
    }
});


Assessor.Angle3P = function (A, B, C) {
    this.class = 'Angle3P';
    this.points = [A, B, C];
};
Assessor.Angle3P.prototype = new Assessor.Value;

JXG.extend(Assessor.Angle3P.prototype, {
    evaluate: function (elements, fixtures) {
        var A, B, C, res;

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


Assessor.Distance = function (A, B) {
    this.class = 'Distance';
    this.points = [A, B];
};
Assessor.Distance.prototype = new Assessor.Value;

JXG.extend(Assessor.Distance.prototype, {
    evaluate: function (elements, fixtures) {
        var A, B, res;

        if (this.points.length !== 2) {
            return NaN;
        }

        A = fixtures[this.points[0]];
        B = fixtures[this.points[1]];

        res = A && B && A.id !== B.id;

        if (res) {
            res = A.Dist(B);

            this.log('|' + A.name + B.name + '| = ' + res);
        } else {
            res = NaN;
        }

        return res;
    },

    choose: function (elements, fixtures) {
        var i, j, fix, new_fixtures = [];

        for (i = 0; i < elements.points.length; i++) {
            for (j = i + 1; j < elements.points.length; j++) {
                fix = this.flatCopy(fixtures);
                if (!fix[this.points[0]]) {
                    fix[this.points[0]] = elements.points[i];
                }

                if (!fix[this.points[1]]) {
                    fix[this.points[1]] = elements.points[j];
                }

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


Assessor.XY = function (A, what) {
    this.class = 'XY';
    this.point = A;
    this.what = what.toLowerCase() === 'y' ? 'Y' : 'X';
};
Assessor.XY.prototype = new Assessor.Value;

JXG.extend(Assessor.XY.prototype, {
    evaluate: function (elements, fixtures) {
        return fixtures[this.point] ? fixtures[this.point][this.what]() : NaN;
    },

    choose: function (elements, fixtures) {
        var new_fixtures = [], fix, i;

        if (!fixtures[this.point]) {
            for (i = 0; i < elements.points.length; i++) {
                fix = this.flatCopy(fixtures);
                fix[this.point] = elements.points[i];
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

Assessor.SlopeY = function (l, what) {
    this.class = 'SlopeY';
    this.line = l;
    this.what = what.toLowerCase() === 'slope' ? 'getSlope' : 'getRise';
};
Assessor.SlopeY.prototype = new Assessor.Value;

JXG.extend(Assessor.SlopeY.prototype, {
    evaluate: function (elements, fixtures) {
        return fixtures[this.line] ? fixtures[this.line][this.what]() : NaN;
    },

    choose: function (elements, fixtures) {
        var new_fixtures = [], fix, i;

        if (!fixtures[this.line]) {
            for (i = 0; i < elements.lines.length; i++) {
                fix = this.flatCopy(fixtures);
                fix[this.line] = elements.lines[i];
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