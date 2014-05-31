angular.module('appDirectives')
.directive('tempGraph', ['d3Service', function (d3Service) {

   var definition = {
      restrict: 'A',
      scope: {
         data: '=',
         min: '=?',
         max: '=?',
         timespan: '=?'
      },
      link: function ($scope, element, attrs) {
         d3Service.d3().then(function (d3) {
            var update_rate = 1500;
            var now = Date.now();

            var width = parseInt(d3.select(element[0]).style('width'), 10);
            var height = parseInt(d3.select(element[0]).style('height'), 10);

            var timespan = $scope.timespan = $scope.timespan || (3 * 60 * 1000);
            var min = $scope.min = $scope.min === undefined ? 150 : $scope.min;
            var max = $scope.max = $scope.max === undefined ? 250 : $scope.max;

            var margin = { left: 30, bottom: 20, top: 10, right: 5 };

            var x = d3.time.scale()
            .domain([now - timespan, now])
            .range([margin.left, width]);

            var y = d3.scale.linear()
            .domain([min, max])
            .range([height - margin.bottom, margin.top]);

            var line = d3.svg.line()
            .interpolate('monotone')
            .x(function (d, i) {
               return x(d.time);
            })
            .y(function (d, i) {
               return y(d.value);
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
                  .attr('x', margin.left)
                  .attr('width', width - margin.left - margin.right)
                  .attr('height', height);

            var axis = svg.append('g')
               .attr('class', 'x axis')
               .attr('clip-path', 'url(#clip)')
               .attr('transform', 'translate(0,' + y(min) + ')')
               .call(x.axis = d3.svg.axis().scale(x).orient('bottom').ticks(5));

            var y_axis = svg.append('g')
               .attr('class', 'y axis')
               .attr('transform', 'translate(' + margin.left + ', 0)')
               .call(y.axis = d3.svg.axis().scale(y).orient('left').ticks(2));

            var path = svg.append('g')
               .attr('clip-path', 'url(#clip)')
               .append('path')
                  .data([$scope.data || []])
                  .attr('class', 'line');

            var stepsize = x(now) - x(now - update_rate);

            tick();

            function tick () {
               now = Date.now();

               x.domain([now - timespan, now]);

               axis.transition()
                  .duration(update_rate)
                  .ease('linear')
                  .call(x.axis);

               svg.select('.line')
                  .attr('d', line)
                  .attr('transform', null);

               var min_value = d3.min($scope.data, function (d) {
                  return d.value;
               });

               var max_value = d3.max($scope.data, function (d) {
                  return d.value;
               });

               y.domain([min_value, max_value]);

               y_axis.transition()
                  .duration(update_rate)
                  .ease('linear')
                  .call(y.axis);

               path.transition()
                  .duration(update_rate)
                  .ease('linear')
                  .attr('transform', 'translate(-' + stepsize + ')')
                  .each('end', tick);
            }
         });
      }
   };

   return definition;
}]);