var Initialize = function (app) {
   var io = app.get('io');
   var smoker = app.get('smoker');
   var config = app.get('config');

   io.sockets.on('connection', function (socket) {
      socket.on('sensors', function (cb) {
         cb(smoker.sensors);
      });

      socket.on('target_temp', function (value) {
         console.log('request to change target temp: ', value);
         smoker.setTargetTemp(value);
      });

      socket.on('history', function (cb) {
         cb(smoker.data);
      });
   });

   smoker.on('data', function (data) {
      io.sockets.emit('update', {
         state: smoker.state,
         current_temp: smoker.temperature(),
         target_temp: smoker.target_temp,
         data: data
      });
   });
};

module.exports = function (app) {
   Initialize(app);
   app.get('/', function (req, res) {
      res.render('index');
   });
};