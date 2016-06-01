var request = require("request");
var amaze = module.parent.exports;
var config = exports.config = {};
apiKey = "";

exports.commands = {
    calculate: {
        permission: "axs.calculate",
        func: function(argsm, context, reply) {
            if(!argsm[1]) {
                console.log("No first argument given.");
                return;
            }
            var args = argsm[1];
            if (!args[0]){
                reply("No second argument given.");
                return;
            }
            args = args.trim().split(" ");
            if (args.length == 4) {
                args[1] = args[1].replace(/_/g, " ");
                args[2] = args[2].replace(/_/g, " ");
                getMatchJSONShort(args[0], args[1], args[2], args[3], args[4], function(json, mp_id, team1, team2, map, modifier) {
                    // variables for team scores
                    tOneScore = 0;
                    tTwoScore = 0;

                    if((modifier < 0 || modifier > 100) || isNaN(mp_id))
                    {
                        reply("**######################################\n" +
                        "Something went wrong:\n" +
                        "Make sure you entered a valid multiplayer link (25200157)\n" +
                        "Make sure you entered a valid map id, can be \"all\" or a number (starting at 0 and going upwards)\n" +
                        "Make sure you entered a valid modifier, has to be a number\n" +
                        "######################################**");
                    }
                    else
                    {
                        count = 0;
                        for(var gamecounter in json.games)
                        {
                            count++;
                        }

                        if(map > count)
                        {
                            reply("**######################################\n" +
                            "Something went wrong:" +
                            "The map you entered doesn't exist. Try to lower it (last map found is " + count + ")" +
                            "**######################################");
                        }
                        else
                        {
                            if(!isNaN(map))
                            {
                                getBeatmapJSON(json.games[map].beatmap_id, function(mapString){
                                    tOneAccPlayer = json.games[map].scores[0]; // Accuracy player of Team 1
                                    tOneAccTotalFruit 	= 	parseInt(tOneAccPlayer.count50) + parseInt(tOneAccPlayer.count100) + parseInt(tOneAccPlayer.count300) +
                                                            parseInt(tOneAccPlayer.countmiss) + parseInt(tOneAccPlayer.countkatu);
                                    tOneAccFruitCaught 	= 	parseInt(tOneAccPlayer.count50) + parseInt(tOneAccPlayer.count100) + parseInt(tOneAccPlayer.count300);
                                    tOneAcc = ((tOneAccFruitCaught / tOneAccTotalFruit) * 100).toFixed(2); // Accuracy

                                    tTwoAccPlayer = json.games[map].scores[3]; // Accuracy player of Team 2
                                    tTwoAccTotalFruit 	= 	parseInt(tTwoAccPlayer.count50) + parseInt(tTwoAccPlayer.count100) + parseInt(tTwoAccPlayer.count300) +
                                                            parseInt(tTwoAccPlayer.countmiss) + parseInt(tTwoAccPlayer.countkatu);
                                    tTwoAccFruitCaught 	= 	parseInt(tTwoAccPlayer.count50) + parseInt(tTwoAccPlayer.count100) + parseInt(tTwoAccPlayer.count300);
                                    tTwoAcc = ((tTwoAccFruitCaught / tTwoAccTotalFruit) * 100).toFixed(2); // Accuracy

                                    tOneFinalScore = Math.ceil((parseInt(json.games[map].scores[1].score) + parseInt(json.games[map].scores[2].score)) * Math.pow(tOneAcc / 100, modifier));
                                    tTwoFinalScore = Math.ceil((parseInt(json.games[map].scores[4].score) + parseInt(json.games[map].scores[5].score)) * Math.pow((tTwoAcc / 100), modifier));

                                    reply("**Map: " + mapString + "**");
                                    if(tOneFinalScore < tTwoFinalScore)
                                    {
                                        reply('"**' + team2 + '**"' + " has won. " + '"**' + team1 + '**"' + " score: `" + addDot(tOneFinalScore) +
                                        "` | " + '"**' + team2 + '**"' + " score: `" + addDot(tTwoFinalScore) + "` Score difference: `" + addDot((tTwoFinalScore - tOneFinalScore)) + "`");
                                    }
                                    else
                                    {
                                        reply('"**' + team1 + '**"' + " has won. " + '"**' + team1 + '**"' + " score: `" + addDot(tOneFinalScore) +
                                        "` | " + '"**' + team2 + '**"' + " score: `" + addDot(tTwoFinalScore) + "` Score difference: `" + addDot((tOneFinalScore - tTwoFinalScore)) + "`");
                                    }
                                });
                            } else {
                                reply("**Something went wrong**");
                            }
                        }
                    }
                });

            } else {
                reply("**Wrong arguments**");
            }
        }
    }
};








function queryApi(func, params, callback) {
    request("https://osu.ppy.sh/api/" + func + "?k=" + apiKey + params,
        function(error, response, body) {
            if (error || response.statusCode != 200) {
                log.error("queryApi " + func + ", Params: " + params +
                    ", Error: " + error + " - " + response.statusCode);
                return;
            }

            var json = JSON.parse(body);
            callback(json);
        });
}

function addDot(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }
    return x1 + x2;
}

// Return _ALL_ match details
function getMatchJSONExtended(mp_id, team1, team2, map, modifier, callback) {
    request({
        url: "https://osu.ppy.sh/api/get_match?k=" + apiKey + "&mp=" + mp_id
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(JSON.parse(body), mp_id, team1, team2, map, modifier);
        } else {
            console.error("Failed!");
            callback([]);
        }
    });
}

// Return _ALL_ match details but shortened
function getMatchJSONShort(mp_id, team1, team2, map, modifier, callback) {
    request({
        url: "https://osu.ppy.sh/api/get_match?k=" + apiKey + "&mp=" + mp_id
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(JSON.parse(body), mp_id, team1, team2, map - 1, modifier);
        } else {
            console.error("Failed!");
            callback([]);
        }
    });
}

// Return the USERNAME from an userid, ie. Sartan
function getUserJSON(user_id, callback) {
    request({
        url: "https://osu.ppy.sh/api/get_user?k=" + apiKey + "&u=" + user_id
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            json = JSON.parse(body);

            callback(json[0].username);
        } else {
            console.error("Failed!");
            callback([]);
        }
    });
}

// Return the beatmap artist title and difficulty
function getBeatmapJSON(beatmap_id, callback) {
    request({
        url: "https://osu.ppy.sh/api/get_beatmaps?k=" + apiKey + "&b=" + beatmap_id
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            json = JSON.parse(body);

            callback(json[0].artist + " - " + json[0].title + " [" + json[0].version + "]");
        } else {
            console.error("Failed");
            callback([]);
        }
    });
}
