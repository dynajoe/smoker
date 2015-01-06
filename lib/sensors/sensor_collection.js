var logger = require('winston');
var Q = require('q');

var SensorCollection = function (sensors) {
   this.sensors = sensors;
};

SensorCollection.prototype.read = function (cb) {
   logger.verbose('Reading sensors');

   var time = Date.now();
   var sensors = this.sensors;

   return Q.all(sensors.map(function (s) {
      return s.read();
   }))
   .then(function () {
      return sensors
      .map(function (s) {
         return {
            time: time,
            value: s.value,
            name: s.name,
            is_primary: s.is_primary
         };
      })
      .reduce(function (acc, s) {
         acc[s.name] = s;
         return acc;
      }, {});
   });
};

module.exports = SensorCollection;