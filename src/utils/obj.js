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

    var obj = {
        extend: function (obj, ext) {
            var i;

            for (i in ext) {
                if (ext.hasOwnProperty(i)) {
                    obj[i] = ext[i];
                }
            }
        },

        inherit: function (base, sub, ext) {
            function SurrogateCtor() {}

            SurrogateCtor.prototype = base.prototype;
            sub.prototype = new SurrogateCtor();
            sub.prototype.constructor = sub;

            // Add a reference to the parent's prototype
            sub.base = base.prototype;

            // Copy the methods passed in to the prototype
            this.extend(sub.prototype, ext);

            return sub;
        }
    };

    return obj;
});
