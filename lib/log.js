module.exports = function (message) {
   console.log(message);
   if (message.stack) {
      console.log(message.stack);
   }
};