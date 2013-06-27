/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012 - 2013
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/*jslint nomen: true, plusplus: true*/
/*global define: true*/


define([], function () {

    "use strict";

    var type = {
        isArray: function (v) {
            var r;

            if (Array.isArray) {
                r = Array.isArray(v);
            } else {
                r = (v !== null && typeof v === "object" && typeof v.splice === 'function' && typeof v.join === 'function');
            }

            return r;
        }
    };

    return type;
});
