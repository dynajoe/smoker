var Max6675 = require('max6675-raspberry-pi');
var _ = require('underscore');

var sensorA = new Max6675({
   miso: 0,
   ss: 12,
   clk: 3
});

var sensorB = new Max6675({
   miso: 0,
   ss: 2,
   clk: 3
});

var io = app.get('io');

io.sockets.on('connection', function (socket) {
   socket.on('getData', function (since) {
      var result = null;

      if (!since) {
         result = {
            since: data.length > 0 ? data[0].time : new Date().getTime(),
            data: data
         };
      } else {
         result = { 
            since: since,
            data: _.filter(data, function (d) {
               return d.time > since;
            })
         };
      }

      return socket.emit('data', result);
   });
});

var data = [];
setInterval(function () {
   var a = sensorA.read();
   var b = sensorB.read();
   
   data.push({
      a: parseInt(a),
      b: parseInt(b),
      time: new Date().getTime()
   });

}, 1000);


module.exports = function (app) {
   app.get('/', function (req, res) {
      res.render('index');
   });
};