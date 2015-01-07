var SystemCommander = require('../lib/system_commander');
var logger = require('winston');
var Driver = require('../lib/drivers/automated_driver');

var Initialize = function (app) {
   var io = app.get('io');
   var config = app.get('config');

   var driver = new Driver(config.driver);

   driver.start()
   .then(function () {
      io.sockets.emit('started');
   })
   .fail(function (e) {
      io.sockets.emit('error', e);
   });

   io.sockets.on('connection', function (socket) {
      socket.on('time', function (cb) {
         cb(Date.now());
      });

      socket.on('sensors', function (cb) {
         driver.getSensors().fin(cb);
      });

      socket.on('command', function (command, value, cb) {
         driver.perform(command, value).fin(cb);
      });

      socket.on('history', function (cb) {

         cb({
            data: smoker.data,
            started_on: smoker.started_on
         });
      });
   });

   smoker.on('data', function (data) {
      io.sockets.emit('update', {
         info: smoker.brains.info(),
         data: data
      });
   });
};

module.exports = function (app) {
   Initialize(app);
   app.get('/', function (req, res) {
      res.render('index');
   });
};