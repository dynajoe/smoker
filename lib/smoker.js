var serialPort = require('serialport');
var child_process = require('child_process');
var os = require('os');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var getPortConnect = function (callback) {

    if (os.platform() === 'win32') {
        callback(null, 'COM5');
        return;
    }

    child_process.exec('ls /dev | grep cu.usbserial', function (err, stdout) {
        var ports = stdout.trim().split('\n');

        if (ports.length == 0 || !ports[0]) {
            callback('Unable to connect to xbee.');
            return;
        }
        callback(null, '/dev/' + ports[0]);
    });
};

var Smoker = function () {
    EventEmitter.call(this);
    this.port = undefined;
};

util.inherits(Smoker, EventEmitter)

Smoker.prototype.send = function (command) {
    if (this.port) {
        this.port.write(command.trim() + '\n');    
    }
};

Smoker.prototype.initialize = function (callback) {
    var smoker = this;

    getPortConnect(function (err, discoveredPort) {

        if (err) {
            callback(err);
            return;
        } 

        var port = new serialPort.SerialPort(discoveredPort, {
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

            smoker.emit('data', point);
        });
        
        smoker.port = port;

        callback(null);
    });

    return this;
};

module.exports = Smoker;
