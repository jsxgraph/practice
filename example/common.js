/*
    practice - JSXGraph practice and assessment framework

    Copyright 2012
        Michael Gerhäuser

    Licensed under the LGPL v3
*/

/**
 * @fileoverview Helper functions for the practice examples in the example folder
 */


JXG.extend(Assessor, {
    initsketch: function () {
        if (typeof GUI !== 'undefined') {
            GUI.generator = JXG.deepCopy(GUI.generator, {
                toFixed: 2,
                freeLine: true,
                useGlider: true,
                useSymbols: false
            });

            if (JXG.isAndroid() || JXG.isApple()) {
                GUI.down_event = 'touchstart';
                GUI.up_event = 'touchend';
                GUI.move_event = 'touchmove';
                GUI.out_event = 'touchleave';
                GUI.over_event = 'touchenter';
                GUI.click_event = 'tap';

                GUI.device = 'tablet';
            } else {
                GUI.down_event = 'mousedown';
                GUI.up_event = 'mouseup';
                GUI.move_event = 'mousemove';
                GUI.out_event = 'mouseout';
                GUI.over_event = 'mouseover';
                GUI.click_event = 'click';

                GUI.device = 'pc';
            }

            GUI.finderEnabled = false;
            GUI.constModeSwitch = false;
            GUI.saveConstruction = function () {};
            GUI.contextMenu = function () {
                return false;
            };

            GUI.stepCallback = function (code) { };

            GUI.id = function () {
                return 'e' + (GUI.id_cnt++);
            };
        }
    },

    init: function () {
        this.initsketch();

        GUI.board = JXG.JSXGraph.initBoard('jxgbox', {boundingbox:[-8,8,8,-8], axis:false});
        GUI.removeBoardHandlers();
        GUI.switchMode('CD', false);
        GUI.removeNavigationHandlers();
    },

    log: function (i) {
        var log = document.getElementById('debug');

        log.innerHTML += i.toString() + '<br />';
    },

    isElement: function (e) {
        return e && e.name && e.id && e.methodMap && e.setProperty;
    },

    debug: function () {
        var i;

        for (i = 0; i < arguments.length; i++) {
            document.getElementById('debug').innerHTML += arguments[i] + (i === arguments.length - 1 ? '' : ', ');
        }
        document.getElementById('debug').innerHTML += '<br />';
    },

    clear: function () {
        document.getElementById('debug').innerHTML = '';
    }

});
