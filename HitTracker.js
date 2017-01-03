// ==UserScript==
// @name         HitTracker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  AutoExplore for a specific mob
// @author       Derekt
// @match        https://www.playinitium.com/*
// @match        http://www.playinitium.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js
// ==/UserScript==
/* jshint -W097 */
/* global $ GM_getValue GM_setValue */

(function() {
    'use strict';
    var alreadyCounted = false;
    var hits, player;
    $(document).ready(function() {
        player = getPlayerStats();
        hits = GM_getValue(player.name, 0);
        window.console.log("current hits = " + hits);
        displayHits();
        $("a[onclick='combatAttackWithRightHand()']").click(function () {
            window.console.log("new attack right");
            if (!alreadyCounted) {
                countHit();
            }
        });
        $("a[onclick='combatAttackWithLeftHand()']").click(function () {
            window.console.log("new attack left");
            if (!alreadyCounted) {
                countHit();
            }
        });
    });
    function countHit() {
        if (alreadyCounted) {
            return false;
        }
        alreadyCounted = true;
        GM_setValue(player.name, hits+1);
    }
    //get player stats and details
    function getPlayerStats() {
        var hp=$("#hitpointsBar").text().split("/");
        return { charachterId:window.characterId,
                verifyCode:window.verifyCode,
                name:$("a[rel^=#profile]:eq(0)").text(),
                maxhp:parseInt(hp[1]),
                hp:parseInt(hp[0]),
                health:+((hp[0]/hp[1])*100).toFixed(2),
                gold:parseInt($("#mainGoldIndicator").text().replace(/,/g, ""))};
    }
    function displayHits() {
        if ($("#hitCounter").length) {
            $("#hitCounter").text("Hits - " + hits);
        } else {
            $("body").append('<div style="position:absolute;left:0px;top:0px;margin: 20px;z-index: 10000000;"> <p id="hitCounter" style="margin: 0;">Hits - ' +
                         hits +
                         '</p> <a id="resetHits">Reset</a></div>');
            $("#resetHits").click(function() {
                if (window.confirm("Are you sure you want to reset " + player.name + "'s hit counter?")) {
                    hits = 0;
                    GM_setValue(player.name, hits);
                    displayHits();
                }
            });
        }
    }
})();
