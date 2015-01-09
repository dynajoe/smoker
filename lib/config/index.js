var config = {
  driver: {
    type: 'automated',
    options: {
      port: '/dev/tty.usbserial-A100S8MA',
      //port: '/dev/tty.usbmodem1451',
      baudrate: 9600
    }
  }
};

module.exports = config;