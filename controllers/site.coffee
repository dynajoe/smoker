init = (app, io) ->
  app.get '/', (req, res) ->
    res.render 'index'

  io.sockets.on 'connection', (socket) ->
    socket.emit 'news', hello: 'world'

module.exports = 
  use: (app) ->
    io = require('socket.io').listen(app)
    init app, io