var fs = require("fs");
var DiscordClient = require("discord.io");
var spawn = require("child_process").spawn;

exports.DJInterface = function(callback) {
    var me = this;
    
    // New Discord bot
    var ready = false;
    var discordConfig = JSON.parse(fs.readFileSync("config.json"));
    var discord = new DiscordClient({
        autorun: true,
        email: discordConfig.email,
        password: discordConfig.password
    });
    
    discord.on("ready", function() {
        console.log("[DJ] Interface created and logged in!");
        if (!ready) {
            callback();
            ready = true;
        }
    });
    
    discord.on("disconnected", function() {
        console.log("[DJ] Connection lost! Reconnecting in 3 seconds");
        setTimeout(discord.connect, 3000);
    });
    
    // Channel and audio stuff
    var channel;
    var ffmpeg;
    var volume = 1;
    var finishedCallback;
    var isPlaying = false;
    var discordIOStreamObj;
    
    // Methods
    me.joinVoiceChannel = function(id, callback) {
        me.leaveVoiceChannel();
        
        channel = id;
        
        discord.joinVoiceChannel(channel, function() {
            discord.getAudioContext({
                    channel: channel,
                    stereo: true
            }, function(stream) {
                discordIOStreamObj = stream;
                
                // Provide custom function that behaves like a stream object
                stream.send({read: function(amount) {
                    // Terminate if destroyed
                    if (stream.destroyed) return;
                    
                    // Create outputbuffer
                    var outBuffer = new Buffer(amount);
                    
                    // Set playing vars
                    var wasPlaying = isPlaying;
                    isPlaying = false;
                    
                    // If we are decoding audio
                    if (ffmpeg) {
                        // Read decoded data
                        var readBuffer = ffmpeg.stdout.read(amount);
                        if (readBuffer && readBuffer.length === amount) {
                            isPlaying = true;
                            
                            // Volume
                            for (var offset = 0; offset < amount; offset += 2) {
                                var val = Math.min(32767, Math.max(-32768, readBuffer.readInt16LE(offset) * volume)); 
                                outBuffer.writeInt16LE(val, offset);
                            }
                            
                            return outBuffer;
                        }
                    }
                    
                    // If we're out of audio
                    if (wasPlaying) {
                        me.stopPlaying();
                        if (finishedCallback) finishedCallback();
                    }
                    
                    // If no data to be read
                    outBuffer.fill(0);
                    return outBuffer;
                }});
            });
            
            callback();
        });
    };
    
    me.leaveVoiceChannel = function() {
        if (!channel) return;
        if (discordIOStreamObj) discordIOStreamObj.destroyed = true;
        me.stopPlaying();
        discord.leaveVoiceChannel(channel);
        channel = null;
    };
    
    me.setStreamVolume = function(vol) {
        volume = vol;
    };
    
    me.stopPlaying = function() {
        isPlaying = false;
        if (ffmpeg) {
            ffmpeg.stdin.on("error", function(){}); // Ignore pipe error
            ffmpeg.stdout.end();
            ffmpeg.stdin.end();
            ffmpeg.kill();
            ffmpeg = null;
        }
    };
    
    me.playMediaStream = function(mediaStream, callback) {
        me.stopPlaying();
        
        ffmpeg = spawn("ffmpeg" ,[
            "-i", "pipe:0",
            "-f", "s16le",
            "-ar", "48000",
            "-ac", "2",
            "pipe:1"
        ]);
        
        mediaStream.pipe(ffmpeg.stdin);
        
        finishedCallback = callback;
    };
};
