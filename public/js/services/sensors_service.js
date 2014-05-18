(function () {
'use strict';

var appServices = angular.module('appServices');

appServices.factory(
   'SmokerService', ['$rootScope','$io', function ($rootScope, $io) {

      $io.on('update', function (data) {
         $rootScope.$broadcast('smoker:update', data);
      });

      return {
         history: function (cb) {
            $io.emit('history', function (data) {
               cb(data);
            });
         },
         sensors: function (cb) {
            $io.emit('sensors', function (data) {
               cb(data);
            });
         }
      };
   }
]);

appServices.factory(
   '$io', ['socketFactory', function (socketFactory) {
      return socketFactory();
   }
]);

})();
