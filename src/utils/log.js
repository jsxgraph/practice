/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012 -2013
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/*jslint nomen: true, plusplus: true*/
/*global define: true, require: true, JXG: true*/


define(['config'], function (CONF) {

    "use strict";

    var log = [],
        Log = {
            log: function () {
                if (CONF.log) {
                    log.push(arguments);
                }
            },
            clear: function () {
                log.length = 0;
            },
            length: function () {
                return log.length;
            },
            dump: function (where) {
                var i, j, node,
                    l = log.length;

                if (where && typeof document === 'object' && document.getElementById) {
                    node = document.getElementById(where);

                    if (node) {
                        for (i = 0; i < l; i++) {
                            for (j = 0; j < log[i].length; j++) {
                                where.innerHTML += log[i][j].toString();
                            }
                            where.innerHTML += '<br />';
                        }

                    }
                }

                if (typeof console === 'object' && console.log) {
                    for (i = 0; i < l; i++) {
                        console.log.apply(console, log[i]);
                    }
                }
            }
        };
window.log = log;
    return Log;
});
