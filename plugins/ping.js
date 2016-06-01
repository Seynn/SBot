var amaze = module.parent.exports;
var config = exports.config = {};

exports.commands = {
    "ping": {
        permission: "ping",
        func: function() {
            return "pong";
        }
    }
};
