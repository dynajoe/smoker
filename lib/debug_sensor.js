var gpio = require('./gpio');
var startTemp = 230;
var stepSize = 2;
var direction = 1;

gpio.on('set', function () {
   direction = 1;
});

gpio.on('unset', function () {
   direction = -1;
});

module.exports = function () {
   this.value = startTemp;
   this.read = function () {
      this.value += direction * stepSize;
      return this.value;
   };
};