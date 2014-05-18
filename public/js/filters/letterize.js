var appFilters = angular.module('appFilters');

appFilters.filter('letterize', function() {
   return function(input) {
      return String.fromCharCode(97 + Number(input));
   };
});