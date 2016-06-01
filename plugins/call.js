var amaze = module.parent.exports;
var config = exports.config = {};

function findUsersByRoleName(rolename, serverID) {
    var users = [];
    
    rolename = rolename.toLowerCase();
    var fRoleID;
    
    var roles = amaze.discord.servers[serverID].roles;
    for (var roleID in roles) {
        if (roles[roleID].name.toLowerCase() == rolename) {
            fRoleID = roleID;
            break;
        }
    }
    if (!fRoleID) return "Group not found!";
    
    var str = "";
    var members = amaze.discord.servers[serverID].members;
    for (var userID in members) {
        var user = members[userID];
        if (user.roles.indexOf(fRoleID) != -1) {
            users.push(user);
        }
    }
    
    return users;
}

function getMentionString(users) {
    var str = "";
    for (var i = 0; i < users.length; i++)
        str += "<@" + users[i].user.id + ">";
    return str;
}

exports.commands = {
    "callgroup": {
        permission: "call.group",
        func: function(args, context, reply) {
            if (args.length < 2) return "No group!";

            return getMentionString(findUsersByRoleName(args.slice(1).join(" "), context.serverID));
        }
    },
    "callgroupactive": {
        permission: "call.group.active",
        func: function(args, context, reply) {
            if (args.length < 2) return "No group!";

            var users = findUsersByRoleName(args.slice(1).join(" "), context.serverID);
            
            for (var i = users.length - 1; i >= 0; i--) {
                if (!users[i].status || users[i].status == "offline" || users[i].status == "idle") {
                    users.splice(i, 1);
                }
            }
            
            return getMentionString(users);
        }
    },
    "callgrouponline": {
        permission: "call.group.online",
        func: function(args, context, reply) {
            if (args.length < 2) return "No group!";

            var users = findUsersByRoleName(args.slice(1).join(" "), context.serverID);
            
            for (var i = users.length - 1; i >= 0; i--) {
                if (!users[i].status || users[i].status == "offline") {
                    users.splice(i, 1);
                }
            }
            
            return getMentionString(users);
        }
    }
};
