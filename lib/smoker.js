var sensors = require('./sensors');
var SensorCollection = sensors.SensorCollection;
var Sensor = sensors.Sensor;
var EventEmitter = require('events').EventEmitter;
var logger = require('winston');
var Util = require('util');
var SmokerBrains = require('./smoker_brains');

var Smoker = function (config, db) {
   EventEmitter.call(this);

   this.db = db;
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

Smoker.prototype.stop = function () {
   clearInterval(this.interval_handle);
   this._flush_data_buffer();
};

Smoker.prototype.reset = function () {
   logger.info('Resetting smoker');
   this._flush_data_buffer();
   this.started_on = new Date();
   this.data = [];
   this.data_buffer = [];
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
            smoker.addData(data);
         })
         .fail(function (e) {
            logger.error('Unable to read sensors' + e);
         });
      }, smoker.config.poll_interval);
   });
};

Smoker.prototype._flush_data_buffer = function () {
   var smoker = this;

   logger.info('Persisting %d data points.', smoker.data_buffer.length);

   var buffer = smoker.data_buffer;

   smoker.db.collection('data', function (err, collection) {
      collection.insert(smoker.data_buffer.map(function (d) {
         d.session = smoker.started_on;
         return d;
      }), function (err) {
         if (err) {
            logger.error(err);
         }
      });
      smoker.data_buffer = [];
   });
};

Smoker.prototype.addData = function (data) {
   this.data.push(data);
   this.brains.update(data);
   this.emit('data', data);

   this.data_buffer = this.data_buffer || [];
   this.data_buffer.push(data);

   if (this.data_buffer.length >= this.config.data_buffer_size) {
      this._flush_data_buffer();
   }
};

module.exports = Smoker;