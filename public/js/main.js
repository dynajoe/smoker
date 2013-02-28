$(document).ready(function() {

  $('form.command').submit(function () {
    var input = $('.text', this);

    socket.emit('command', input.val());

    input.val('');
    
    return false;
  });
  
  var socket = window.socket = io.connect();
  var updateInterval = 2000;

  var smoker = window.smoker = {
    data: [],
    targetTemp: 240,
    tempThreshold: 5
  };

  socket.on('history', function (data) {
    smoker.data = data;
  });

  socket.on('data', function (data) {
    smoker.targetTemp = data.target;
    smoker.tempThreshold = data.threshold;
    smoker.data = smoker.data.concat(data);
  });

  socket.emit('history');

  var getTempColor = function (temp, min, max) {
    if (temp > max) {
      return { background: 'red', foreground: 'white' };
    } else if (temp <= max && temp > min) {
      return { background: 'green', foreground: 'white' };
    } else {
      return { background: 'yellow', foreground: 'black' };
    }
  }

  var twoMin = new Graph({
    xSeconds: 120,
    title: '2 Minutes',
    width: 700,
    ticks: 8,
    container: '#twomin-graph',
    updateInterval: updateInterval,
    yRange: [180, 260],
    sliceLength: 60
  });

  var tenMin = new Graph({
    xSeconds: 60 * 10,
    title: '10 Minutes',
    width: 700,
    ticks: 4,
    container: '#tenmin-graph',
    updateInterval: updateInterval,
    yRange: [180, 260],
    sliceLength: 300
  });
  
  var tick = function () {

    var latestData = smoker.data[smoker.data.length - 1]

    if (!latestData) {
      return;
    }

    var colors = getTempColor(latestData.temp, latestData.target, latestData.target + latestData.threshold);

    d3.select('.current')
      .transition()
      .duration(updateInterval)
      .style('background-color', colors.background)
      .style('color', colors.foreground)

    d3.select('.current .temp')
      .text(latestData.temp + '\u00B0');

    d3.select('.target-temp')
      .text(latestData.target + '\u00B0 - ' + (latestData.target + latestData.threshold) + '\u00B0');

    d3.select('.outside-temp')
      .text(latestData.outsideTemp + '\u00B0');

    d3.select('.burner-state')
      .style('background-color', latestData.isOn ? 'Orange' : '#eee')
      .style('color', latestData.isOn ? 'White' : 'Black')
      .text(latestData.isOn ? 'On' : 'Off');

    if (latestData.temp < 180) {
      twoMin.yRange = [60, 180];
    } else {
      twoMin.yRange = [180, 260];
    }
    
    twoMin.update(smoker);
    tenMin.update(smoker);
  };

  tick();  
  setInterval(tick, updateInterval); 

  setInterval(function () {
    d3.select('.current-time')
      .text(d3.time.format('%H:%M:%S')(new Date()));
  }, 1000);

});