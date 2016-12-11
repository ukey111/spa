/*
 * spa.js
 * root name space module
 */

/* jslint         browser : true, continue : true,
   devel  : true, indent  : 2,      maxerr : 50,
   newcap : true, nomen   : true, plusplus : true,
   regexp : true, sloppy  : true,     vars : false,
   white  : true
*/
/* global $, spa:true */

var spa = (function () {
    'use strict';
    var initModule = function ( $container ) {
      spa.model.initModule();
      spa.shell.initModule( $container );
    };
    /*
        $container.html(
            '<h1 style="display:inlin-block; margin: 25px;">'
                + 'hello world!'
                + '</h1>'
        );
    };
    */
    return { initModule: initModule };
}());