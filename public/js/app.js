(function () {
'use strict';
angular.module('appFilters', []);
angular.module('appControllers', []);
angular.module('appServices', []);
angular.module('appDirectives', []);
angular.module('smokerApp', [
  'btford.socket-io',
  'd3',
  'underscore',
  'appServices',
  'appControllers',
  'appFilters',
  'appDirectives'
]);

Array.prototype.last = function (num) {
   if (num !== undefined) {
      return this.slice(-num);
   }
   return this[this.length - 1];
};

Array.prototype.first = function (num) {
   if (num !== undefined) {
      return this.slice(0, num);
   }
   return this[0];
};

})();