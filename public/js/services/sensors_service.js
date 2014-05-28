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

         },
         initialize: function (cb) {
            this.history(function (history) {
               this.sensors(function (sensors) {
                  cb(sensors, history);
               });
            }.bind(this));
         }
      };
   }
]);

appServices.factory(
   '$io', ['socketFactory', function (socketFactory) {
      return socketFactory();
   }
]);

angular.module('d3', [])
  .factory('d3Service', ['$document', '$q', '$rootScope',
    function($document, $q, $rootScope) {
      var d = $q.defer();
      function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function() { d.resolve(window.d3); });
      }
      // Create a script tag with d3 as the source
      // and call our onScriptLoad callback when it
      // has been loaded
      var scriptTag = $document[0].createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.async = true;
      scriptTag.src = '/d3/d3.js';
      scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') onScriptLoad();
      };
      scriptTag.onload = onScriptLoad;

      var s = $document[0].getElementsByTagName('body')[0];
      s.appendChild(scriptTag);

      return {
        d3: function() { return d.promise; }
      };
}]);

})();
