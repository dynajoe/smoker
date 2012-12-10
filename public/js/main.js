 $(document).ready(function() {

  $('#command-form').submit(function (e) {
    socket.emit('command', $('#command').val());
    $('#command').val('')
    return false;
  });

  var socket = window.socket = io.connect();
  var maxTemp = 260;
  var medTemp = 140;
  var minTemp = 160;
  var target = 240;
  var thresh = 5;
  var getHistory = window.getHistory = function () {
    socket.emit('history', function (data) {

    });
  };


  socket.on('history', function (data) {
    console.log(JSON.stringify(data));
  });
  
  socket.on('target', function (data) {
    target = parseInt(data);
    $('.target').html(data);
    
    updateTargetBand();
  });

  socket.on('thresh', function (data) {
    thresh = parseInt(data);
    $('.thresh').html(data);
    
    updateTargetBand();
  });
  
  var updateTargetBand = function () {
    chart.series[0].yAxis.removePlotBand('target');

    chart.series[0].yAxis.addPlotBand({ 
        id: 'target',
        from: target,
        to: target + thresh,
        color: 'yellow',
        label: {
            text: 'Target Temperature',
            style: {
                color: 'black'
            }
        }
    });
  };

  socket.on('time', function (data) {
    $('.run-time').html(Math.floor(data / 60) + ' minutes');
  });

  socket.on('state', function (data) {
    $('.state').html(data == '1' ? 'On' : 'Off');
  });

  socket.on('temp', function(data) {
    var series = chart.series[0];
    var shift = series.data.length > 500;

    series.addPoint({x: data.time, y: parseFloat(data.temp) }, true);     

    $("#current h3").text(data.temp + "º F");

  });

  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });
  
  var now = (new Date()).getTime() - 5000;

  var chart = window.chart = new Highcharts.Chart({
    chart: {
      renderTo: 'temperature',
      defaultSeriesType: 'spline',
      type: 'area',
      zoomType: 'x'
    },

    title: {
      text: 'Smoker Temperature'
    },

    xAxis: {
      type: 'datetime',
      tickPixelInterval: 150,
      min: now,
      maxZoom: 60 * 1000
    },

    plotOptions: {
      area: {
          fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
              stops: [
                  [0, '#D90000'],
                  [1, '#CAD4FA']
              ]
          }
        }
    },
    yAxis: {
      title: {
        text: 'Temperature'
      },
      max: maxTemp,
      min: minTemp
    },

    series: [{
      name: 'Meat Level',
      color: 'red',
      data: [],
      pointInterval: 1000,
      marker: {
        enabled: false,
        states: {
          hover: {
            enabled: true
          }
        }
      }
    }]
  });
});