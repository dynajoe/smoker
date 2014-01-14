var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var stylus = require('stylus');
var nib = require('nib');

app.configure(function () {
   app.set('port', process.env.PORT || 3000);
	app.set('io', io);
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');

	function compile(str, path) {
		return stylus(str)
			.set('filename', path)
			.set('compress', true)
			.use(nib())
			.import('nib');
	}

   app.use(stylus.middleware({ 
      src: __dirname + '/public/css/', 
      dest: __dirname + '/public/css/',
      compile: compile 
   }));

   app.use(express.static(__dirname + '/public/'));
});

require('./routes/index')(app);

server.listen(app.get('port'));

console.log('Server listening on port ' + app.get('port'));