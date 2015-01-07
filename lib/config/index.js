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

config.sensors = [];

config = {
  driver: 'automated',
  sensors: {
    'name': 'meat',
    'type': 'usb',
    'is_primary': true,
    'options': {
    'port': '/dev/tty.usbserial-A100S8MA',
    'baudrate': 9600
    }
  }
};

config.sensors.push(
{
   'name': 'meat',
   'type': 'usb',
   'is_primary': true,
   'options': {
      'port': '/dev/tty.usbserial-A100S8MA',
      'baudrate': 9600
   }
});

// config.sensors.push({
//    'name': 'meat',
//    'type': 'debug',
//    'is_primary': true,
//    'options': {
//       'start_temp': 230,
//       'step_size': 2
//    }
// });


/*
config.sensor = {
  type: "gpio",
  is_primary: true,
  options: {
    primary_sensor: {
      name: "main",
      miso: 0,
      ss: 12,
      clk: 3
    },
    sensors: [{
      name: "meat",
      miso: 0,
      ss: 2,
      clk: 3
    }]
  }
}
*/

module.exports = config;