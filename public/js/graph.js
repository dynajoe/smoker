var Graph = function (options) {
  this.xSeconds = options.xSeconds;
  this.xMilliseconds = options.xSeconds * 1000;
  this.container = options.container;
  this.updateInterval = options.updateInterval;
  this.yRange = options.yRange;
  this.title = options.title;
  var margin = this.margin = margin = {top: 15, right: 0, bottom: 40, left: 60};  
  this.width = options.width;
  this.height = 230 - margin.top - margin.bottom;
  this.ticks = options.ticks;
  this.sliceLength = options.sliceLength;
  this.initialize();
};

Graph.prototype.initialize = function () {
  var now = Date.now();

  var x = this.x = d3.time.scale()
    .domain([now - this.xMilliseconds, now])
    .range([0, this.width]);

  var y = this.y = d3.scale.linear()
    .domain(this.yRange)
    .range([this.height, 0]);

  var svg = this.svg = d3.select(this.container).append('svg')
    .attr('width', this.width)
    .attr('height', this.height + this.margin.top + this.margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

  var defs = svg.append('defs');

  defs.append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', this.width)
    .attr('height', this.height);

  var gradient = defs.append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");
   
  gradient.append("svg:stop")
      .attr("offset", "0%")
      .attr("stop-color", "#FF1400")
      .attr("stop-opacity", 1);
   
  gradient.append("svg:stop")
      .attr("offset", "50%")
      .attr("stop-color", "#FF6e00")
      .attr("stop-opacity", 1);

  gradient.append("svg:stop")
      .attr("offset", "100%")
      .attr("stop-color", "#FFf000")
      .attr("stop-opacity", 1);

  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", this.width / 2)
    .attr("y", this.height + this.margin.bottom - 5)
    .text("Time");

  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90) translate("+(-this.height / 2)+", -40)")
    .text("Temperature (F)");

  svg.append("text")
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .attr('x', this.width / 2)
    .text(this.title);

  this.xAxis = svg.append('g')
    .attr('class', 'x axis')
    .attr('clip-path', 'url(#clip)')
    .attr('transform', 'translate(0,' + this.height + ')')
    .call(this.x.axis = d3.svg.axis().scale(this.x).ticks(this.ticks).orient('bottom'));

  this.yAxis = svg.append('g')
    .attr('class', 'y axis')
    .call(this.y.axis = d3.svg.axis().scale(this.y).ticks(4).orient('left'));
  
  var line = this.line = d3.svg.line()
    .x(function (d) { return x(d.time); })
    .y(function (d) { return y(d.temp); })
    .interpolate('basis');

  this.svg.append('path')
    .attr('clip-path', 'url(#clip)')
    .attr('class', 'line')
    .data([])
    .attr('d', line);

  var area = this.area = d3.svg.area()
    .x(function (d) { return x(d.time); })
    .y(function (d) { return y(d.temp); })
    .y0(this.height)
    .interpolate('basis')

  this.svg.append('path')
    .attr('clip-path', 'url(#clip)')
    .attr('class', 'area')
    .style('fill', 'url(#gradient)')
    .data([])
    .attr('d', area);
};

Graph.prototype.update = function (smoker) {
  var now = Date.now();
  var width = $(this.container + ' svg').width() - this.margin.right;

  if (smoker.data.length > this.sliceLength) {
    var data = smoker.data.slice(smoker.data.length - this.sliceLength, smoker.data.length);
  } else {
    var data = smoker.data;
  }

  d3.selectAll(this.container + ' path.line')
    .data([data])
    .transition()
      .ease('linear')
      .duration(this.updateInterval)
      .attr('d', this.line(data));

  d3.selectAll(this.container + ' path.area')
    .data([data])
    .transition()
      .ease('linear')
      .duration(this.updateInterval)
      .attr('d', this.area(data));
  
  var start = now - this.xMilliseconds;

  this.x.domain([start, now]);
  this.y.domain(this.yRange);

  this.xAxis.transition()
    .duration(this.updateInterval)
    .ease('linear')
    .call(this.x.axis);

  this.yAxis.transition()
    .duration(this.updateInterval)
    .ease('linear')
    .call(this.y.axis);
};
