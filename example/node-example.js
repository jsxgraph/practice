var JXG = require('./jsxgraphcore.js'),
    Assessor = require('../bin/practice.js')(JXG);

var board = JXG.JSXGraph.initBoard(null, {boundingbox: [-10, 10, 10, -10]}),
    answerAcute = 'A = point(0, 0); B = point(2, 0); C = point(2, 3); angle(C, B, A);',
    assessment = new Assessor.Assessment(
        new Assessor.Verifier.Equals(
            new Assessor.Value.NumberElements('angles'), 1
        ),
        new Assessor.Verifier.Equals(
            new Assessor.Value.NumberElements('points'), 3
        ),
        new Assessor.Verifier.Angle('alpha', 'A', 'B', 'C'),
        new Assessor.Verifier.Between(
            new Assessor.Value.Angle('alpha'), 0, 90
        )
    );


board.jc.parse(answerAcute);

console.log(process.memoryUsage());

var i, runs = 1, result,
    start = new Date().getTime();

for (i = 0; i < runs; i++) {
    result = assessment.verify(board);
}
console.log(new Date().getTime() - start);
console.log(process.memoryUsage());

if (result) {
    console.log('Answer is correct.');
} else {
    console.log('Answer is wrong.');
}
