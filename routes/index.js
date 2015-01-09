var SystemCommander = require('../lib/system_commander');
var logger = require('winston');
//var Driver = require('../lib/drivers/automated_driver');
var Driver = require('../lib/drivers/debug_driver');
var Q = require('q');

var Initialize = function (app) {
   var io = app.get('io');
   var config = app.get('config');
   var startedOn = new Date();
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
         driver.getSensors()
         .then(cb);
      });

      socket.on('commands', function (cb) {
         driver.getCommands()
         .then(cb);
      });

      socket.on('perform', function (command, value, cb) {
         driver.perform(command, value).fin(cb);
      });

      socket.on('history', function (cb) {
         driver.getHistory()
         .then(function (history) {
            return cb({
               data: history,
               started_on: startedOn
            });
         });
      });
   });

   setInterval(function () {
      Q.spread([driver.readSensors(), driver.getInfo()],
      function (sensors, info) {
         io.sockets.emit('update', {
            info: info,
            data: {
               sensors: sensors
            },
            time: Date.now()
         });
      })
      .fail(function (e) {
         console.log(e);
      });
   }, 1000);
};

module.exports = function (app) {
   Initialize(app);
   app.get('/', function (req, res) {
      res.render('index');
   });
};