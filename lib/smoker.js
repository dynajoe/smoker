var sensors = require('./sensors');
var SensorCollection = sensors.SensorCollection;
var Sensor = sensors.Sensor;
var EventEmitter = require('events').EventEmitter;
var logger = require('winston');
var Util = require('util');
var SmokerBrains = require('./smoker_brains');
var Q = require('q');
var ApplicationEvents = require('./application_events');

var Smoker = function (config) {
   EventEmitter.call(this);

   this.data = [];
   this.config = config;

   this.brains = new SmokerBrains(config);

   this.sensors = new SensorCollection(
      config.sensors.map(function (s) {
         return new Sensor(s);
      })
   );
};

Util.inherits(Smoker, EventEmitter);

Smoker.prototype.setTargetTemp = function (value) {
   this.config.target_temp = value;
   ApplicationEvents.emit('smoker:target-temp', value);
};

Smoker.prototype.setDutyCycle = function (value) {
   this.config.duty_cycle = value;
   this.brains.setDutyCycle(value);
};

Smoker.prototype.getSensors = function () {
   return this.sensors.sensors;
};

Smoker.prototype.stop = function () {
   return Q.fcall(clearInterval, this.interval_handle);
};

Smoker.prototype.reset = function () {
   logger.info('Resetting smoker');
   this.started_on = new Date();
   this.data = [];
};

Smoker.prototype.start = function () {
   var smoker = this;
   logger.info('Starting smoker.');

   return Q.fcall(function () {
      if (smoker.started_on) {
         logger.info('Already started.');
         return;
      }

      smoker.started_on = new Date();

      var setup = smoker.brains.setup();

      setup.then(function () {
         logger.info('Brains setup.');

         smoker.interval_handle = setInterval(function () {
            logger.info('Reading sensors.');
            smoker.sensors.read()
            .then(function (data) {
               logger.info('Read successful.', data);
               smoker.addData({
                  sensors: data,
                  state: smoker.brains.info().state,
                  time: Date.now()
               });
            })
            .fail(function (e) {
               logger.error('Unable to read sensors.', e, e.stack);
            });
         }, smoker.config.poll_interval);
      });

      return setup;
   });
};

Smoker.prototype.addData = function (data) {
   this.data.push(data);
   this.brains.update(data.sensors);
   this.emit('data', data);
};

module.exports = Smoker;