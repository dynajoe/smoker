(function () {
'use strict';

var appControllers = angular.module('appControllers');

var updateSensors = function ($scope, sensors) {
   for (var i = 0; i < $scope.sensors.length; i++) {
      var sensor = $scope.sensors[i];
      var latest_data = sensors[sensor.name];

      sensor.data.push(latest_data);
      if (sensor.data.length > 200) {
         sensor.data.shift();
      }

      var recent = sensor.data.last(10);
      var temp_diff = recent.last().value - recent.first().value;
      var time_diff = Math.abs(recent.first().time - recent.last().time) / 1000;
      var roc = Math.round(temp_diff / time_diff);

      // if (sensor.is_primary) {
      //    sensor.state = smoker.info.state;
      //    sensor.goal = smoker.info.target_temp;
      // }

      sensor.roc = roc > 0 ? ("+" + roc) : roc;
      sensor.temp = Number(latest_data.value);
   }
};

appControllers.controller(
   'SensorsController', ['$scope', 'SmokerService', 'amMoment',
   function ($scope, SmokerService, amMoment) {
      var time_window = 4 * 60 * 1000;

      $scope.update_config = function () {
         SmokerService.setTargetTemp($scope.target_temp);
         $scope.target_temp = null;
      };

      $scope.reset = function () {
         SmokerService.reset(function (started_on) {
            $scope.started_on = started_on;
            $scope.sensors.forEach(function (s) {
               s.data.length = 0;
            });
         });
      };

      $scope.power_data = [];

      SmokerService.initialize(function (sensors, history) {
         $scope.sensors = sensors;
         $scope.power_data = getPowerData(history.data);

         $scope.sensors.forEach(function (s) {
            s.data = getHistory(s.name, history.data, time_window);
            s.power_data = $scope.power_data;
         });

         $scope.started_on = history.started_on;

         $scope.$on('smoker:update', function (event, smoker) {
            $scope.pid = smoker.info.pid_state.result;

            if ($scope.power_data.last().state !== smoker.info.state) {
               $scope.power_data.last().end = smoker.data.time;
               $scope.power_data.push({
                  state: smoker.info.state,
                  start: smoker.data.time
               });
            }

            updateSensors($scope, smoker.data.sensors);
         });
      });
   }
]);

var getPowerData = function (data) {
   var current;
   var result = [];

   data.forEach(function (d) {
      if (!d.state) return;

      if (current && current.state !== d.state) {
         result.push({
            id: result.length + '_' + 0,
            state: current.state,
            start: current.start,
            end: d.time
         });

         current = {
            start: d.time,
            state: d.state
         };
      }
      else if (!current) {
         current = {
            start: d.time,
            state: d.state
         };
      }
   });

   result.push(current);

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
