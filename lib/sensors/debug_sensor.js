var gpio = require('../gpio');
var direction = 1;

gpio.on('set', function () {
   direction = 1;
});

gpio.on('unset', function () {
   direction = -1;
});

var DebugSensor = function (config) {
   this.value = config.start_temp;
   this.stepSize = config.step_size;
};

DebugSensor.prototype.read = function () {
   this.value += direction * this.step_size;
   return this.value;
};

module.exports = DebugSensor;