var Log = require('./log');
var gpio;

if (process.env.NODE_ENV === 'production') {
   gpio = {
      export: function (pin, cb) {
         var exported_pin = require('gpio')
         .export(pin, {
            ready: function () {
               process.on('exit', function () {
                  exported_pin.unexport();
               });

               process.on('SIGINT', function () {
                  process.exit();
               });

               process.on('SIGTERM', function () {
                  process.exit();
               });

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