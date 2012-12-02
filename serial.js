var serialport = require("serialport");
var SerialPort = serialport.SerialPort

var serialPort = new SerialPort("COM5", {
	baudrate: 9600,
	parser: serialport.parsers.readline("\n") 
});

serialPort.on('data', function (data) {
	console.log(data.toString());
});

serialPort.write("s100\n");