(function () {
'use strict';
angular.module('appFilters', []);
angular.module('appControllers', []);
angular.module('appServices', []);
angular.module('smokerApp', [
  'btford.socket-io',
  'appServices',
  'appControllers',
  'appFilters'
]);

})();