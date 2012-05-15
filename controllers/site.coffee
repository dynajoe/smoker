sp = require('serialport')
SerialPort = sp.SerialPort
serialPort = new SerialPort('/dev/tty.usbmodemfa131', parser: sp.parsers.readline("\n"), baudrate: 9600)

init = (app, io) ->
  app.get '/', (req, res) ->
    res.render 'index'

  serialPort.on 'data', (d) ->
    io.sockets.emit 'temperature', value: d

module.exports = 
  use: (app) ->
    io = require('socket.io').listen(app)
    init app, io
