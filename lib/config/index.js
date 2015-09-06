var config = {
  driver: {
    type: 'automated',
    options: {
      port: /^win/.test(process.platform) ? 'COM4' : '/dev/tty.usbserial-A100S8MA',
      baudrate: 9600
    }
  },
  log: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
};

module.exports = config;