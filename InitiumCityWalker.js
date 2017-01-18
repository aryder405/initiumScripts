// ==UserScript==
// @name         CityWalker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Walks between Aera, Volantis, and Spargus
// @author       Derekt
// @match        https://www.playinitium.com/*
// @match        http://www.playinitium.com/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */

'use strict';

var $ = window.jQuery;
// if (minHP > player.hp) {
$(document).ready(function () {
    var delay = Math.random() * 300;
    var state = window.localStorage.getItem("cityWalkerState");
    if (state === null) {
        state = {
            active : false,
            destination : 5707702298738688, // Aera from East
            minHP : 31
        };
        updateState();
    } else {
        state = JSON.parse(state);
    }
    addUI();
    
    var route = [
        6453597373988864, // Volantis - Volantis Countryside
        4933924262248448, // Volantis Countryside - Volantis River
        5824984920358912, // Volantis River - High Road: Lake
        5352822522511360, // High Road: Lake - High Road: Forest Lookout
        6637356476006400, // High Road: Forest Lookout - High Road: Ogre Pass
        5618164293435392, // High Road: Ogre Pass - High Road: Waterfall Clearing
        5631755113463808, // High Road: Waterfall Clearing - High Road: Waterfall
        4829420896387072, // High Road: Waterfall - High Road: Forest
        5847440083124224, // High Road: Forest - High Road: Dense Forest
        4895394546843648, // High Road: Dense Forest - High Road: Swampland
        5445102503723008, // High Road: Swampland - High Road
        6487503003451392, // High Road - The Fork
        5398765569572864, // The Fork - North West Hills
        6669355408424960, // North West Hills - Aera
        5707702298738688, // Aera - Aera Countryside
        5722646637445120, // Aera Countryside - Aera Swamplands
        5644406560391168, // Aera Swamplands - Grand Mountain
        5710239819104256, // Grand Mountain - Desert
        6572424170569728, // Desert - North Mountain Range
        6665253882429440, // North Mountain Range - Black Mountain
        6671830961094656, // Black Mountain - Hidden Pass
        5871048307245056, // Hidden Pass - Eastern Desert 0
        4773917299310592, // Eastern Desert 0 - 1
        4872389088247808, // Eastern Desert 1 - 1a
        5993432393711616, // Easern Desert 1a - Death Valley
        5254530341011456, // Death Valley - Oasis
        5742443771199488  // Oasis - Spargus
    ];
    
    var emeraldIsleRoute = [
        6607819116642304, // Death Valley - Red Cliffs
        6186125000441856, // Red Cliffs - Red Cliff's Edge
        5820797095510016, // Red Cliff's Edge - Lost Sea Shore
        4593402413842432, // Lost Sea Shore - Lost Sea 1
        6469174082666496, // Lost Sea 1 - Lost Sea 2
        5595304089878528, // Lost Sea 2 - Lost Sea 3
        6557824757792768, // Lost Sea 3 - Lost Sea 4
        5145184839925760, // Lost Sea 4 - Emerald Isle
        4982919197097984 // Emerald Isle - Emerald Isle Shores
    ]
    
    
    window.route = route;
    window.getPaths = getPaths;
    
    window.setTimeout(travel, delay);
    
    function addUI() {
        var text;
        if (state.active) {
            switch (state.destination) {
                case 5707702298738688: 
                    text = 'Walking to Aera from East (cancel)'
                    break;
                case 6453597373988864:
                    text = 'Walking to Volantis (cancel)'
                    break;
                case 6669355408424960:
                    text = 'Walking to Aera from West (cancel)'
                    break;
                case 5742443771199488:
                    text = 'Walking to Spargus (cancel)'
                    break;
                case 4982919197097984:
                    text = 'Walking to Emerald Isle (cancel)'
                    break;
                case 6607819116642304:
                    text = 'Walking to Death Valley (cancel)'
                    break;
                default:
                    text = 'Unknown Destination (cancel)'
                    break;
            }
        } else {
            text = "CityWalker (start)"
        }
        $('#main-button-list').prepend('<a id="CityWalkerButton" class="main-button" href="#">'+text+'</a>');
        $('#CityWalkerButton').click(function() {
            if (state.active) {
                state.active = false;
                updateState();
                refreshUI();
            } else {
                var response = window.prompt('Enter (1) Spargus, (2) Volantis, (3) Aera from East, (4) Aera from West, (5) Death Valley -> Em Isle, (6) Em Isle -> Death Valley');
                console.log(response);
                switch (response) {
                    case '1':
                    case 'Spargus':
                        state.active = true;
                        state.destination = 5742443771199488;
                        break;
                    case '2':
                    case 'Volantis':
                        state.active = true;
                        state.destination = 6453597373988864;
                        break;
                    case '3':
                    case 'Aera from East':
                        state.active = true;
                        state.destination = 5707702298738688;
                        break;
                    case '4':
                    case 'Aera from West':
                        state.active = true;
                        state.destination = 6669355408424960;
                        break;
                    case '5':
                    case 'Death Valley -> Em Isle':
                        state.active = true;
                        state.destination = 4982919197097984;
                        break;
                    case '6':
                    case 'Em Isle -> Death Valley':
                        state.active = true;
                        state.destination = 6607819116642304;
                        break;
                    default:
                        window.alert('Invalid destination, it is case sensitive');
                        break;
                }
                updateState();
                if (state.active) {
                    refreshUI();
                    travel();
                }
            }
        });
    }
    
    function travel() {
        if (!state.active) {
            console.log("not active");
            return false;
        }
        var player = getPlayerStats();
        var loc = getLocation();
        if (player.hp < state.minHP) {
            return true;
        }
        switch (loc.type) {
            case "in combat!":
                $("a[onclick='combatEscape()']").trigger("click");
                break;
            case "combat site":
                $(".main-item-container").find("[onclick*='Doge']:not(:contains(' 0 gold'))").trigger("click");
                window.setTimeout(function() {
                    $("a[shortcut='70']").trigger("click");
                }, 4000);
                break;
            default:
                var walk = function(route) {
                    var paths = getPaths().filter(function(p) {
                        return route.includes(p);
                    });
                    
                    if (paths.length === 0) {
                        console.log("no paths found");
                        state.active = false;
                        updateState();
                        refreshUI();
                        return false;
                    } else if (paths.length === 1) {
                        if (paths[0] == state.destination) {
                            state.active = false;
                            updateState();
                        } else {
                            clickPath(paths[0]);
                        }
                    } else {
                        var index0 = route.indexOf(paths[0]);
                        var index1 = route.indexOf(paths[1]);
                        var pforward, pbackward;
                        if (index0 > index1) {
                            pforward = route[index0];
                            pbackward = route[index1];
                        } else {
                            pforward = route[index1];
                            pbackward = route[index0];
                        }
                        
                        if (pbackward === state.destination) {
                            console.log("destination reached");
                            state.active = false;
                            updateState();
                            refreshUI();
                        } else {
                            console.log("clicking on " + pforward);
                            clickPath(pforward);
                        }
                    }
                }
                
                switch (state.destination) {
                    case 5707702298738688: 
                    case 6453597373988864:
                        // walking West
                        walk(route.reverse());
                    case 6669355408424960:
                    case 5742443771199488:
                        // walking East
                        walk(route);
                        break;
                    case 4982919197097984:
                        walk(emeraldIsleRoute);
                        break;
                    case 6607819116642304:
                        walk(emeraldIsleRoute.reverse());
                        break;
                    default:
                        window.console.warn('unknown destination');
                        break;
                }
                break;
        }
    }
    
    //get location data
    function getLocation() {
        var loc={name:$(".header-location").text()};
        if(loc.name.indexOf("Combat site:")!==-1) { loc.type=($(".character-display-box").length>1)?"in combat!":"combat site"; } //if we're in a combat site, are we in combat or not? 
        else if(loc.name.indexOf("Camp:")!==-1) { loc.type="camp"; } //if we ain't fighting, are are we in a camp?
        else { loc.type=(window.biome)?window.biome.toLowerCase():"in a fight!"; } //if all else fails, i guess we're outside
        loc.campable=($("a[onclick^=createCampsite]").length>0)?true:false;
        loc.rest=($("a[onclick^=doRest]").length>0)?true:false;
        return loc;
    }

    //get player stats and details
    function getPlayerStats() {
        var hp=$("#hitpointsBar").text().split("/");
        return { characterId:window.characterId,
                verifyCode:window.verifyCode,
                name:$("a[rel^=#profile]:eq(0)").text(),
                maxhp:parseInt(hp[1]),
                hp:parseInt(hp[0]),
                health:+((hp[0]/hp[1])*100).toFixed(2),
                gold:parseInt($("#mainGoldIndicator").text().replace(/,/g, ""))};
    }
    
    function updateState() {
        window.localStorage["cityWalkerState"] = JSON.stringify(state);
    }
    
    function refreshUI() {
        $('#CityWalkerButton').remove();
        addUI();
    }
    
    function getPaths() {
        var pathsAttrs = $('a[onclick^="doGoto(event"').map(function() {return $(this).attr('onclick')});
        var paths = [];
        for (var i = 0; i < pathsAttrs.length; i++) {
            var matches = getMatches(pathsAttrs[i]);
            paths.push(parseInt(matches[0]));
        }
        
        function getMatches(string) {
          var matches = [];
          var index = 1;
          var parser = /doGoto\(event, (\d*)/gi;
          var match;
          while (match = parser.exec(string)) {
            matches.push(match[index]);
          }
          return matches;
        }
        
        return paths;
    }
    
    function clickPath(id) {
        $('a[onclick="doGoto(event, ' + id + ')"]').trigger('click');
    }
});