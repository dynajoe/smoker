var gpio = require('./gpio');
var Q = require('q');

var PowerController = function (pin) {
   this.pin = pin;
};

PowerController.prototype.setup = function () {
   var deferred = Q.defer();
   var pc = this;

   if (pc.is_setup) {
      gpio.setup(pc.pin, gpio.DIR_OUT, function (err) {
         if (err) return deferred.reject(err);
         pc.is_setup = true;
         deferred.resolve();
      });
   }
   else {
      deferred.resolve();
   }

   return deferred.promise;
};

PowerController.prototype.powerOn = function (cb) {
   gpio.write(this.pin, true);
};

PowerController.prototype.powerOff = function () {
   gpio.write(this.pin, false);
};

module.exports = PowerController;