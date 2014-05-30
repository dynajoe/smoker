var logger = require('winston');
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

               var signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
               signals.forEach(function (s) {
                  process.on(s, function () {
                     exported_pin.unexport();
                     process.exit();
                  });
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
               logger.verbose('GPIO ' + pin + ' -> ' + v);
            }
         });
      },
   };
}

module.exports = gpio;