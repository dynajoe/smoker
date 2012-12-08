var serialport = require("serialport");
var SerialPort = serialport.SerialPort

var serialPort = new SerialPort("COM5", {
  baudrate: 9600,
  parser: serialport.parsers.readline("\n") 
});

collectedData = [];

module.exports = function (app, io) {
	io.sockets.on('connection', function (socket) {
		socket.on('history', function () {
			socket.emit('history', collectedData);
		});

		socket.on('command', function(command) {
			serialPort.write(command);
		});
	});
	
	serialPort.on('data', function (data) {
		var matches = data.match(/(\w*):\s*(.*)/);
		
		if (!matches) {
			return;
		}

		var key = matches[1].toLowerCase().trim();
		var value = matches[2];

		if (key === 'temp') {
			var point = { time: new Date().getTime(), temp: value };
			collectedData.push(point);
			io.sockets.emit('temp', point);
		} else {
			io.sockets.emit(key, value);
		}
	});

   app.get('/', function (req, res) {
      res.render('index', { title: 'Smoker!' });
   });
}