var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));
app.use(require('connect-assets')());

app.set('io', io);

require('./routes/index')(app);

server.listen(app.get('port'));