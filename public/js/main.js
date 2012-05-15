 $(document).ready(function() {

  var socket = io.connect('http://localhost:3000');
  
  Highcharts.setOptions({
    global: {
        useUTC: false
    }
  });
  
  var now = (new Date()).getTime() - 5000;

  window.chart = new Highcharts.Chart({
    chart: {
      renderTo: 'temperature',
      type: 'line',
      marginRight: 10,
      zoomType: 'x',
      events: {
        load: function() {
          var series = this.series[0];

          socket.on('temperature', function(data) {
            var time = (new Date()).getTime();
            var temp = parseFloat(data.value);

            series.addPoint({x: time, y: temp});      
          });
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
        text: 'Value'
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