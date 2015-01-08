var config = {
  poll_interval: 1000,
  power_pin: 18,
  target_temp: 240,
  data_buffer_size: 30,
  duty_cycle: 8000,
  pid: {
    p: 0.5,
    i: 0.1,
    d: 0,
    range: 15
  }
};

config = {
  driver: {
    type: 'automated',
    options: {
      //port: '/dev/tty.usbserial-A100S8MA',
      port: '/dev/tty.usbmodem1411',
      baudrate: 9600
    }
  }
};

module.exports = config;