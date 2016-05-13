'use strict';

// Do NOT include this line if you are using the browser version.
var irc = require("tmi.js");

module.exports = function(nodecg) {
    if (!nodecg.bundleConfig) {
        nodecg.log.error('cfg/shaolin-twitch.json was not found. Twitch integration will be disabled.');
        return;
    } else if (typeof nodecg.bundleConfig.twitch === 'undefined') {
        nodecg.log.error('"twitch" is not defined in cfg/shaolin-twitch.json! ' +
            'Twitch integration will be disabled.');
        return;
    }
    
    var botName = nodecg.bundleConfig.twitch.account;
	var channel = nodecg.bundleConfig.twitch.channel;
	
	var ircMessages = nodecg.Replicant('irc', {defaultValue: []});
	
	var options = {
		connection: {
		    cluster: "aws",
		    reconnect: true
		},
		identity: {
	        username: botName,
	        password: nodecg.bundleConfig.twitch.pass
		},
		channels: ['#'+ channel]
	};

	var client = new irc.client(options);

	client.on("chat", function (channel, user, message, self) {
		ircMessages.value.push(message);
	});

	// Connect the client to the server..
	client.connect();
}
