var CycleMap = function (ranges, accessor) {
   this.ranges = ranges;
   this.accessor = accessor;
};

CycleMap.prototype.get_value = function(value) {
   for (var i = 0; i < this.ranges.length; i++) {
      if (this.ranges[i].range.contains(value)) {
         return this.accessor(this.ranges[i]);
      }
   }
};

module.exports = CycleMap;