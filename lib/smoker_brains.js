var _ = require('underscore');
var CycleMap = require('./cycle_map');
var Range = require('./range');
var DutyCycler = require('./duty_cycler');
var PowerController = require('./power_controller');
var PidController = require('./pid_controller');
var logger = require('winston');

var SmokerBrains = function (config) {
   this.config = config;
   this.power_controller = new PowerController(config.power_pin);
   this.pid_controller = new PidController(config.pid);

   this.cycle_map = new CycleMap([
      { range: new Range(Number.NEGATIVE_INFINITY, 0), cycle: 0 },
      { range: new Range(0, 2, false, true), cycle: 0.25 },
      { range: new Range(2, 5, false, true), cycle: 0.50 },
      { range: new Range(5, 10, false, true), cycle: 0.75 },
      { range: new Range(10, Number.POSITIVE_INFINITY, false, true), cycle: 1 }
   ],
   function (r) {
      return r ? r.cycle : 0;
   });

   this.pid_cycle_map = new CycleMap([
      { range: new Range(Number.NEGATIVE_INFINITY, -2), cycle: 0 },
      { range: new Range(0, 5, false, true), cycle: 0.25 },
      { range: new Range(5, 10, false, true), cycle: 0.50 },
      { range: new Range(10, 15, false, true), cycle: 0.75 },
      { range: new Range(15, Number.POSITIVE_INFINITY, false, true), cycle: 1 }
   ],
   function (r) {
      return r ? r.cycle : 0;
   });

   this.duty_cycler = new DutyCycler(config.duty_cycle);

   this.duty_cycler.on('off', function () {
      this.power_controller.powerOff();
   }.bind(this));

   this.duty_cycler.on('on', function () {
      this.power_controller.powerOn();
   }.bind(this));
};

SmokerBrains.prototype.setup = function () {
   logger.info('Setting up SmokerBrains.', this.config);
   return this.power_controller.setup()
      .fail(function (e) {
         logger.error('Unable to setup power controller', e);
      });
};

SmokerBrains.prototype.update = function (sensor_data) {
   var primary_sensor = _.find(sensor_data, function (s) {
      return s.is_primary;
   });

   if (!primary_sensor) {
      return;
   }

   this.current_temp = primary_sensor.value;
   this.pid_state = this.pid_controller.update(this.current_temp, this.config.target_temp, this.pid_state);
   var duty_cycle = this.cycle_map.cycleAt(this.config.target_temp - this.current_temp);
   var pid_duty_cycle = this.pid_cycle_map.cycleAt(this.pid_state.result);
   this.duty_cycler.setCycle(pid_duty_cycle);
};

SmokerBrains.prototype.info = function () {
   return {
      duty_cycle: this.duty_cycler.current_value,
      state: this.power_controller.state,
      target_temp: this.config.target_temp,
      current_temp: this.current_temp,
      pid_state: this.pid_state
   };
};

module.exports = SmokerBrains;