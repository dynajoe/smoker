 $(document).ready(function() {

  var socket = io.connect('http://localhost:3000');
  
  Highcharts.setOptions({
    global: {
        useUTC: false
    }
  });

  window.chart = new Highcharts.Chart({
    chart: {
      renderTo: 'temperature',
      type: 'line',
      events: {
        load: function() {
          var series = this.series[0];

          socket.on('temperature', function(data) {
            var time = (new Date()).getTime();
            var temp = data.value;
            series.addPoint([time, temp], true, true);
          });
        }
      }
    },

    title: {
      text: 'Smoker Temperature'
    },

    xAxis: {
      type: 'datetime',
      startOnTick: (new Date()).getTime(),
      tickInterval: 1000
    },

    yAxis: {
      title: {
        text: 'Temperature'
      },
      min: 60,
      max: 350,
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }]
    },
    legend: {
      enabled: false
    },

    exporting: {
      enabled: false
    },

    series: [{
      name: 'Temperature',
      data: []
    }]

  });
});