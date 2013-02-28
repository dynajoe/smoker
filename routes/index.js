var Smoker = require('../lib/smoker');

module.exports = function (app) {
   var smoker = new Smoker();
   var collectedData = [];
   var io = app.get('io');
   var lastIndex = 0;
      
   smoker.initialize(function (err) {
      if (err) console.log(err);
   }).on('data', function (data) {
      collectedData.push(data);
   });

	io.sockets.on('connection', function (socket) {
		socket.on('history', function () {
         var startIndex = collectedData.length - 300;
         
         if (startIndex < 0) startIndex = 0;

			socket.emit('history', collectedData.slice(startIndex, collectedData.length));
		});

		socket.on('command', function (cmd) { smoker.send(cmd); });
	});
	
   setInterval(function () {
      var buffer = collectedData.slice(lastIndex, collectedData.length);
      
      if (buffer.length > 0) {
         io.sockets.emit('data', buffer);
   		lastIndex = collectedData.length;
      }
	}, 2000);

   app.get('/', function (req, res) {
      res.render('index', { title: 'Smoker!' });
   });
};