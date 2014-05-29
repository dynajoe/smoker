var sensors = require('./sensors');
var SensorCollection = sensors.SensorCollection;
var Sensor = sensors.Sensor;
var EventEmitter = require('events').EventEmitter;
var Log = require('./log');
var gpio = require('./gpio');
var util = require('util');
var PowerController = require('./power_controller');
var PidController = require('./pid_controller');

var Smoker = function (config) {
   this.data = [];
   this.config = config;

   // control mechanisms
   this.power_controller = new PowerController(config.power_pin);
   this.pid_controller = new PidController(config.primary_sensor.pid_config);

   // sensors
   this.primary_sensor = new Sensor(config.primary_sensor);
   this.sensors = new SensorCollection(config.sensors.map(function (s) {
      return new Sensor(s);
   }).concat(this.primary_sensor));

   var smoker = this;

   this.states = {
      on: {
         enter: function (cb) {
            smoker.powerOn(function (err) {
               return cb(!err);
            });
         },
         update: function (data) {
            if (this.temperature() > smoker.config.target_temp + 3) {
               smoker.setState('off');
            }
         }
      },
      off: {
         enter: function (cb) {
            smoker.powerOff(function (err) {
               return cb(!err);
            });
         },
         update: function (data) {
            if (this.temperature() <= smoker.config.target_temp) {
               smoker.setState('on');
            }
         }
      },
      idle: {
         update: function () {
            this.setState('off');
         }
      }
   };

   this.state = 'idle';
};

util.inherits(Smoker, EventEmitter);

Smoker.prototype.setTargetTemp = function (value) {
   this.config.target_temp = value;
};

Smoker.prototype.temperature = function () {
   var data = this.data[this.data.length - 1];
   return data[this.primary_sensor.name].value;
};

Smoker.prototype.start = function () {
   var smoker = this;

   if (smoker.interval_handle) {
      clearInterval(smoker.interval_handle);
   }

   return smoker.power_controller.setup()
   .then(function () {
      smoker.interval_handle = setInterval(function () {
         smoker.sensors.read()
         .then(function (data) {
            smoker.addData(data);
         })
         .fail(Log);
      }, smoker.config.poll_interval);
   });
};

Smoker.prototype.addData = function (data) {
   this.data.push(data);
   this.emit('data', data);
};

Smoker.prototype.updateState = function (data) {
   this.states[this.state].update.call(this, data);
};

Smoker.prototype.setState = function (state, tries) {
   if (this.state === state)
      return;

   Log('Setting state: ' + state);

   var new_state = this.states[state];
   var current_state = this.states[this.state];

   var exit = current_state.exit;

   if (!exit) {
      exit = function (cb) {
         cb(true);
      };
   }

   var smoker = this;

   var done = function (success) {
      if (!success) {
         tries = (tries || 0) + 1;
         Log('Failed to set state. Current: ' + smoker.state + ", New: " + state + ", Tries: " + tries);

         if (tries < 5) {
            setTimeout(function () {
               return smoker.setState(state, tries);
            }, 1000);
         }
      }
      else {
         Log('New state: ' + state);
         smoker.state = state;
      }
   };

   exit.call(smoker, function (success) {
      if (!success) return done(false);
      smoker.state = null;
      new_state.enter.call(smoker, done);
   });
};

module.exports = Smoker;