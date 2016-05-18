'use strict';
var http = require('http');

module.exports = function(nodecg) {
	var nowPlaying = nodecg.Replicant('nowPlaying');
	var showNowPlaying = nodecg.Replicant('showNowPlaying');
	
	http.createServer(function (req, res) {
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end(nowPlaying.value.artistSong);
		showNowPlaying.value = true;
	}).listen(8082);
	console.log('Twitch BOT listener running at port 8082');
}