var Log = require('./log');
var gpio;

if (process.env.NODE_ENV === 'production') {
   var gpio = {
      export: function (pin, cb) {
         var exported_pin = require('gpio')
         .export(pin, {
            ready: function () {
               process.on('exit', exported_pin.unexport);
               cb(null, exported_pin);
            }
         });
      }
   };
}
else {
   gpio = {
      export: function (pin, cb) {
         cb(null, {
            set: function (v) {
               console.log('GPIO ' + pin + ' -> ' + v);
            }
         });
      },
   };
}

module.exports = gpio;