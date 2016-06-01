var DiscordClient = require("discord.io");
var fs = require("fs");
var http = require("http");

////
// Globals
////
var discord, config, permissions, commands = {};

////
// Amaze
////
function loadConfig() {
    console.log("Loading config...");
    config = JSON.parse(fs.readFileSync("config.json"));
    console.log("Config loaded!");
}
//Testaa
function runCommand(args, context) {
    if (args.length < 1) return;
    if (commands[args[0]]) {
        if (commands[args[0]].permission &&
            !userHasPermission(context.userID, context.channelID, context.serverID, commands[args[0]].permission)) {
                console.log(context.username + " (" + context.userID + " @ " + context.channelID + " @ " +
                    context.serverID + ") no permission for " + context.userID, args);
                    msg = "You don't have permissions. Use https://s.codepen.io/wesley221/debug/XmRgRP instead.";
                    discord.sendMessage({
                        to: context.channelID,
                        message: msg
                    });
                return;
        }

        console.log(context.username + " (" + context.userID + " @ " + context.channelID + " @ " +
            context.serverID + ") ran ", args);

        try {
            var result = commands[args[0]].func(args, context, function(msg) {
                discord.sendMessage({
                    to: context.channelID,
                    message: msg
                });
            });
            if (result) {
                discord.sendMessage({
                    to: context.channelID,
                    message: result
                });
            }
        } catch (ex) {
            console.log("Error running command!", ex);
        }
    }
}

function parseCommand(message, context) {
    if (message.indexOf(" ") > 0) {
        var f = message.indexOf(" ");
        runCommand([message.substr(0, f), message.substr(f + 1)], context);
    } else {
        runCommand([message], context);
    }
}

////
// Amaze Permissions
////
exports.reloadPermissions = function() {
    console.log("Reloading permissions...");
    permissions = JSON.parse(fs.readFileSync("permissions.json"));
    console.log("Permissions reloaded!");
};
function loadPermissions() {
    console.log("Loading permissions...");
    permissions = JSON.parse(fs.readFileSync("permissions.json"));
    console.log("Permissions loaded!");
}

function userHasPermission(userID, channelID, serverID, permission)     {
    var userPerms = [];
    if (userID) userPerms = userPerms.concat(permissions["user" + userID] ? permissions["user" + userID] : []);
    if (channelID) userPerms = userPerms.concat(permissions["channel" + channelID] ? permissions["channel" + channelID] : []);
    if (serverID) userPerms = userPerms.concat(permissions["server" + serverID] ? permissions["server" + serverID] : []);
    if (permissions["default"]) userPerms = userPerms.concat(permissions["default"]);
    var permParts = permission.split(".");
    for (var i = 0; i < userPerms.length; i++) {
        var negate = false;
        var userPerm = userPerms[i];
        if (userPerm.length > 0 && userPerm[0] == "-") {
            negate = true;
            userPerm = userPerm.substr(1);
        }
        var userPermParts = userPerm.split(".");
        if (userPermParts.length > permParts.length) continue;
        var matched = true;
        for (var j = 0; j < permParts.length; j++) {
            if (userPermParts[j] == "*") return !negate;
            else if (userPermParts[j] != permParts[j]) {
                matched = false;
                break;
            }
        }
        if (matched) return !negate;
    }
    return false;
}

////
// Amaze Plugins
////
function loadPlugin(name, configObject) {
    var path = "./plugins/" + name + ".js";

    delete require.cache[require.resolve(path)];
    var plugin = require(path);

    console.log("Loading " + name + "...");

    for (var i in configObject) {
        plugin.config[i] = configObject[i];
    }

    if (plugin.commands) {
        for (var cmd in plugin.commands) {
            if (commands[cmd]) throw "Command " + cmd + " is already defined!";

            if (!plugin.commands[cmd].func) throw "No command function for " + cmd + "!";
            if (!plugin.commands[cmd].permission)
                console.warn("Command " + cmd + " doesn't have any permissions.");

            commands[cmd] = plugin.commands[cmd];
            commands[cmd].plugin = path;
            commands[cmd].command = cmd;
        }
    }

    console.log("Loaded " + name + "!");
}
function reloadPlugin(name, configObject) {
    var path = "./plugins/" + name + ".js";

    delete require.cache[require.resolve(path)];
    var plugin = require(path);

    console.log("Loading " + name + "...");

    for (var i in configObject) {
        plugin.config[i] = configObject[i];
    }
    if (plugin.commands) {
        for (var cmd in plugin.commands) {
            if (commands[cmd]) throw "Command " + cmd + " is already defined!";

            if (!plugin.commands[cmd].func) throw "No command function for " + cmd + "!";
            if (!plugin.commands[cmd].permission)
                console.warn("Command " + cmd + " doesn't have any permissions.");

            commands[cmd] = plugin.commands[cmd];
            commands[cmd].plugin = path;
            commands[cmd].command = cmd;
        }
    }

    console.log("Loaded " + name + "!");
}

