sp = require('serialport')
SerialPort = sp.SerialPort
serialPort = new SerialPort('/dev/tty.usbmodemfa131', parser: sp.parsers.readline("\n"), baudrate: 9600)

rates = []

data = []

init = (app, io) ->
  app.get '/', (req, res) ->
    res.render 'index'

  io.on 'connection', (socket) ->
    socket.on 'pump', (d) -> 
      rates.push socket: socket, rate: 1000.0 / d.rate

  serialPort.on 'data', (d) ->
    data.push time: (new Date()).getTime(), value: d

    for client in rates
      rate = client.rate
      now = (new Date()).getTime()
      
      client.last_pump or= now
      
      if client.rate + client.last_pump <= now
        client.socket.emit 'temperature', value: d
        client.last_pump = now

module.exports = 
  use: (app) ->
    io = require('socket.io').listen(app)
    init app, io
