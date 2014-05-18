$(document).ready(function() {
    var graph = d3.selectAll('.graph')
      .append("svg:svg")
      .attr("width", "100%")
      .attr("height", "100%");

    var width = $('.graph').width();
    var height = $('.graph').height();
    var x_domain = width / 120;
    var max = 100;

    var x = d3.scale.linear().domain([0, 180]).range([0, width]);
    var y = d3.scale.linear().domain([0, max]).range([0, height]);

    var line = d3.svg.line()
      .x(function (d, i) {
        return x(i);
      })
      .y(function(d, i) {
        return y(d);
      })
      .interpolate('basis');

    graph.append("svg:path")
      .attr("d", data);

    function redraw () {
      graph.selectAll("path")
        .data([data])
        .attr("transform", "translate(" + x(1) + ")")
        .attr("d", line)
        .transition()
        .ease("linear")
        .duration(100)
        .attr("transform", "translate(" + x(0) + ")"); // animate a slide to the left back to x(0) pixels to reveal the new value
    };

    var socket = io.connect();
    var history;
    socket.on('history', function (d) {
      history = d;
    });

    setInterval(redraw, 1000 / 60);
});