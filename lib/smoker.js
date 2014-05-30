var sensors = require('./sensors');
var SensorCollection = sensors.SensorCollection;
var Sensor = sensors.Sensor;
var EventEmitter = require('events').EventEmitter;
var Log = require('./log');
var Util = require('util');
var SmokerBrains = require('./smoker_brains');

var Smoker = function (config) {
   EventEmitter.call(this);

   this.data = [];
   this.config = config;

   this.brains = new SmokerBrains(config);

   this.primary_sensor = new Sensor(config.primary_sensor, true);
   this.sensors = new SensorCollection(
      [this.primary_sensor].concat(config.sensors.map(function (s) {
         return new Sensor(s);
      })));
};

Util.inherits(Smoker, EventEmitter);

Smoker.prototype.setTargetTemp = function (value) {
   this.config.target_temp = value;
};

Smoker.prototype.getSensors = function () {
   return this.sensors.sensors;
};

Smoker.prototype.start = function () {
   Log('Starting smoker');
   var smoker = this;

   if (smoker.interval_handle) {
      clearInterval(smoker.interval_handle);
   }

   return this.brains.setup()
   .then(function () {
      smoker.interval_handle = setInterval(function () {
         Log('Reading sensors');
         smoker.sensors.read()
         .then(function (data) {
            Log('Read successful');
            smoker.addData(data);
         })
         .fail(Log);
      }, smoker.config.poll_interval);
   });
};

Smoker.prototype.addData = function (data) {
   this.data.push(data);
   this.brains.update(data);
   this.emit('data', data);
};

module.exports = Smoker;