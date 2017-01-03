// ==UserScript==
// @name         CharacterCollector
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  pickup a character with a character id
// @author       Derekt
// @match        https://www.playinitium.com/*
// @match        http://www.playinitium.com/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */

'use strict';

var $ = window.jQuery;
$(document).ready(function () {
    $('body').append('<div style="position:absolute;top:100px;left:0px;z-index:10000000;"> <input placeholder="Character ID" id="charIDinput" type="text"/> <a id="pickupChar">pickup</a> </div>');

    $('#pickupChar').click(function (event) {
        var id = $('#charIDinput').val();
        window.ajaxAction("ServletCharacterControl?type=collectCharacter&characterId="+id, event, window.reloadPagePopup);
    });
});