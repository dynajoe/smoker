 $(document).ready(function() {

  var socket = io.connect('http://localhost:3000');
  
  socket.on('temperature', function(data) {
    var time = (new Date()).getTime();
    var temp = parseFloat(data.value);

    chart.series[0].addPoint({x: time, y: temp});      
  });

  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });
  
  var now = (new Date()).getTime() - 5000;

  var chart = new Highcharts.Chart({
    chart: {
      renderTo: 'temperature',
      type: 'line',
      animation: false,
      marginRight: 10,
      zoomType: 'x',
      events: {
        load: function() {
          socket.emit('pump', { rate: 20 });
        }
      }
    },

    title: {
      text: 'Smoker Temperature'
    },

    xAxis: {
      type: 'datetime',
      tickPixelInterval: 150,
      min: now,
      minRange: 20 * 1000

    },

    plotOptions: {
      series: {
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: true
            }
          }
        }
      }
    },

    yAxis: {
      title: {
        text: 'Temperature'
      },
      max: 160,
      min: 60,
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }]
    },

    series: [{
      name: 'temp',
      data:  (function() {

          // generate an array of random data

          var data = [],

          time = (new Date()).getTime(),

          i;



          for (i = -19; i <= 0; i++) {

            data.push({

              x: time + i * 1000,

              y: Math.random()

            });

          }

          return data;

        })()
      }]

    });
});