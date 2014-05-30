var Log = require('./log');
var gpio;

if (process.env.NODE_ENV === 'production') {
   var gpio = {
      setup: function (pin, cb) {
         var exported_pin = require('gpio')
         .export(pin, {
            ready: function () {
               process.on('exit', exported_pin.unexport);
               if (cb) cb();
            }
         });
         this.exported_pin = exported_pin;
      },
      write: function (pin, value, cb) {
         if (value) {
            this.exported_pin.set();
         }
         else {
            this.exported_pin.reset();
         }
      }
   };
}
else {
   gpio = {
      setup: function (p, d, cb) { if (cb) cb(); },
      write: function (p, v, cb) {
         //Log('GPIO: ' + p + ', Value: ' + v);
         if (cb) cb();
      }
   };
}

module.exports = gpio;