var util = require('util');
var EventEmitter = require('events').EventEmitter;
var logger = require('winston');

var DutyCycler = function (full_duty) {
   EventEmitter.call(this);
   this.full_duty = full_duty;
   this.min_duty = this.full_duty * 0.20;
   this.max_duty = this.full_duty * 0.80;
};

util.inherits(DutyCycler, EventEmitter);

DutyCycler.prototype.setCycle = function (value) {
   this.value = value;

   logger.info('cycle ' + value);

   if (value <= 0) {
      return this._stay_off();
   }
   else if (value >= 1) {
      return this._stay_on();
   }

   var new_cycle = value * this.full_duty;

   if (new_cycle > this.max_duty) new_cycle = this.max_duty;
   if (new_cycle < this.min_duty) new_cycle = this.min_duty;

   this.on_time = new_cycle;
   this.off_time = this.full_duty - new_cycle;

   if (!this.handle) {
      this._cycle_on();
   }
};

DutyCycler.prototype._stay_on = function () {
   clearTimeout(this.handle);
   this.handle = null;
   this.emit('on');
};

DutyCycler.prototype._stay_off = function () {
   clearTimeout(this.handle);
   this.handle = null;
   this.emit('off');
};

DutyCycler.prototype._cycle_on = function () {
   this.emit('on');
   logger.info('On for ' + this.on_time);
   this.handle = setTimeout(this._cycle_off.bind(this), this.on_time);
};

DutyCycler.prototype._cycle_off = function () {
   this.emit('off');
   logger.info('Off for ' + this.off_time);
   this.handle = setTimeout(this._cycle_on.bind(this), this.off_time);
};

module.exports = DutyCycler;