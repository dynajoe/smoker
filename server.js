var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var config = require('./config');
var Smoker = require('./lib/smoker');

app.configure(function () {
   app.set('port', process.env.PORT || 3000);
   app.set('io', io);
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');
   app.use(express.static(__dirname + '/public/'));
   app.use(express.static(__dirname + '/bower_components/'));
   app.use(require('connect-assets')({
      helperContext: app.locals
   }));
});

var smoker = new Smoker(config);

smoker.initialize(function (err) {
   if (err) {
      console.log(err);
      return;
   }

   if (!smoker.start()) {
      console.log('Unable to start smoker');
      return;
   }

   app.set('smoker', smoker);
   app.set('config', config);
   require('./routes/index')(app);
   server.listen(app.get('port'));

   console.log('NODE_ENV: ' + process.env.NODE_ENV);
   console.log('Server listening on port ' + app.get('port'));
});
