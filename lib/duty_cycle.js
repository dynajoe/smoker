var util = require('util');
var EventEmitter = require('events').EventEmitter;

var DutyCycle = function (full_duty) {
   this.full_duty = full_duty;
   this.handle = null;
};

util.extend(DutyCycle, EventEmitter);

DutyCycle.prototype.set = function (value) {
   if (this.current_value === value)
      return;

   this.current_value = value;
   var time_on = this.full_duty * value;
   var time_off = this.full_duty - time_on;

   if (this.handle) {
      clearTimeout(this.handle);
   }

   var run = function () {
      this.emit('on');
      this.handle = setTimeout(function () {
         this.handle = null;
         this.emit('off');
         this.handle = setTimeout(function () {
            this.handle = null;
            run();
         }.bind(this), time_off);
      }.bind(this), time_on);
   }.bind(this);

   run();
};

module.exports = DutyCycle;