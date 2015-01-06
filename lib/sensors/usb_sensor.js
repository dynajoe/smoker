var serialPort = require('serialport');
var Logger = require('winston');
var ApplicationEvents = require('../application_events');

var UsbSensor = function (config) {
   this.buffer = [0];
   this.config = config;
   this._initialize();

   var reader = this;

   ApplicationEvents.on('smoker:target-temp', function (value) {
      if (reader.portOpened) {
         reader.port.write('s' + value + '\n');
      }
   });
};

UsbSensor.prototype._initialize = function () {
   var reader = this;

   var port = new serialPort.SerialPort(reader.config.port, {
      baudrate: reader.config.baudrate,
      parser: serialPort.parsers.readline('\n')
   });

   port.on('open', function (err) {
      if (err) {
         return Logger.error('Error opening serialport', err);
      }

      ApplicationEvents.emit('usb:port-open', port);

      reader.portOpened = true;

      Logger.info('Serial Port Open', reader.config);
      port.write('A\n');

      port.on('data', function (data) {
         var parts = data.trim().split(',');
         reader.value = Number(parts[1]);
         reader.buffer.push(reader.value);
      });
   });

   reader.port = port;
};

UsbSensor.prototype.read = function () {
   this.buffer = this.buffer.slice(this.buffer.length - 1);
   var temperature = this.buffer[0];
   return temperature;
};

module.exports = UsbSensor;