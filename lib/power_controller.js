var gpio = require('./gpio');
var Q = require('q');
var logger = require('winston');

var PowerController = function (pin) {
   this.pin = pin;
   this.state = null;
};

PowerController.prototype.setup = function () {
   logger.info('Setting up PowerController. Pin: ' + this.pin);

   var deferred = Q.defer();
   var pc = this;

   if (!pc.is_setup) {
      gpio.export(pc.pin, function (err, exported_pin) {
         if (err) return deferred.reject(err);
         logger.info('Export success');
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
   this.state = 'on';
};

PowerController.prototype.powerOff = function () {
   this.exported_pin.set(0);
   this.state = 'off';
};

module.exports = PowerController;