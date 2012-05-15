var SerialPort, init, serialPort, sp;

sp = require('serialport');

SerialPort = sp.SerialPort;

serialPort = new SerialPort('/dev/tty.usbmodemfa131', {
  parser: sp.parsers.readline("\n"),
  baudrate: 9600
});

init = function(app, io) {
  app.get('/', function(req, res) {
    return res.render('index');
  });
  return io.sockets.on('connection', function(socket) {
    return serialPort.on('data', function(d) {
      return io.sockets.emit('temperature', {
        value: d
      });
    });
  });
};

module.exports = {
  use: function(app) {
    var io;
    io = require('socket.io').listen(app);
    return init(app, io);
  }
};
