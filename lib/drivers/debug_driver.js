var Logger = require('winston');
var Q = require('q');

var DebugDriver = function (config) {
   this.config = config;
   this.data = null;
   this.log = [];
   this.commands = [{
      command: 'setTarget',
      display_name: 'Target Temperature'
   }, {
      command: 'setTreshold',
      display_name: 'Threshold'
   }];
};

/* Driver interface */
DebugDriver.prototype.start = function() {
   var driver = this;
   return Q.fcall(function () {
      setInterval(function () {
         driver.data = {
            name: 'main',
            is_primary: true,
            type: 'usb',
            temperature: 101,
            power: 'on',
            target: 102,
            time: +new Date()
         };

         driver.log.push({
            sensors: {
               main: driver.data
            }
         });
      }, 1000);
   });
};

DebugDriver.prototype.heatOff = function() {
   return this.writeToPort('m')
   .then(this.writeToPort('-'));
};

/// Returns Array of sensors current value
DebugDriver.prototype.readSensors = function () {
   return Q.fcall(function () {
      return {
         main: {
            temperature: this.data.temperature,
            time: this.data.time
         }
      };
   }.bind(this));
};

DebugDriver.prototype.getInfo = function () {
   return Q.fcall(function () {
      return this.data;
   }.bind(this));
};

DebugDriver.prototype.getHistory = function (since) {
   return Q.fcall(function () {
      return this.log;
   }.bind(this));
};

DebugDriver.prototype.getSensors = function () {
   return Q.fcall(function () {
      return [this.data];
   }.bind(this));
};

DebugDriver.prototype.getCommands = function () {
   return Q.fcall(function () {
      return this.commands;
   }.bind(this));
};

/* Commands */
DebugDriver.prototype.perform = function (command, parameter) {
   return Q.fcall(function () {
      console.log(command, parameter);
   }.bind(this));
};

module.exports = DebugDriver;