/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012 - 2013
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/*jslint nomen: true, plusplus: true*/
/*global define: true, require: true, JXG: true*/


define(['utils/type'], function (Type) {

    "use strict";

    /**
     * Compiles a list of elements from the given source..
     * @param {JXG.Board|Array} source
     * @constructor
     */
    var ElementList = function ElementList(source) {
        var i, el;

        /**
         * Holds all elements.
         * @type {Array}
         */
        this.elements = [];

        this.points = [];

        this.lines = [];

        this.angles = [];

        this.polygons = [];


        if (Type.isArray(source)) {
            this.elements = source;
        } else if (require.defined('jsxgraph')) {
            for (i = 0; i < source.objectsList.length; i++) {
                el = source.objectsList[i];

                if (el.elementClass === JXG.OBJECT_CLASS_POINT) {
                    this.points.push(el);
                }

                if (el.elementClass === JXG.OBJECT_CLASS_LINE) {
                    this.lines.push(el);
                }

                if (el.type === JXG.OBJECT_TYPE_ANGLE) {
                    this.angles.push(el);
                }

                if (el.type === JXG.OBJECT_TYPE_POLYGON) {
                    this.polygons.push(el);
                }

                this.elements.push(el);
            }
        }
    };

    return ElementList;
});
