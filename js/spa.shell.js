/*
 * spa.shell.js
 * SPAシェルモジュール
 */

/* jslint browser: true; continue: true,
   devel: true, indent: 2, maxerr: 50,
   newcap: true, nomen: true, plusplus: true,
   regexp: true, sloppy: true, vars: false,
   white: true
 */
/* global $, spa */
spa.shell = (function () {
    'use strict';
    //--- module scope var start ---
    var
        configMap = {
            anchor_schema_map : {
                chat : { opened : true, closed : true }
            },
            main_html : String()
                + '<div class="spa-shell-head">'
                    + '<div class="spa-shell-head-logo">'
                        + '<h1>SPA</h1>'
                        + '<p>javascript end to end</p>'
                    + '</div>'
                    + '<div class="spa-shell-head-acct"></div>'
                + '</div>'
                + '<div class="spa-shell-main">'
                    + '<div class="spa-shell-main-nav"></div>'
                    + '<div class="spa-shell-main-content"></div>'
                + '</div>'
                + '<div class="spa-shell-foot"></div>'
                /*+ '<div class="spa-shell-chat"></div>'*/
                + '<div class="spa-shell-modal"></div>',
            /*
            chat_extend_time    : 1000,
            chat_retract_time   : 300,
            chat_extend_height  : 450,
            chat_retract_height : 15,
            chat_extend_title   : 'Click to retract',
            chat_retract_title  : 'Click to extend'
            */
            resize_interval : 200,
        },
        /*
        stateMap = {
            $container       : null,
            anchor_map       : {},
            is_chat_retracted: true
        */
        stateMap = {
            $container  : undefined,
            anchor_map  : {},
            resize_idto : undefined
        },
        jqueryMap = {},

        copyAnchorMap, setJqueryMap, /*toggleChat,*/
        changeAnchorPart, onHashchange, onResize,
        onTapAcct, onLogin, onLogout,
        /*onClickChat,*/setChatAnchor, initModule;
    // --- module scope var end ---
    // --- utility method start ---
    // 格納したアンカーマップのコピーを返す。 オーバーヘッドを最小限にする。
    copyAnchorMap = function () {
        return $.extend( true, {}, stateMap.anchor_map );
    }
    // --- utility method end ---
    // --- DOM method start ---
    // DOM method /changeAnchorPart/start
    changeAnchorPart = function ( arg_map ) {
        var
            anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name, key_name_dep;
        // アンカーマップへ変更を統合開始
        KEYVAL:
        for ( key_name in arg_map ) {
            if ( arg_map.hasOwnProperty( key_name ) ) {
                // 反復中に従属キーを飛ばす
                if ( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }

                // 独立キー値を更新する
                anchor_map_revise[key_name] = arg_map[key_name];

                // 合致する独立キーを更新する
                key_name_dep = '_' + key_name;
                if ( arg_map[key_name_dep] ) {
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                }
                else {
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s' + key_name_dep];
                }
            }
        }
        // アンカーマップへ変更を統合終了

        // URIの更新開始。成功しなければ元に戻す。
        try {
            $.uriAnchor.setAnchor( anchor_map_revise );
        }
        catch ( error ) {
            // URIを既存の状態に置き換える
            $.uriAnchor.setAnchor( stateMap.anchor_map,null,true );
            bool_return = false;
        }
        // URIの更新終了

        return bool_return;
    };
    // DOM method /changeAnchorPart/end
    // DOM method /setJqueryMap/start
    setJqueryMap = function () {
        var $container = stateMap.$container;
        jqueryMap = {
            /*
            $container : $container,
            $chat : $container.find( '.spa-shell-chat' )
            */
            $container : $container,
            $acct      : $container.find('.spa-shell-head-acct'),
            $nav       : $container.find('.spa-shell-main-nav')
        };
    };
    // DOM method /setJqueryMap/end
    // DOM method /toggleChat/start
    /* spa.chat.jsに移したので削除
    toggleChat = function ( do_extend, callback ) {
        var
            px_chat_ht = jqueryMap.$chat.height(),
            is_open = px_chat_ht === configMap.chat_extend_height,
            is_closed = px_chat_ht === configMap.chat_retract_height,
            is_sliding = ! is_open && ! is_closed;

        if ( is_sliding ){ return false; }

        if ( do_extend ) {
            jqueryMap.$chat.animate(
                { height : configMap.chat_extend_height },
                configMap.chat_extend_time,
                function () {
                    jqueryMap.$chat.attr(
                        'title', configMap.chat_extend_title
                    );
                    stateMap.is_chat_retracted = false;
                    if ( callback ){ callback( jqueryMap.$chat ); }
                }
            );
            return true;
        }

        jqueryMap.$chat.animate(
            { height : configMap.chat_retract_height },
            configMap.chat_retract_time,
            function () {
                jqueryMap.$chat.attr(
                    'title', configMap.chat_retract_title
                );
                stateMap.is_chat_retracted = true;
                if ( callback ){ callback( jqueryMap.$chat ); }
            }
        );
        return true;
    };
    */
    // DOM method /toggleChat/end
    // --- DOM method end ---

    // --- event handler start ---
    // eventhandler/onResize/start
    onResize = function (){
        if ( stateMap.resize_idto ){ return true; }

        spa.chat.handleResize();

        stateMap.resize_idto = setTimeout(
            function (){ stateMap.resize_idto = undefined; },
            configMap.resize_interval
        );

        return true;
    }
    // eventhandler/onResize/end

    // eventhadler/onHashchange/start
    onHashchange = function ( event ) {
        var
            _s_chat_previous, _s_chat_proposed,
            s_chat_proposed,
            anchor_map_proposed,
            is_ok = true,
            anchor_map_previous = copyAnchorMap();

        // アンカーの解析を試みる
        try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
        catch ( error ) {
            $.uriAnchor.setAnchor( anchor_map_previous, null, true );
            return false;
        }
        stateMap.anchor_map = anchor_map_proposed;

        // 便利な変数
        _s_chat_previous = anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;

        // 変更されている場合のチャットコンポーネントの調整開始
        if ( ! anchor_map_previous
            || _s_chat_previous !== _s_chat_proposed
        ) {
            s_chat_proposed = anchor_map_proposed.chat;
            switch ( s_chat_proposed ) {
                case 'opened' :
                    /*toggleChat( true );*/
                    is_ok = spa.chat.setSliderPosition( 'opened' );
                break;
                case 'closed' :
                    /*toggleChat( false );*/
                    is_ok = spa.chat.setSliderPosition( 'closed' );
                break;
                default :
                    /*toggleChat( false );*/
                    spa.chat.setSliderPosition( 'closed' );
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
            }
        }
        // 変更されている場合のチャットコンポーネントの調整終了

        // スライダーの変更が拒否された場合にアンカーを元に戻す処理を開始
        if ( ! is_ok ){
            if ( anchor_map_previous ){
                $.uriAnchor.setAnchor( anchor_map_previous, null, true );
                stateMap.anchor_map = anchor_map_previous;
            } else {
                delete anchor_map_proposed.chat;
                $.uriAnchor.setAnchor( anchor_map_proposed, null, true);
            }
        }
        // スライダーの変更が拒否された場合にアンカーを元に戻す処理を終了
        return false;
    };
    // eventhandler/onHashchange/end
    // eventhandler/onClickChat/start
    /*
    onClickChat = function ( event ) {
        changeAnchorPart({
            chat : ( stateMap.is_chat_retracted ? 'open' : 'closed' )
        });
        // if ( toggleChat( stateMap.is_chat_retracted ) ) {
        //     $.uriAnchor.setAnchor({
        //         chat : ( stateMap.is_chat_retracted ? 'open' : 'closed' )
        //     });
        // }
        return false;
    }
    */
    // eventhandler/onClickChat/end
    onTapAcct = function ( event ) {
        var acct_text, user_name, user = spa.model.people.get_user();
        if ( user.get_is_anon() ) {
            user_name = prompt( 'Please sign-in' );
            spa.model.people.login( user_name );
            jqueryMap.$acct.text( '...processing...' );
        }
        else {
            spa.model.people.logout();
        }
        return false;
    };

    onLogin = function ( event, login_user ) {
        jqueryMap.$acct.text( login_user.name );
    };

    onLogout = function ( event, logout_user ) {
        jqueryMap.$acct.text( 'Please sign-in' );
    };
    // --- event handler end ---

    // --- callback start ---
    // callbackmethod/setChatAnchor/start
    setChatAnchor = function ( position_type ){
        return changeAnchorPart({ chat : position_type });
    };
    // callbackmethod/setChatAnchor/end
    // --- callback end ---

    // --- public method start ---
    // public method/initModule/start
    initModule = function ( $container ) {
        // HTMLをロードし、jQueryコレクションをマッピングする
        stateMap.$container = $container;
        $container.html( configMap.main_html );
        setJqueryMap();

        /*
        stateMap.is_chat_retracted = true;

        jqueryMap.$chat
            .attr( 'title', configMap.chat_retract_title )
            .click( onClickChat );

        // setTimeout( function () {toggleChat( true );}, 3000 );
        // setTimeout( function () {toggleChat( false );}, 8000 );

        $.uriAnchor.configModule({
            schema_map : configMap.anchor_schema_map
        });
        */

        // 機能モジュールを設定して初期化する
        spa.chat.configModule({
            set_chat_anchor : setChatAnchor,
            chat_model      : spa.model.chat,
            people_model    : spa.model.people
        });
        spa.chat.initModule( jqueryMap.$container );

        spa.avtr.configModule({
            chat_model : spa.model.chat,
            people_model : spa.model.people
        });
        spa.avtr.initModule( jqueryMap.$nav );
        // 機能モジュールを構成して初期化する
        /*
        spa.chat.configModule( {} );
        spa.chat.initModule( jqueryMap.$chat );
        */

        $(window)
            .bind( 'resize', onResize )
            .bind( 'hashchange', onHashchange )
            .trigger( 'hashchange' );

        $.gevent.subscribe( $container, 'spa-login', onLogin );
        $.gevent.subscribe( $container, 'spa-logout', onLogout );

        jqueryMap.$acct
            .text( 'Please sign-in' )
            .bind( 'utap', onTapAcct );
    };
    // public method/initModule/end
    return { initModule : initModule };
    // --- public method end ---
}());