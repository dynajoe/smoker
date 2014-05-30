var _ = require('underscore');
var CycleMap = require('./cycle_map');
var Range = require('./range');
var DutyCycler = require('./duty_cycler');
var PowerController = require('./power_controller');
var PidController = require('./pid_controller');

var SmokerBrains = function (config) {
   this.power_controller = new PowerController(config.power_pin);
   this.pid_controller = new PidController(config.primary_sensor.pid_config);
   this.pid_state = null;

   this.cycle_map = new CycleMap([
      { range: new Range(0, Number.POSITIVE_INFINITY, true, true), cycle: 0.5 },
      { range: new Range(Number.NEGATIVE_INFINITY, 0), cycle: 0.25 }
   ], function (r) {
      return r ? r.cycle : 0;
   });

   this.duty_cycler = new DutyCycler(10000);
   this.duty_cycler.on('off', function () { this.power_controller.powerOff(); }.bind(this));
   this.duty_cycler.on('on', function () { this.power_controller.powerOn(); }.bind(this));
};

SmokerBrains.prototype.setup = function () {
   return this.power_controller.setup();
};

SmokerBrains.prototype.update = function (sensor_data) {
   var primary_sensor = _.find(sensor_data, function (s) {
      return s.is_primary;
   });

   if (!primary_sensor) {
      return;
   }

   this.pid_state = this.pid_controller.update(primary_sensor.value, this.pid_state);
   var duty_cycle = this.cycle_map.cycleAt(this.pid_state.result);
   this.duty_cycler.setCycle(duty_cycle);
};

SmokerBrains.prototype.info = function () {
   return {
      pid_state: this.pid_state,
      duty_cycle: this.duty_cycler.current_value,
      state: this.power_controller.state
   };
};

module.exports = SmokerBrains;