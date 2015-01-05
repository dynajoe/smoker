var serialPort = require('serialport');

var ComSensor = function (config) {
   this.buffer = [0];
   this.config = config;
   this._initialize();
};

ComSensor.prototype._initialize = function () {
   var reader = this;

   var port = new serialPort.SerialPort(this.config.port, {
     baudrate: this.config.baudrate,
     parser: serialPort.parsers.readline('\n')
   });

   port.on('data', function (data) {
      var parts = data.trim().split(',');
      reader.buffer.push(parseInt(parts[0]));
   });

   reader.port = port;
};

ComSensor.prototype.read = function () {
   this.buffer = this.buffer.slice(this.buffer.length - 1);

   return this.buffer[0];
};

module.exports = ComSensor;