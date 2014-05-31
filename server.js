var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var config = require('./config');
var Smoker = require('./lib/smoker');
var logger = require('winston');
var mongodb = require('mongodb');

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

var server = mongodb.Server('localhost', '27017');
var db = mongodb.Db('smoker', server, { safe: true });

db.open(function (err) {
   if (err) throw err;

   var smoker = new Smoker(config, db);

   smoker.start()
   .then(function () {
      app.set('smoker', smoker);
      app.set('config', config);
      require('./routes/index')(app);
      server.listen(app.get('port'));
      logger.info('Server listening on port ' + app.get('port'));
   })
   .fail(function (e) {
      logger.error('Unable to start smoker', e);
   });
});