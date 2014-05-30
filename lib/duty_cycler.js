var util = require('util');
var EventEmitter = require('events').EventEmitter;

var DutyCycler = function (full_duty, min_duty) {
   EventEmitter.call(this);
   this.full_duty = full_duty || 10000;
   this.min_duty = min_duty || 2000;
   this.handle = null;
};

util.inherits(DutyCycler, EventEmitter);

DutyCycler.prototype.setCycle = function (value) {
   if (this.current_value === value)
      return;

   this.current_value = value;
   var time_on = Math.max(this.full_duty * value, this.min_duty);
   var time_off = Math.max(this.full_duty - time_on, this.min_duty);

   if (this.handle) {
      clearTimeout(this.handle);
   }

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
};

module.exports = DutyCycler;