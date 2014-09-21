var sensors = require('./sensors');
var SensorCollection = sensors.SensorCollection;
var Sensor = sensors.Sensor;
var EventEmitter = require('events').EventEmitter;
var logger = require('winston');
var Util = require('util');
var SmokerBrains = require('./smoker_brains');
var q = require('q');

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

Smoker.prototype.setDutyCycle = function (value) {
   this.config.duty_cycle = value;
   this.brains.setDutyCycle(value);
};

Smoker.prototype.getSensors = function () {
   return this.sensors.sensors;
};

Smoker.prototype.stop = function () {
   var deferred = q.defer();
   clearInterval(this.interval_handle);
   deferred.resolve();
   return deferred.promise;
};

Smoker.prototype.reset = function () {
   logger.info('Resetting smoker');
   this.started_on = new Date();
   this.data = [];
};

Smoker.prototype.start = function () {
   logger.info('Starting smoker');
   this.started_on = new Date();

   var smoker = this;

   if (smoker.interval_handle) {
      clearInterval(smoker.interval_handle);
   }

   return this.brains.setup()
   .then(function () {
      smoker.interval_handle = setInterval(function () {
         smoker.sensors.read()
         .then(function (data) {
            logger.verbose('Read successful');
            smoker.addData({
               sensors: data,
               state: smoker.brains.info().state,
               time: Date.now()
            });
         })
         .fail(function (e) {
            logger.error('Unable to read sensors', e, e.stack);
         });
      }, smoker.config.poll_interval);
   });
};

Smoker.prototype.addData = function (data) {
   this.data.push(data);
   this.brains.update(data.sensors);
   this.emit('data', data);
};

module.exports = Smoker;