var logger = require('winston');

var PidController = function (config) {
   this.range = config.range;
   this.p = config.p;
   this.i = config.i || 0;
   this.d = config.d || 0;
};

PidController.prototype._update = function (temperature, set_point, state) {
   if (typeof temperature === 'undefined') {
      return;
   }

   var now = Date.now();
   var dt = (now - state.time) / 1000; // seconds
   var error = set_point - temperature;
   var derivative = (error - state.error) / dt;
   var new_integral = set_point === state.set_point ?
      (state.integral + error * dt) : error * dt;
   var max_temp = set_point + Math.abs(this.range);
   var min_temp = set_point - Math.abs(this.range);
   var in_lower_range = temperature >= min_temp;
   var in_upper_range = temperature <= max_temp;
   var in_range = in_lower_range && in_upper_range;

   // Negative infinity for OFF
   // Positive infinity for ON
   var result = in_range ?
      (this.p * error + this.i * new_integral + this.d * derivative)
      : (in_lower_range ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY);

   new_integral = Math.abs(new_integral) > 10 ? (10 * (new_integral < 0 ? -1 : 1)) : new_integral;

   return {
      result: Math.abs(result) > 20 ? (20 * (result < 0 ? -1 : 1)) : result,
      integral: in_range ? new_integral : 0,
      time: now,
      error: error,
      set_point: set_point,
      in_range: in_range
   };
};

PidController.prototype.update = function (temperature, set_point, state) {
   return this._update(temperature, set_point, state || {
      integral: 0,
      time: Date.now(),
      error: 0,
      set_point: set_point
   }) || {};
};

module.exports = PidController;