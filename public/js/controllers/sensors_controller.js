(function () {
'use strict';

var appControllers = angular.module('appControllers');

var updateSensors = function ($scope, smoker) {
   var sensors = smoker.data.sensors;
   var target = smoker.info.target;
   var power = smoker.info.power;

   for (var i = 0; i < $scope.sensors.length; i++) {
      var sensor = $scope.sensors[i];
      var latest_data = sensors[sensor.name];

      sensor.data.push(latest_data);
      if (sensor.data.length > 300) {
         sensor.data.shift();
      }

      if (sensor.is_primary) {
         sensor.power = power;
         sensor.target = target;
      }

      sensor.rate = latest_data.rate > 0 ? ('+' + latest_data.rate) : latest_data.rate;
      sensor.temp = Number(latest_data.temperature);
   }
};

appControllers.controller(
   'SensorsController', ['$scope', 'SmokerService', 'amMoment',
   function ($scope, SmokerService, amMoment) {
      var time_window = 5 * 60 * 1000;

      $scope.reset = function () {
         SmokerService.reset(function (started_on) {
            $scope.started_on = started_on;
            $scope.sensors.forEach(function (s) {
               s.data.length = 0;
            });
         });
      };

      $scope.form = {};

      $scope.sendCommands = function () {
         for (var k in $scope.form) {
            SmokerService.perform(k, $scope.form[k], function () {

            });
         }

         $scope.form = {};
      };

      $scope.power_data = [];

      SmokerService.initialize(function (sensors, commands, history) {
         $scope.sensors = sensors;
         $scope.commands = commands;

         var primarySensor = sensors.filter(function (s) {
            return s.is_primary;
         }).first();

         $scope.power_data = getPowerData(primarySensor, history.data);

         $scope.sensors.forEach(function (s) {
            s.data = getHistory(s.name, history.data, time_window);
            s.power_data = $scope.power_data;
         });

         $scope.started_on = history.started_on;

         $scope.$on('smoker:update', function (event, smoker) {
            $scope.target = smoker.info.target;

            if ($scope.power_data.last() && $scope.power_data.last().state !== smoker.info.power) {
               $scope.power_data.last().end = smoker.info.time;
               $scope.power_data.push({
                  state: smoker.info.power,
                  start: smoker.info.time
               });
            }

            updateSensors($scope, smoker);
         });
      });
   }
]);

var getPowerData = function (primarySensor, history) {
   var current;
   var result = [];

   history.forEach(function (x) {
      var d = x.sensors[primarySensor.name];

      if (!d || !d.power) return;

      if (current && current.state !== d.power) {
         current.id = result.length + '_' + 0;
         current.end = d.time;

         result.push(current);

         current = {
            start: d.time,
            state: d.power
         };
      }
      else if (!current) {
         current = {
            start: d.time,
            state: d.power
         };
      }
   });

   if (current) {
      result.push(current);
   }

   return result;
};

var getHistory = function (name, data, timespan) {
   var result = [];
   var oldest_time = new Date().getTime() - timespan;

   for (var i = data.length - 1; i >= 0; i--) {
      var entry = data[i].sensors[name];

      if (entry) {
         if (entry.time >= oldest_time) {
           result.unshift(entry);
         }
         else {
            break;
         }
      }
   }
   return result;
};
})();
