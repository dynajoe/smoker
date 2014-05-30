module.exports = function () {
   var args = Array.prototype.slice.call(arguments, 0);
   args.forEach(function (a) {
      console.log(new Date(), a);
      if (a.stack) {
         console.log(a.stack);
      }
   });
};