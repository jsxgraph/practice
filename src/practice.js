/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/*jslint nomen:true, plusplus:true, evil:true*/
/*global Assessor: true, document: true*/

(function () {

    "use strict";

    var i, s, n,
        files = ['assessor', 'utils', 'verifier/compare', 'verifier/geometric', 'verifier/logic', 'verifier/element', 'value'],
        requirePath = '',
        require = function (libraryName) {
            document.write('<script type="text/javascript" src="' + libraryName + '"><\/script>');
        };

    if (typeof document === 'object' && typeof Assessor === 'undefined') {
        for (i = 0; i < document.getElementsByTagName("script").length; i++) {
            s = document.getElementsByTagName("script")[i];
            if (s.src && s.src.match(/practice\.js(\?.*)?$/)) {
                requirePath = s.src.replace(/practice\.js(\?.*)?$/, '');
                for (n = 0; n < files.length; n++) {
                    (function (include) {
                        require(requirePath + include + '.js');
                    }(files[n]));
                }
            }
        }
    }

    if (typeof Assessor === 'object' && typeof module === 'object') {
        module.exports = function (JXG) {
            Assessor.JXG = JXG;
            return Assessor;
        };
    }
}());
