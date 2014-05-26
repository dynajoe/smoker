(function () {
'use strict';
angular.module('appFilters', []);
angular.module('appControllers', []);
angular.module('appServices', []);
angular.module('appDirectives', [])
angular.module('smokerApp', [
  'btford.socket-io',
  'd3',
  'appServices',
  'appControllers',
  'appFilters',
  'appDirectives'
]);

})();