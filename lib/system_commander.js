var spawn = require('child_process').spawn;
var logger = require('winston');

var commands = {
   shutdown: function () {
      spawn('shutdown', ['-r', 'now']);
   }
};

if (process.env.NODE_ENV === 'production') {
   commands.shutdown = function () {
      logger.info("DEBUG SYSTEM SHUT DOWN");
   };
}

module.exports = commands;