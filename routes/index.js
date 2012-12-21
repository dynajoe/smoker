var serialPort = require('serialport');
var child = require('child_process');
var os = require('os');

var collectedData = [];
var buffer = [];
var port = null;

var getPortConnect = function (callback) {

    if (os.platform() === 'win32') {
        callback(null, 'COM5');
        return;
    }

    child.exec('ls /dev | grep cu.usbserial', function (err, stdout) {
        var ports = stdout.trim().split('\n');

        if (ports.length == 0) {
            console.log('Unable to connect to XBEE!');
            callback('Unable to connect to xbee.');
        }

        callback(null, '/dev/' + ports[0]);
    });
};

getPortConnect(function (err, port) {
    if (!port) return;
    
    port = new serialPort.SerialPort(port, {
      baudrate: 9600,
      parser: serialPort.parsers.readline('\n') 
    }); 

    port.on('data', function (data) {
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
			if (!!port) {
				port.write(command.trim() + '\n');	
			}
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