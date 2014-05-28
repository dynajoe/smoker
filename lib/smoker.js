var Sensor = require('./sensors');
var EventEmitter = require('events').EventEmitter;
var gpio;

if (process.env.NODE_ENV === 'production') {
   gpio = require('rpi-gpio');
}
else {
   gpio = {
      setup: function (p, d, cb) { cb(); },
      write: function (p, v, cb) {
         console.log('GPIO: ' + p + ', Value: ' + v);
         cb();
      }
   };
}

var Log = function (message) {
   console.log(message);
};

var Smoker = function (config, sensors) {
   this.data = [];
   this.config = config;
   this.target_temp = config.target_temp;

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

Smoker.prototype = Object.create(EventEmitter.prototype);

Smoker.prototype.constructor = Smoker;

Smoker.prototype.temperature = function () {
   var data = this.data[this.data.length - 1];
   return data[this.primary_sensor.name].value;
};

Smoker.prototype.powerOn = function (cb) {
   this.setPowerPin(true, function (err) {
      if (err) return cb(err);
      this.poweredOn = true;
      cb();
   }.bind(this));
};

Smoker.prototype.powerOff = function (cb) {
   this.poweredOn = false;
   this.setPowerPin(false, function (err) {
      if (err) return cb(err);
      this.poweredOn = false;
      cb();
   });
};

Smoker.prototype.setPowerPin = function (value, cb) {
   gpio.write(this.config.power_pin, !!value, cb);
};

Smoker.prototype.initialize = function (cb) {
   if (this.initialized || this.initializing)
      return cb();

   var handleError = function (err) {
      this.initializing = false;
      cb(err);
   }.bind(this);

   if (!this.config.sensors || this.config.sensors.length === 0)
      return handleError('No sensors defined');

   this.sensors = [];

   for (var i = 0; i < this.config.sensors.length; i++) {
      var new_sensor = new Sensor(this.config.sensors[i]);

      if (new_sensor.is_primary && this.primary_sensor) {
         return handleError('More than one primary sensor defined');
      }
      else if (new_sensor.is_primary) {
         this.primary_sensor = new_sensor;
      }

      this.sensors.push(new_sensor);
   }

   if (!this.primary_sensor)
      return handleError('There must be a primary sensor defined!');

   gpio.setup(this.config.power_pin, gpio.DIR_OUT, function (err) {
      if (err) return handleError(err);
      this.initializing = false;
      this.initialized = true;
      cb();
   }.bind(this));
};

Smoker.prototype.start = function () {
   if (!this.initialized)
      return false;

   Log('Starting smoker');

   var smoker = this;

   this.intervalHandle = setInterval(function () {
      smoker.readSensors(function (err, data) {
         smoker.updateState(data);
      });
   }, this.config.poll_interval);

   return true;
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

Smoker.prototype.readSensors = function (cb) {
   var sensor_count = this.sensors.length;
   var values = { };
   var time = new Date().getTime();
   var result_count = 0;
   var smoker = this;

   var callback = function (sensor) {
      return function (err, value) {
         if (err) return cb(err);
         result_count++;

         values[sensor.name] = {
            time: time,
            value: value,
            name: sensor.name,
            goal: sensor.goal
         };

         if (result_count === sensor_count) {
            smoker.data.push(values);
            smoker.emit('data', values);
            cb(null, values);
         }
      };
   };

   for (var i = 0; i < sensor_count; i++) {
      this.sensors[i].getTemperature(callback(this.sensors[i]));
   }
};

module.exports = Smoker;