var express = require('express');
var app = express();
var http_server = require('http').createServer(app);
var io = require('socket.io').listen(http_server, { log: true });
var config = require('./lib/config');
var Smoker = require('./lib/smoker');
var logger = require('winston');

logger.setLevels(logger.config.syslog.levels);

logger.info('NODE_ENV: ' + process.env.NODE_ENV);

app.configure(function () {
   app.set('port', process.env.PORT || 3000);
   app.set('io', io);
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');
   app.use(express.static(__dirname + '/public/'));
   app.use(express.static(__dirname + '/bower_components/'));
   app.use(require('connect-assets')({
      helperContext: app.locals,
      paths: ['public/css']
   }));
});

app.set('config', config);
require('./routes/index')(app);
logger.info('Starting http server on port %d.', app.get('port'));
http_server.listen(app.get('port'));
logger.info('Server listening on port %d.', app.get('port'));
