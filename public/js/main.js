 $(document).ready(function() {

  var socket = window.socket = io.connect('http://localhost:3000');
  var maxTemp = 260;
  var medTemp = 140;
  var minTemp = 70;

  socket.on('history', function (data) {
    console.log(data);
  });

  socket.on('temp', function(data) {
    var series = chart.series[0];
    var shift = series.data.length > 60;

    series.addPoint({x: data.time, y: parseFloat(data.temp) }, true, shift);     

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