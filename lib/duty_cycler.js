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
   var new_cycle = value * this.full_duty;

   if (new_cycle > this.max_duty) new_cycle = this.max_duty;
   if (new_cycle < this.min_duty) new_cycle = this.min_duty;

   this.on_time = new_cycle;
   this.off_time = this.full_duty - new_cycle;

   if (!this.handle) {
      this._cycle_on();
   }
};

DutyCycler.prototype._cycle_on = function () {
   this.emit('on');
   this.handle = setTimeout(this._cycle_off.bind(this), this.on_time);
};

DutyCycler.prototype._cycle_off = function () {
   this.emit('off');
   this.handle = setTimeout(this._cycle_on.bind(this), this.off_time);
};

module.exports = DutyCycler;