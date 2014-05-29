var Log = require('./log');
var gpio;

if (process.env.NODE_ENV === 'production') {
   gpio = require('rpi-gpio');
}
else {
   gpio = {
      setup: function (p, d, cb) { cb(); },
      write: function (p, v, cb) {
         Log('GPIO: ' + p + ', Value: ' + v);
         cb();
      }
   };
}

module.exports = gpio;