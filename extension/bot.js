'use strict';

// Do NOT include this line if you are using the browser version.
var irc = require("tmi.js");
var HashMap = require("hashmap");
var sleep = require('sleep');
var random = require('random-js');

module.exports = function(nodecg) {
    if (!nodecg.bundleConfig) {
        nodecg.log.error('cfg/shaolin-twitch.json was not found. Twitch integration will be disabled.');
        return;
    } else if (typeof nodecg.bundleConfig.shaolinbot === 'undefined') {
        nodecg.log.error('"twitch" is not defined in cfg/shaolin-twitch.json! ' +
            'Twitch integration will be disabled.');
        return;
    }
    
    let botName = nodecg.bundleConfig.shaolinbot.config.account;
	let channel = nodecg.bundleConfig.shaolinbot.config.channel;
	let saudacoes = new HashMap();

	for (let item = 0; item != nodecg.bundleConfig.shaolinbot.greetings.length-1; item++) {
		let gatihosObj = nodecg.bundleConfig.shaolinbot.greetings[item];
		let gatihos = gatihosObj.trigger.split(';');
		for (let gatilhoIndex = 0; gatilhoIndex != gatihos.length-1; gatilhoIndex++) {
			saudacoes.set(gatihos[gatilhoIndex], gatihosObj.message);
		}
	}
	
	var ircMessages = nodecg.Replicant('irc', {defaultValue: []});
	ircMessages.value.length = 0;
	
	var options = {
		connection: {
		    cluster: "aws",
		    reconnect: true
		},
		identity: {
	        username: botName,
	        password: nodecg.bundleConfig.shaolinbot.config.pass
		},
		channels: ['#'+ channel]
	};

	var client = new irc.client(options);

	client.on("chat", function (channel, user, message, self) {
		if (user == botName) return;
		sleep.usleep(340000);
		
		let msgSplit = message.split(' ');
		if (saudacoes.has(msgSplit[0])) {
			//let msgObj = saudacoes.get(msgSplit[0]);
			//nodecg.log.info(msgObj);
			//let msgRespSplit = msgObj.split(';');
			//nodecg.log.info(msgRespSplit);
			//client.say(channel, msgRespSplit[random.integer(0, msgRespSplit.length)]);
		}
		ircMessages.value.push(message);
	});

	// Connect the client to the server..
	client.connect();
}
