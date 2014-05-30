var PidController = function (config) {
   this.set_point = config.set_point;
   this.p = config.p;
   this.i = config.i;
   this.d = config.d;
};

PidController.prototype._update = function (temperature, state) {
   var now = Date.now();
   var dt = now - state.time;
   var error = this.set_point - temperature;
   var derivative = (error - state.error) / dt;
   var new_integral = state.integral + error * dt;

   return {
      result: this.p * error + this.i * new_integral + this.d * derivative,
      integral: new_integral,
      time: now,
      error: error
   };
};

PidController.prototype.update = function (temperature, state) {
   if (typeof temperature === 'undefined') {
      return;
   }

   return this._update(temperature, state || {
      integral: 0,
      time: Date.now(),
      error: 0
   });
};

module.exports = PidController;