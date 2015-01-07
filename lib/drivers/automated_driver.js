var Sensors = require('../sensors');
var Logger = require('winston');
var SensorCollection = Sensors.SensorCollection;
var Sensor = Sensors.Sensor;
var serialPort = require('serialport');
var Q = require('q');

var AutomatedDriver = function (config) {
   this.config = config;
   this.data = [];
};

/* Driver interface */
AutomatedDriver.prototype.start = function() {
   var driver = this;
   var deferred = Q.defer();

   var port = new serialPort.SerialPort(driver.config.options.port, {
      baudrate: driver.config.options.baudrate,
      parser: serialPort.parsers.readline('\n')
   });

   port.on('open', function (err) {
      if (err) {
         deferred.fail();
         return Logger.error('Error opening serialport', err);
      }

      deferred.resolve();

      driver.portOpened = true;

      Logger.info('Serial Port Open', driver.config);
      port.write('A\n');

      port.on('data', function (data) {
         var parts = data.trim().split(',');
         driver.data = {
            temperature: Number(parts[1]),
            mode: parts[0] === "M" ? "Manual" : "Automatic",
            power: parts[2],
            battery: Number(parts[4]),
            target: Number(parts[5]),
            threshold: Number(parts[6]),
            time: +new Date(),
            raw: data
         };
      });
   });

   driver.port = port;

   return deferred.promise;
};

AutomatedDriver.prototype.heatOff = function() {
   return this.writeToPort('m')
   .then(this.writeToPort('-'));
};

/// Returns Array of sensors current value
AutomatedDriver.prototype.readSensors = function () {
   return Q.fcall(function () {
      return {
         main: {
            temperature: this.data.temperature,
            time: this.data.time
         }
      };
   }.bind(this));
};

AutomatedDriver.prototype.getInfo = function () {
   return Q.fcall(function () {
      return this.data;
   }.bind(this));
};

AutomatedDriver.prototype.getHistory = function (since) {
   return Q.fcall(function () {
      return [{
         sensor: 'main',
         data: this.data
      }];
   }.bind(this));
};

AutomatedDriver.prototype.getSensors = function () {
   return Q.fcall(function () {
      return [{
         name: 'main',
         type: 'usb',
         is_primary: true
      }];
   });
};

/* Commands */
AutomatedDriver.prototype.perform = function (command, args) {
   return Q.fcall(function () {
      if (!this[command]) {
         return;
      }
      this[command].apply(this, [].concat(args));
   }.bind(this));
};

AutomatedDriver.prototype.setThreshold = function (target) {
   return this.writeToPort('t' + parseInt(Number(target)));
};

AutomatedDriver.prototype.setThreshold = function (target) {
   return this.writeToPort('s' + parseInt(Number(target)));
};

AutomatedDriver.prototype.writeToPort = function (commands) {
   return Q.nfcall(this.port.write, data + '\n');
};

module.exports = AutomatedDriver;