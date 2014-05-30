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
   if (this.current_value === value)
      return;

   logger.info('Switched duty cycle: %d to %d.', this.current_value, value);

   if (this.handle) {
      clearTimeout(this.handle);
      this.handle = null;
   }

   this.current_value = value;

   var time_on = this.full_duty * value;

   if (time_on < this.min_duty) {
      logger.info('Ignoring actual cycle value (%d). Duty time (%d) is below threshold. Considering off.', value, time_on);
      this.emit('off');
   } else if (time_on > this.max_duty) { 
      logger.info('Ignoring actual cycle value (%d). Duty time (%d) is above threshold. Considering on.', value, time_on);
      this.emit('on');
   } else {
      this._run(time_on, this.full_duty - time_on)
   }
};

DutyCycler.prototype._run = function (time_on, time_off) {
   var cycler = this;
   var run = function () {
      cycler.emit('on');
      cycler.handle = setTimeout(function () {
         cycler.handle = null;
         cycler.emit('off');
         cycler.handle = setTimeout(function () {
            cycler.handle = null;
            run();
         }, time_off);
      }, time_on);
   };

   run();  
}

module.exports = DutyCycler;