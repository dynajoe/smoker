var Q = require('q');
var SensorReader;
var logger = require('winston');

if (process.env.NODE_ENV === 'production') {
   SensorReader = require('max6675-raspberry-pi');
}
else {
   SensorReader = require('./debug_sensor');
}

var Sensor = function Sensor (config, is_primary) {
   this.name = config.name;
   this.reader = new SensorReader(config);
   this.is_primary = is_primary;
};

Sensor.prototype.updateTemperature = function () {
   var deferred = Q.defer();
   process.nextTick(function () {
      this.value = Math.round(this.reader.read());
      deferred.resolve(this.value);
   }.bind(this));
   return deferred.promise;
};

var SensorCollection = function (sensors) {
   this.sensors = sensors;
};

SensorCollection.prototype.read = function (cb) {
   logger.verbose('Reading sensors');

   var time = Date.now();
   var sensors = this.sensors;

   return Q.all(sensors.map(function (s) {
      return s.updateTemperature();
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

module.exports = {
   Sensor: Sensor,
   SensorCollection: SensorCollection
};