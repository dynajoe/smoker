var util = require('util');
var EventEmitter = require('events').EventEmitter;
var logger = require('winston');

var DutyCycler = function (full_duty) {
   EventEmitter.call(this);
   this.full_duty = full_duty || 10000;
   this.min_duty = 2000;
   this.max_duty = 8000;
   this.handle = null;
};

util.inherits(DutyCycler, EventEmitter);

DutyCycler.prototype.setCycle = function (value) {
   if (this.current_value === value || this.pending_value === value)
      return;

   this.pending_value = value;

   var set_cycle = function () {
      logger.info('Switched duty cycle: %d to %d.', this.current_value, value);
      var time_on = this.full_duty * value;
      this.current_value = value;
      this.pending_value = null;
      this.on_complete = null;
      this._set_new_cycle(time_on, value);
   }.bind(this);

   if (this.handle) {
      this.on_complete = set_cycle;
   } else {
      set_cycle();
   }
};

DutyCycler.prototype._set_new_cycle = function (time_on, value) {
   if (time_on < this.min_duty) {
      logger.info('Ignoring actual cycle value (%d). Duty time (%d) is below threshold. Considering off.', value, time_on);
      this.emit('off');
      this.handle = null;
   } else if (time_on > this.max_duty) {
      logger.info('Ignoring actual cycle value (%d). Duty time (%d) is above threshold. Considering on.', value, time_on);
      this.emit('on');
      this.handle = null;
   } else {
      this._run(time_on, this.full_duty - time_on);
   }
};

DutyCycler.prototype._run = function (time_on, time_off) {
   var cycler = this;

   if (cycler.handle) {
      clearTimeout(cycler.handle);
   }

   var run = function () {
      cycler.emit('on');
      cycler.handle = setTimeout(function () {
         cycler.emit('off');
         cycler.handle = setTimeout(function () {
            cycler.handle = null;
            if (cycler.on_complete) {
               cycler.on_complete();
            } else {
               run();
            }
         }, time_off);
      }, time_on);
   };

   run();
};

module.exports = DutyCycler;