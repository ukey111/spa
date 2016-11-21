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

/*global $, spa, getComputedStyle */

spa.chat = (function () {
    //--- module scope var start ---
    var
        configMap = {
            main_html : String()
                + '<div class="spa-chat">'
                    + '<div class="spa-chat-head">'
                        + '<div class="spa-chat-head-toggle">+</div>'
                        + '<div class="spa-chat-head-title">'
                            + 'chat'
                        + '</div>'
                    + '</div>'
                    + '<div class="spa-chat-closer">x</div>'
                    + '<div class="spa-chat-sizer">'
                        + '<div class="spa-chat-msgs"></div>'
                        + '<div class="spa-chat-box">'
                            + '<input type="text">'
                            + '<div>send</div>'
                        + '</div>'
                    + '</div>'
                + '</div>',
                /*
                + '<div style="padding:1em; color:#fff;">'
                    + 'Say hello to chat'
                + '</div>',
                */
            settable_map : {
                slider_open_time   : true,
                slider_close_time  : true,
                slider_opened_em   : true,
                slider_closed_em   : true,
                slider_opened_title: true,
                slider_closed_title: true,

                chat_model     : true,
                people_model   : true,
                set_chat_anchor: true
            },

            slider_open_time   : 250,
            slider_close_time  : 250,
            slider_opened_em   : 16,
            slider_closed_em   : 2,
            slider_opened_title: 'Click to close',
            slider_closed_title: 'Click to open',

            chat_model     : null,
            people_model   : null,
            set_chat_anchor: null,
        },
        stateMap = { 
            /*$container : null*/
            $append_target  : null,
            position_type   : 'closed',
            px_per_em       : 0,
            slider_hidden_px: 0,
            slider_closed_px: 0,
            slider_opened_px: 0
        },
        jqueryMap = {},

        setJqueryMap, getEmSize, setPxSizes, setSliderPosition,
        onClickToggle, configModule, initModule
        ;
    //--- module scope var end ---

    //--- utility method start
    getEmSize = function ( elem ) {
        return Number(
            getComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d*/)[0]
        );
    };
    //--- utility method end

    //--- DOM method start
    // DOM method/setJqueryMap/start
    setJqueryMap = function () {
        /*
        var $container = stateMap.$container;
        jqueryMap = { $container : $container };
        */
        var
            $append_target = stateMap.$append_target,
            $slider = $append_target.find( '.spa-chat' );

        jqueryMap = {
            $slider: $slider,
            $head  : $slider.find( '.spa-chat-head' ),
            $toggle: $slider.find( '.spa-chat-head-toggle' ),
            $title : $slider.find( '.spa-chat-head-title' ),
            $sizer : $slider.find( '.spa-chat-sizer' ),
            $msgs  : $slider.find( '.spa-chat-msgs' ),
            $box   : $slider.find( '.spa-chat-box' ),
            $input : $slider.find( '.spa-chat-input input[type=text]')
        };
    };
    // DOM method/setJqueryMap/end

    // DOM method/setPxSizes/start
    setPxSizes = function () {
        var px_per_em, opened_height_em;
        px_per_em = getEmSize( jqueryMap.$slider.get(0) );

        opened_height_em = configMap.slider_open_em;

        stateMap.px_per_em = px_per_em;
        stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
        stateMap.slider_opened_px = opened_height_em * px_per_em;
        jqueryMap.$sizer.css({
            height : ( opened_height_em - 2 ) * px_per_em
        });
    };
    // DOM method/setPxSizes/end

    // publicmethod/setSliderPosition/starts
    setSliderPosition = function ( position_type, callback ) {
        var
            height_px, animate_time, slider_title, toggle_text;

        // スライダーが既に要求された位置にある場合はtrueを返す
        if ( stateMap.position_type === position_type ){
            return true;
        }

        // アニメーションパラメータを用意する
        switch ( position_type ){
            case 'opened' :
                height_px = stateMap.slider_opened_em;
                animate_time = configMap.slider_open_time;
                slider_title = configMap.slider_opened_title;
                toggle_text = '=';
                break;

            case 'hidden' :
                height_px = 0;
                animate_time = configMap.slider_open_time;
                slider_title = '';
                toggle_text = '+';
                break;

            case 'closed' :
                height_px = stateMap.slider_closed_px;
                animate_time = configMap.slider_close_time;
                slider_title = configMap.slider_closed_title;
                toggle_text = '+';
                break;
            // 未知のposition_typeに対処する
            default : return false;
        }

        // スライダー位置をアニメーションで変更する
        stateMap.position_type = '';
        jqueryMap.$slider.animate(
            { height: height_px },
            animate_time,
            function () {
                jqueryMap.$toggle.prop( 'title', slider_title );
                jqueryMap.$toggle.text( toggle_text );
                stateMap.position_type = position_type;
                if ( callback ) { callback( jqueryMap.$slider ); }
            }
        );
    };
    // publicmethod/setSliderPosition/end
    // --- DOM method end

    // --- event handler start
    // --- event handler end

    // --- public method start
    // publicmethod/configModule/start
    // 用途：spa.chat.configModule({ slider_open_em : 18 });
    // 目的：初期化前にモジュールを構成する
    // 引数：
    //  * set_chat_anchor-オープンまたはクローズ状態を示すように
    //    URIアンカーを変更するコールバック。このコールバックは要求された状態を
    //    満たせない場合にはfalseを返さなければいけない。
    //  * chat_model-インスタントメッセージングと
    //    やり取りするメソッドを提供するチャットモデルオブジェクト。
    //  * people_model-モデルが保持する人々のリストを管理する
    //    メソッドを提供するピープルモデルオブジェクト。
    //  * slider_*構成。すべてオプションのスカラー
    //    完全なリストはmapConfig.settable_mapを参照。
    //    用例：slider_open_emはem単位のオープン時の高さ
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
    initModule = function ( $append_target ) {
        $append_target.append( configMap.main_html );
        stateMap.$append_target = $append_target;
        setJqueryMap();
        setPxSizes();

        // チャットスライダーをデフォルトのタイトルと状態で初期化する
        jqueryMap.$toggle.prop( 'title', configMap.slider_closed_title );
        jqueryMap.$head.click( onClickToggle );
        stateMap.position_type = 'closed';

        return true;
    }
    /*
    initModule = function ( $container ) {
        $container.html( configMap.main_html );
        stateMap.$container = $container;
        setJqueryMap();
        return true;
    };
    */
    // publicmethod/initMOdule/end

    // return publicmethod
    return {
        setSliderPosition: setSliderPosition,
        configModule     : configModule,
        initModule       : initModule
    };
    // --- public method end

}());