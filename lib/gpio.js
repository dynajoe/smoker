var fs = require('fs');
var Q = require('q');
var readFile = Q.denodeify(fs.readFile);
var writeFile = Q.denodeify(fs.writeFile);
var stat = Q.denodeify(fs.stat);
var logger = require('winston');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var exists = function (path) {
   return stat(path)
   .then(function () {
      return true;
   })
   .fail(function () {
      return false;
   });
};

var unexport = function (pin) {
   return writeFile('/sys/class/gpio/unexport', pin);
};

var gpio = {
   'export': function (pin, direction) {
      var pin_path = '/sys/class/gpio/gpio' + pin;
      var that = this;

      return exists(pin_path)
      .then(function (exists) {
         if (exists) {
            return unexport(pin);
         }
      })
      .then(function () {
         return writeFile('/sys/class/gpio/export', pin);
      })
      .then(function () {
         if (direction && direction.test(/^(out|in)$/i)) {
            return writeFile(pin_path + '/direction', direction.toLowerCase());
         } else if (direction) {
            throw 'Unrecognized direction: ' + direction + '. Expected "in" or "out".';
         }
      })
      .then(function () {
         that.emit('export', pin);

         return {
            set: function () {
               that.emit('set', pin);
               return writeFile(pin_path + '/value', '1')
               .then(function () {
                  that.emit('set', pin);
               });
            },
            unset: function () {
               return writeFile(pin_path + '/value', '0')
               .then(function () {
                  that.emit('unset', pin);
               });
            },
            unexport: function () {
               return unexport(pin)
               .then(function () {
                  that.emit('unexport', pin);
               });
            },
            read: function () {
               return readFile('/sys/class/gpio/unexport', pin)
               .then(function (d) {
                  return Number(d.toString()) === 1;
               });
            }
         };
      });
   }
};

if (process.env.NODE_ENV !== 'production') {
   gpio = {
      'export': function (pin) {
         var deferred = Q.defer();
         var that = this;
         that.emit('export', pin);

         var action = function (name) {
            return function () {
               var deferred_action = Q.defer();

               process.nextTick(function () {
                  that.emit(name, pin);
                  logger.info('GPIO ' + pin + ' ' + name);
                  deferred_action.resolve();
               });

               return deferred_action.promise;
            };
         };

         process.nextTick(function () {
            deferred.resolve({
               set: action('set'),
               unset: action('unset'),
               unexport: action('unexport'),
               read: action('read')
            });
         });

         return deferred.promise;
      }
   };
}

var GPIO = function () { };
util.inherits(GPIO, EventEmitter);
GPIO.prototype.export = gpio.export;
module.exports = new GPIO();