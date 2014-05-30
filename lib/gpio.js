var Log = require('./log');
var gpio;

if (process.env.NODE_ENV === 'production') {
   gpio = {
      export: function (pin, cb) {
         var exported_pin = require('gpio')
         .export(pin, {
            ready: function () {
               process.on('exit', exported_pin.unexport);
               cb(null, {
                  set: function (v) {
                     exported_pin.set(v ? 1 : 0);
                  }
               });
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