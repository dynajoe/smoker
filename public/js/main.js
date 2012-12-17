window.onload = function() {

  var socket = window.socket = io.connect();
  var lastPoint = null;

  var smoker = {
    data: [],
    targetTemp: 240,
    tempThreshold: 5,
    begin: null
  };

  var getTempColor = function (temp) {
    if (temp > 240) {
      return {background: 'red', foreground: 'white'};
    } else if (temp <= 240 && temp > 210) {
      return {background: 'green', foreground: 'white'};
    } else {
      return {background: 'yellow', foreground: 'black'};
    }
  }

  var overall = new Graph({
    xSeconds: 60 * 60 * 2,
    title: '2 Hours',
    width: 350,
    ticks: 4,
    container: '#overall-graph',
    updateInterval: 1000,
    yRange: [180, 260]
  });


  var twoMin = new Graph({
    xSeconds: 120,
    title: '2 Minutes',
    width: 700,
    ticks: 8,
    container: '#twomin-graph',
    updateInterval: 1000,
    yRange: [180, 260]
  });

  var tenMin = new Graph({
    xSeconds: 60 * 10,
    title: '10 Minutes',
    width: 350,
    ticks: 4,
    container: '#tenmin-graph',
    updateInterval: 1000,
    yRange: [180, 260]
  });

  var tick = function () {
    var now = Date.now();
    var newTemp = Math.round(Math.random() * 50 + 200, 0);

    var newPoint = {
      time: now,
      temp: newTemp,
      isOn: newTemp < 230
    };

    newPoint.delta = lastPoint != null 
      ? newPoint.temp - lastPoint.temp 
      : 0;

    smoker.data.push(newPoint);
    //the graph is off by a second or so because of animations
    //this looks better if it seemingly corresponds with the graph shape
    var tempDisplay = lastPoint == null ? newPoint.temp : lastPoint.temp;
    var colors = getTempColor(tempDisplay);

    d3.select('.current')
      .transition()
      .duration(1000)
      .style('background-color', colors.background)
      .style('color', colors.foreground)

    d3.select('.current .temp')
      .text(tempDisplay + '\u00B0 F');

    d3.select('.current-time')
      .text(d3.time.format('%H:%M:%S')(new Date()));
    
    d3.select('.external-temp')
      .text('50' + '\u00B0 F')

    d3.select('.burner-state')
      .style('background-color', newPoint.isOn ? 'Orange' : '#eee')
      .style('color', newPoint.isOn ? 'White' : 'Black')
      .text(newPoint.isOn ? 'On' : 'Off');

    overall.update(smoker);
    twoMin.update(smoker);
    tenMin.update(smoker);

    lastPoint = newPoint;
  };

  var evenTime = 1000 - Date.now() % 1000;

  setTimeout(function() { 
    tick();  
    setInterval(tick, 1000); 
  }, evenTime);
};