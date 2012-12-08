var express = require('express'), 
  app = express(), 
  server = require('http').createServer(app), 
  io = require('socket.io').listen(server);

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(__dirname + '/public'));
  app.use(require('connect-assets')());
});

require('./routes/index')(app, io);

server.listen(app.get('port'));