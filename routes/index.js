var Initialize = function (app) {
   var io = app.get('io');
   var smoker = app.get('smoker');
   var config = app.get('config');

   io.sockets.on('connection', function (socket) {
      socket.on('time', function (cb) {
         cb(Date.now());
      });

      socket.on('reset', function () {
         smoker.reset();
      });

      socket.on('sensors', function (cb) {
         cb(smoker.getSensors());
      });

      socket.on('target_temp', function (value) {
         smoker.setTargetTemp(value);
      });

      socket.on('history', function (cb) {
         cb({
            data: smoker.data,
            started_on: smoker.started_on
         });
      });
   });

   smoker.on('data', function (data) {
      io.sockets.emit('update', {
         info: smoker.brains.info(),
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