exports.reloadPlugins = function(){
    console.log("Reloading plugins...");
    commands = {};
    var i, filename;
    var pluginFiles = [];
    var configs = {};
    fs.readdir("plugins", function(err, files) {
        if (err) throw "Error loading plugins: " + err;

        for (i = 0; i < files.length; i++) {
            filename = files[i];
            if (filename && filename[0] != '.') {
                if (filename.lastIndexOf(".js") == filename.length - 3) {
                    pluginFiles.push(filename);
                } else if (filename.lastIndexOf(".config.json") == filename.length - 12) {
                    configs[filename.substr(0, filename.length - 12)] = JSON.parse(fs.readFileSync("./plugins/" + filename));
                }
            }
        }

        for (i = 0; i < pluginFiles.length; i++) {
            var pluginName = pluginFiles[i].substr(0, pluginFiles[i].length - 3);
            if (configs[pluginName]) {
                reloadPlugin(pluginName, configs[pluginName]);
            } else {
                reloadPlugin(pluginName, {});
            }
        }
    });
};
function loadPlugins() {
    console.log("Loading plugins...");
    var i, filename;
    var pluginFiles = [];
    var configs = {};
    fs.readdir("plugins", function(err, files) {
        if (err) throw "Error loading plugins: " + err;

        for (i = 0; i < files.length; i++) {
            filename = files[i];
            if (filename && filename[0] != '.') {
                if (filename.lastIndexOf(".js") == filename.length - 3) {
                    pluginFiles.push(filename);
                } else if (filename.lastIndexOf(".config.json") == filename.length - 12) {
                    configs[filename.substr(0, filename.length - 12)] = JSON.parse(fs.readFileSync("./plugins/" + filename));
                }
            }
        }

        for (i = 0; i < pluginFiles.length; i++) {
            var pluginName = pluginFiles[i].substr(0, pluginFiles[i].length - 3);
            if (configs[pluginName]) {
                loadPlugin(pluginName, configs[pluginName]);
            } else {
                loadPlugin(pluginName, {});
            }
        }
    });
}

////
// Discord init
////
loadConfig();
loadPermissions();
loadPlugins();
console.log("Logging in...");
exports.discord = discord = new DiscordClient({
    autorun: true,
    email: config.email,
    password: config.password
});

////
// Amaze Plugin API
////
exports.setUsername = function(username) {
    discord.editUserInfo({
        password: config.password,
        username: username
    });
};

////
// Discord events
////
discord.on("ready", function() {
    console.log("Logged in! " + discord.username + " - (" + discord.id + ")");
});

discord.on("message", function(username, userID, channelID, message) {
    if (message.indexOf(config.commandPrefix) === 0) {
        parseCommand(message.substr(config.commandPrefix.length), {
            username: username,
            userID: userID,
            channelID: channelID,
            serverID: discord.serverFromChannel(channelID)
        });
    }
});

discord.on("disconnected", function() {
    console.log("Connection lost! Reconnecting in 3 seconds");
    setTimeout(discord.connect, 3000);
});

////
// HTTP server
////
if (config.enableServer) {
    var port = config.serverPort ? config.serverPort : 8080;
    console.log("Starting server on " + port + "...");
    http.createServer(function(req, res) {
        res.writeHead(200, {
            "Content-Type": "text/plain"
        });
        res.end("Not implemented yet.");
    }).listen(port);
    console.log("Server started!");
}
