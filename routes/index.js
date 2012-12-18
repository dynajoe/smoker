var serialport = require('serialport');
var SerialPort = serialport.SerialPort
var child = require('child_process');
var collectedData = [];
var buffer = [];

child.exec('ls /dev | grep cu.usbserial', function (err, stdout) {
	
	var ports = stdout.trim().split('\n');

	if (ports.length > 0) {
		var serialPort = new SerialPort('/dev/' + ports[0], {
		  baudrate: 9600,
		  parser: serialport.parsers.readline('\n') 
		});	

		serialPort.on('data', function (data) {
			var parts = data.trim().split(',');

			var point = {
				temp: parseInt(parts[0]),
				outsideTemp: parseInt(parts[1]),
				isOn: parseInt(parts[2]) === 1,
				time: Date.now(),
				threshold: parseInt(parts[4]),
				target: parseInt(parts[3])
			};

			collectedData.push(point);
			buffer.push(point);
		});
	} else {
		console.log('Unable to connect to XBEE!');
	}
});

module.exports = function (app, io) {
	io.sockets.on('connection', function (socket) {
		socket.on('history', function () {
			socket.emit('history', collectedData);
		});

		socket.on('time', function (clientTime) {
			var now = Date.now();
			var diff = clientTime - now;

			socket.emit('time', { time: now, diff: diff });
		});

		socket.on('command', function (command) {
			serialPort.write(command.trim() + '\n');
		});
	});

	setInterval(function () {
		if (buffer.length > 0) {
			io.sockets.emit('data', buffer);
			buffer = [];
		}
	}, 2000);

   app.get('/', function (req, res) {
      res.render('index', { title: 'Smoker!' });
   });
}