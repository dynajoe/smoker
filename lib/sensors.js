var Q = require('q');
var SensorReader;

if (process.env.NODE_ENV === 'production') {
   SensorReader = require('max6675-raspberry-pi');
}
else {
   SensorReader = function () {
      this.read = function () {
         return 200 + parseInt(Math.random() * 50, 10);
      };
   };
}

var Sensor = function Sensor (config) {
   this.name = config.name;
   this.reader = new SensorReader(config);
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
            name: s.name
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