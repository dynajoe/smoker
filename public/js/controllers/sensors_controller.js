(function () {
'use strict';

var appControllers = angular.module('appControllers');

var updateSensors = function ($scope, smoker) {
   var data = smoker.data;

   for (var i = 0; i < $scope.sensors.length; i++) {
      var sensor = $scope.sensors[i];
      var latest_data = data[sensor.name];

      sensor.data.push(latest_data);

      if (sensor.data.length > 200) {
         sensor.data.shift();
      }

      var recent = sensor.data.last(10);
      var temp_diff = recent.last().value - recent.first().value;
      var time_diff = Math.abs(recent.first().time - recent.last().time) / 1000;
      var roc = Math.round(temp_diff / time_diff);

      if (sensor.is_primary) {
         sensor.state = smoker.info.state;
         sensor.goal = smoker.info.target_temp;
      }

      sensor.roc = roc > 0 ? ("+" + roc) : roc;
      sensor.temp = Number(latest_data.value);
   }
};

appControllers.controller(
   'SensorsController', ['$scope', 'SmokerService', 'amMoment',
   function ($scope, SmokerService, amMoment) {
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

      SmokerService.initialize(function (sensors, history) {
         $scope.sensors = sensors;

         $scope.sensors.forEach(function (s) {
            s.data = getHistory(s.name, history.data, 3 * 60 * 1000);
         });

         $scope.started_on = history.started_on;

         $scope.$on('smoker:update', function (event, smoker) {
            $scope.pid = smoker.info.pid_state.result;
            updateSensors($scope, smoker);
         });
      });
   }
]);

var getHistory = function (name, data, timespan) {
   var result = [];
   var oldest_time = new Date().getTime() - timespan;

   for (var i = data.length - 1; i >= 0; i--) {
      var entry = data[i][name];

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
