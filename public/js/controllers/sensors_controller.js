(function () {
'use strict';

var appControllers = angular.module('appControllers');

var updateSensors = function ($scope, data) {
   for (var i = 0; i < $scope.sensors.length; i++) {
      var sensor = $scope.sensors[i];
      var new_temp = Number(data[sensor.name].value);
      var current_temp = sensor.temp;
      sensor.data = sensor.data || [];
      sensor.data.push(new_temp);
      if (current_temp) {
         sensor.change = new_temp - current_temp;
      }
      sensor.temp = new_temp;
   }
};

appControllers.controller(
   'SensorsController', ['$scope', 'SmokerService',
   function ($scope, SmokerService) {
      SmokerService.sensors(function (sensors) {
         $scope.sensors = sensors;
         $scope.$on('smoker:update', function (event, smoker) {
            updateSensors($scope, smoker.data);
         });
      });
   }
]);

})();
