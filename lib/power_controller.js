var gpio = require('./gpio');
var Q = require('q');
var logger = require('winston');

var PowerController = function (pin) {
   this.pin = pin;
   this.state = null;
};

PowerController.prototype.setup = function () {
   logger.info('Setting up PowerController. Pin: ' + this.pin);
   var pc = this;

   return Q.fcall(function () {
      if (pc.is_setup) {
         return;
      }

      return gpio.export(pc.pin)
      .then(function (exported_pin) {
         logger.info('Export success.');
         pc.is_setup = true;
         pc.exported_pin = exported_pin;
      })
      .fail(function (e) {
         logger.error('Export failed.', e);
      });
   });
};

PowerController.prototype.powerOn = function () {
   logger.info('PowerController: power on');
   if (!this.is_setup) return;

   var pc = this;
   return this.exported_pin.set()
   .then(function () {
      logger.info('Powered on');
      pc.state = 'on';
   })
   .fail(function (e) {
      logger.error('Failed to power on', e);
   });
};

PowerController.prototype.powerOff = function () {
   logger.info('PowerController: power off');
   if (!this.is_setup) return;

   var pc = this;

   return this.exported_pin.unset()
   .then(function () {
      logger.info('Powered off');
      pc.state = 'off';
   })
   .fail(function (e) {
      logger.error('Failed to power off', e);
   });
};

module.exports = PowerController;