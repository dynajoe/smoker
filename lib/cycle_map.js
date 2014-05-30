var _ = require('underscore');

var CycleMap = function (ranges, accessor) {
   this.ranges = ranges;
   this.accessor = accessor;
};

CycleMap.prototype.cycleAt = function (value) {
   var range = _.find(this.ranges, function (r) {
      return r.range.contains(value);
   });

   return this.accessor(range);
};

module.exports = CycleMap;