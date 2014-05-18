var SensorReader;

if (process.env.NODE_ENV === 'production') {
   SensorReader = require('max6675-raspberry-pi');
}
else {
   SensorReader = function () {
      this.read = function (cb) {
         return 200 + parseInt(Math.random() * 50, 10);
      };
   };
}

var Sensor = function Sensor (config) {
   this.reader = new SensorReader(config);
   this.name = config.name;
   this.is_primary = !!config.primary;
};

Sensor.prototype.getTemperature = function (cb) {
   process.nextTick(function () {
      cb(null, this.reader.read());
   }.bind(this));
};

module.exports = Sensor;