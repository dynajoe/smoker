$(document).ready(function() {

  $('form.command').submit(function () {
    var input = $('.text', this);

    socket.emit('command', input.val());

    input.val('');
    
    return false;
  });
  
  var socket = window.socket = io.connect();
  var updateInterval = 1000;

  var smoker = window.smoker = {
    data: [],
    targetTemp: 240,
    tempThreshold: 5,
    begin: null
  };

  socket.on('data', function (data) {
    smoker.targetTemp = data.target;
    smoker.tempThreshold = data.threshold;
    smoker.data = smoker.data.concat(data);
  });

  var lastPoint = null;

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
    updateInterval: updateInterval,
    yRange: [180, 260]
  });


  var twoMin = new Graph({
    xSeconds: 120,
    title: '2 Minutes',
    width: 700,
    ticks: 8,
    container: '#twomin-graph',
    updateInterval: updateInterval,
    yRange: [180, 260]
  });

  var tenMin = new Graph({
    xSeconds: 60 * 10,
    title: '10 Minutes',
    width: 350,
    ticks: 4,
    container: '#tenmin-graph',
    updateInterval: updateInterval,
    yRange: [180, 260]
  });

  var tick = function () {
    var latestData = smoker.data[smoker.data.length - 1]
    
    if (!latestData) {
      return;
    }

    var colors = getTempColor(latestData.temp);

    d3.select('.current')
      .transition()
      .duration(updateInterval)
      .style('background-color', colors.background)
      .style('color', colors.foreground)

    d3.select('.current .temp')
      .text(latestData.temp + '\u00B0 F');

    d3.select('.outside-temp')
      .text(latestData.outsideTemp + '\u00B0 F');

    d3.select('.current-time')
      .text(d3.time.format('%H:%M:%S')(new Date()));
    
    d3.select('.burner-state')
      .style('background-color', latestData.isOn ? 'Orange' : '#eee')
      .style('color', latestData.isOn ? 'White' : 'Black')
      .text(latestData.isOn ? 'On' : 'Off');

    if (latestData.temp < 180) {
      twoMin.yRange = [60, 180];
    } else {
      twoMin.yRange = [180, 260];
    }
    
    overall.update(smoker);
    twoMin.update(smoker);
    tenMin.update(smoker);
  };

  tick();  
  setInterval(tick, updateInterval); 
});