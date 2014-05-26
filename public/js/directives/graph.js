angular.module('appDirectives')
.directive('tempGraph', ['d3Service', function (d3Service) {

   var definition = {
      restrict: 'A',
      scope: {
         data: '='
      },
      link: function ($scope, element, attrs) {
         d3Service.d3().then(function (d3) {
            var width = parseInt(d3.select(element[0]).style('width'), 10);
            var height = parseInt(d3.select(element[0]).style('height'), 10);
            var now = new Date();
            var end = new Date(now.getTime() + 60*1000);

            var x = d3.time.scale()
            .domain([now, end])
            .range([0, width]);

            var y = d3.scale.linear()
            .domain([0, 250])
            .range([height, 0]);

            var line = d3.svg.line()
            .x(function (d, i) {
               console.log('x', d, i);
               return x(i);
            })
            .y(function (d, i) {
               console.log('y', d, i);
               return y(d);
            });

            var svg = d3.select(element[0])
               .append('svg')
               .attr('width', width)
               .attr('height', height)
               .append('g');

            svg.append('defs')
               .append('clipPath')
               .attr('id', 'clip')
                  .append('rect')
                  .attr('width', width)
                  .attr('height', height);

            svg.append('g')
               .attr('class', 'x axis')
               .attr('transform', 'translate(0,' + y(150) + ')')
               .call(d3.svg.axis().scale(x).orient('bottom'));

            svg.append('g')
               .attr('class', 'y axis')
               .call(d3.svg.axis().scale(y).orient('left'));

            // var path = svg.append('g')
            //    .attr('clip-path', 'url(#clip)')
            //       .append('path')
            //       .attr('class', 'line')
            //       .attr('d', line)
            //       .datum($scope.data);

            $scope.$watch('data', function (oldVal, newVal) {


            }, true);
         });
      }
   };

   return definition;
}]);