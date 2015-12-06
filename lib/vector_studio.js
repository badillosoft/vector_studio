#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var Algorithm = require('./algorithm');

var VectorStudio = function () {
	this.count = 0;
};

VectorStudio.prototype.startServer = function (port) {
	port = port || 2345;
	
	var self = this;
	
	this.server = http.createServer(function(request, response) {
		console.log((new Date()) + ' Received request for ' + request.url);
		response.writeHead(404);
		response.end();
	});
	
	this.server.listen(port, function() {
		console.log((new Date()) + ' Server is listening on port ' + port);
	});
	
	this.wsServer = new WebSocketServer({
		httpServer: this.server,
		autoAcceptConnections: false
	});
	
	this.wsServer.on('request', function(request) {
		var connection = request.accept('echo-protocol', request.origin);
		console.log((new Date()) + ' Connection accepted.');
		connection.on('message', function(message) {
			if (message.type === 'utf8') {
				//console.log('Received Message: ' + message.utf8Data);
				//connection.sendUTF(message.utf8Data);
				var json = null;
				try {
					json = JSON.parse(message.utf8Data);
				} catch (e) {
					console.log('Non JSON message.');
					return;
				}
				self.process(connection, json);
			}
			else if (message.type === 'binary') {
				console.log('Received Binary Message of ' +
					message.binaryData.length + ' bytes');
				connection.sendBytes(message.binaryData);
			}
		});
		connection.on('close', function(reasonCode, description) {
			console.log((new Date()) + ' Peer ' + connection.remoteAddress +
				' disconnected.');
		});
	});
};

VectorStudio.prototype.process = function (conn, json) {
	//console.log('Procesando:\n' + JSON.stringify(json, null, '\t'));
	var algorithm = new Algorithm(this.count, json, null, null);
	
	algorithm.process(function (output) {
		//console.log(output);
		
		conn.send(JSON.stringify(output));
	});
	
	this.count += 1;
	
	return algorithm;
};

module.exports = VectorStudio;