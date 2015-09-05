var Config = require('./lib/config');
var Smoker = require('./lib/smoker');
var Logger = require('winston');
var Express = require('express');

Logger.setLevels(Logger.config.syslog.levels);
Logger.level = Config.log.level;

var app = Express();
var http_server = require('http').createServer(app);
var io = require('socket.io').listen(http_server, { log: true });

app.configure(function () {
   app.set('port', process.env.PORT || 3000);
   app.set('io', io);
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');
   app.use(Express.static(__dirname + '/public/'));
   app.use(Express.static(__dirname + '/bower_components/'));
   app.use(require('connect-assets')({
      helperContext: app.locals,
      paths: ['public/css']
   }));
});

app.set('config', Config);
require('./routes/index')(app);

Logger.info('NODE_ENV: ' + process.env.NODE_ENV);
Logger.info('Starting http server on port %d.', app.get('port'));

http_server.listen(app.get('port'), function () {
   Logger.info('Server listening on port %d.', app.get('port'));   
});

