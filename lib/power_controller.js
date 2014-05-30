var gpio = require('./gpio');
var Q = require('q');

var PowerController = function (pin) {
   this.pin = pin;
};

PowerController.prototype.setup = function () {
   var deferred = Q.defer();
   var pc = this;

   if (!pc.is_setup) {
      gpio.export(pc.pin, function (err, exported_pin) {
         if (err) return deferred.reject(err);
         pc.is_setup = true;
         pc.exported_pin = exported_pin;
         deferred.resolve();
      });
   }
   else {
      deferred.resolve();
   }

   return deferred.promise;
};

PowerController.prototype.powerOn = function (cb) {
   this.exported_pin.set(1);
};

PowerController.prototype.powerOff = function () {
   this.exported_pin.set(0);
};

module.exports = PowerController;