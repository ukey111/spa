/*
 * spa.chat.js
 * SPAのチャット機能モジュール
 */

/* jslint      browser : true, continue : true,
devel  : true, indent  : 2,    maxerr   : 50,
newcap : true, nomen   : true, plusplus : true,
regexp : true, sloppy  : true, vars     : false,
white  : true
*/

/*global $, spa */

spa.chat = (function () {
    //--- module scope var start ---
    var
        configMap = {
            main_html : String()
                + '<div style="padding:1em; color:#fff;">'
                    + 'Say hello to chat'
                + '</div>',
            settable_map : {}
        },
        stateMap = { $container : null },
        jqueryMap = {},

        setJqueryMap, configModule, initModule
        ;
    //--- module scope var end ---

    //--- utility method start
    //--- utility method end

    //--- DOM method start
    // DOM method/setJqueryMap/start
    setJqueryMap = function () {
        var $container = stateMap.$container;
        jqueryMap = { $container : $container };
    };
    // DOM method/setJqueryMap/end
    // --- DOM method end

    // --- event handler start
    // --- event handler end

    // --- public method start
    // publicmethod/configModule/start
    configModule = function ( input_map ) {
        spa.util.setConfigMap({
            input_map : input_map,
            settable_map : configMap.settable_map,
            config_map : configMap
        });
        return true;
    };
    // publicmethod/configModule/end

    // publicmethod/initModule/start
    initModule = function ( $container ) {
        $container.html( configMap.main_html );
        stateMap.$container = $container;
        setJqueryMap();
        return true;
    };
    // publicmethod/initMOdule/end

    // return publicmethod
    return {
        configModule : configModule,
        initModule : initModule
    };
    // --- public method end

}());