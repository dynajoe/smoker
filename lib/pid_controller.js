var PidController = function (set_point, p, i, d) {
   this.set_point = set_point;
   this.p = p;
   this.i = i;
   this.d = d;
};

PidController.prototype._update = function (value, state) {
   var now = Date.now();
   var dt = now - state.time;
   var error = this.set_point - value;
   var derivative = (error - state.error) / dt;
   var new_integral = state.integral + error * dt;

   return {
      result: this.p * error + this.i * new_integral + this.d * derivative,
      integral: new_integral,
      time: now,
      error: error
   };
};

PidController.prototype.update = function (value, state) {
   return this._update(value, state || {
      integral: 0,
      time: 0,
      error: 0
   });
};

module.exports = PidController;