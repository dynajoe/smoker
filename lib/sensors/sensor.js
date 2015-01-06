var Q = require('q');
var logger = require('winston');

var Sensor = function Sensor (config) {
   this.name = config.name;
   this.type = config.type;
   this.is_primary = config.is_primary;

   var sensorType = null;

   try {
      sensorType = require('./' + config.type + '_sensor');
   } catch (e) {
      console.log(e);
      sensorType = require(config.type);
   }

   this.reader = new sensorType(config.options);
};

Sensor.prototype.read = function () {
   var sensor = this;
   return Q.fcall(function () {
      return this.reader.read();
   }.bind(this))
   .then(function (v) {
      sensor.value = v;
   });
};

module.exports = Sensor;