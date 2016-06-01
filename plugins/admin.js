var amaze = module.parent.exports;
var amazejs = require("../amaze.js");
var config = exports.config = {};

var request = require("request");
var fs = require("fs");

exports.commands = {
    "!name": {
        permission: "admin.set.name",
        func: function(args) {
            if (args.length < 2) return "No username!";
            amaze.setUsername(args[1]);
            return "OK!";
        }
    },
    "!avatar": {
        permission: "admin.set.avatar",
        func: function(args, context, reply) {
            if (args.length < 2) return "No URL!";
            request({
                encoding: null,
                url: args[1]
            }, function(error, response, body) {
                if (error || response.statusCode != 200) {
                    reply("Download failed!");
                    return;
                }

                amaze.discord.editUserInfo({ avatar: new Buffer(body).toString("base64") });

                reply("OK!");
            });
            return "Downloading...";
        }
    },
    reloadPermissions: {
        permission: "reload.permissions",
        func: function(args, context, reply) {
            amazejs.reloadPermissions();
            reply("**Permissions reloaded.**");
        }
    },
    reloadPlugins: {
        permission: "reload.plugins",
        func: function(args, context, reply) {
            amazejs.reloadPlugins();
            reply("**Plugins reloaded.**");
        }
    }
};
