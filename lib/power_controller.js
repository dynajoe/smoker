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

   if (!pc.is_setup) {
      return gpio.export(pc.pin)
      .then(function (exported_pin) {
         logger.info('Export success');
         pc.is_setup = true;
         pc.exported_pin = exported_pin;
      })
      .fail(function (e) {
         logger.error('Export failed', e);
      });
   }
};

PowerController.prototype.powerOn = function () {
   logger.info('PowerController: power on');
   return this.exported_pin.set()
   .then(function () {
      this.state = 'on';
   })
   .fail(function (e) {
      logger.error('Failed to power on', e);
   });
};

PowerController.prototype.powerOff = function () {
   logger.info('PowerController: power off');
   this.exported_pin.unset()
   .then(function () {
      this.state = 'off';
   })
   .fail(function (e) {
      logger.error('Failed to power off', e);
   });
};

module.exports = PowerController;