var amaze = module.parent.exports;
var config = exports.config = {};

var request = require("request");

function getUser(username, gamemode, callback) {
    request("http://osu.ppy.sh/api/get_user?k=" + config.apiKey + 
        "&type=string&u=" + encodeURIComponent(username) + "&m=" + gamemode, 
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(JSON.parse(body));
            } else {
                console.error("Failed to get osu user!");
                callback([]);
            }
    });
}

var gamemodes = ["std", "taiko", "ctb", "mania"];

function printUserStats(args, gamemode, reply) {
    if (args.length < 2) {
        reply("You gotta give me a username :S");
        return;
    }
    
    getUser(args[1], gamemode, function(user) {
        if (user[0]) {
            user = user[0];
            reply("**osu!" + gamemodes[gamemode] + "** stats for __**" + user.username + "**__:\n" +
                (user.pp_raw > 0 ? ("**#" + user.pp_rank +  "** *(#" + user.pp_country_rank + " " + 
                user.country + ")* - " + user.pp_raw + "pp") : "_User hasn't played :0_"));
        } else {
            reply("User doesn't exist :/");
        }
    });
}

exports.commands = {
    stats: {
        permission: "osu.getuser.all",
        func: function(args, context, reply) {
            if (args.length < 2) return "You gotta give me a username :S";
            
            var obs = {};
            var c = 0;
            
            function printResult() {
                reply("**osu! stats** for __**" + obs.std.username + "**__:\n" +
                    " `osu!std` - " + (obs.std.pp_raw > 0 ? ("**#" + obs.std.pp_rank + 
                    "** *(#" + obs.std.pp_country_rank + " " + 
                    obs.std.country + ")* - " + obs.std.pp_raw + "pp") : "_User hasn't played :0_") + 
                    "\n `osu!taiko` - " + (obs.taiko.pp_raw > 0 ? ("**#" + obs.taiko.pp_rank + 
                    "** *(#" + obs.taiko.pp_country_rank + " " + 
                    obs.taiko.country + ")* - " + obs.taiko.pp_raw + "pp") : "_User hasn't played :0_") + 
                    "\n `osu!ctb` - " + (obs.ctb.pp_raw > 0 ? ("**#" + obs.ctb.pp_rank + 
                    "** *(#" + obs.ctb.pp_country_rank + " " + 
                    obs.ctb.country + ")* - " + obs.ctb.pp_raw + "pp") : "_User hasn't played :0_") + 
                    "\n `osu!mania` - " + (obs.mania.pp_raw > 0 ? ("**#" + obs.mania.pp_rank + 
                    "** *(#" + obs.mania.pp_country_rank + " " + 
                    obs.mania.country + ")* - " + obs.mania.pp_raw + "pp") : "_User hasn't played :0_"));
            }
            
            getUser(args[1], 0, function(user) {
                if (user[0]) {
                    obs.std = user[0];
                    if (++c == 4) printResult();
                } else {
                    reply("User doesn't exist :/");
                }
            });
            getUser(args[1], 1, function(user) {
                if (user[0]) {
                    obs.taiko = user[0];
                    if (++c == 4) printResult();
                }
            });
            getUser(args[1], 2, function(user) {
                if (user[0]) {
                    obs.ctb = user[0];
                    if (++c == 4) printResult();
                }
            });
            getUser(args[1], 3, function(user) {
                if (user[0]) {
                    obs.mania = user[0];
                    if (++c == 4) printResult();
                }
            });
        }
    },
    std: {
        permission: "osu.getuser.std",
        func: function(args, context, reply) {
            printUserStats(args, 0, reply);
        }
    },
    taiko: {
        permission: "osu.getuser.taiko",
        func: function(args, context, reply) {
            printUserStats(args, 1, reply);
        }
    },
    ctb: {
        permission: "osu.getuser.ctb",
        func: function(args, context, reply) {
            printUserStats(args, 2, reply);
        }
    },
    mania: {
        permission: "osu.getuser.mania",
        func: function(args, context, reply) {
            printUserStats(args, 3, reply);
        }
    }
};
