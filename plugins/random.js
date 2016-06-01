var amaze = module.parent.exports;
var config = exports.config = {};

var tinyurl = require("tinyurl");
var request = require("request");

function getRedditJSON(args, callback) {
    request({
        url: "https://imgur.com/r/" + args + "/top/week.json"
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.error("Failed!");
            callback([]);
        }
    });
}

function getKonachanJSON(args, callback) {
    request({
        url: "https://konachan.com/post.json?page=" + Math.floor((Math.random() * 150) + 1) + "&tags=censored"
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.error("Failed!");
            callback([]);
        }
    });
}

exports.commands = {
    lizplsstop: {
        permission: "random",
        func: function(args, context, reply) {
            reply("ELISABETH PLEASE JUST STOP THIS BS ALREADY 😂");
        }
    },
    earthporn: {
        permission: "random.earthporn",
        func: function(args, context, reply) {
            getJSON("earthporn", function(jeson) {
                reply("https://i.imgur.com/" + jeson.data[Math.floor(Math.random() * jeson.data.length)].hash + ".jpg");
            });
        }
    },
    lewd: {
        permission: "random.lewd",
        func: function(args, context, reply) {
            getKonachanJSON("hue", function(jeson) {
                tinyurl.shorten(jeson[Math.floor(Math.random() * jeson.length)].file_url, function(res) {
                    reply(res);
                });
            });
        }
    },
    test: {
        permission: "test",
        func: function(args, context, reply) {
            reply("heu\n**hello**\n```test```");
        }
    }
};
