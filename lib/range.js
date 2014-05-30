var Range = function (start, end, inclusive_start, inclusive_end) {
   this.start = start;
   this.end = end;
   this.inclusive_end = inclusive_end;
   this.inclusive_start = inclusive_start;
};

Range.prototype.contains = function (value) {
   var a, b;

   if (this.inclusive_start) {
      a = value >= this.start;
   } else {
      a = value > this.start;
   }

   if (this.inclusive_end) {
      b = value <= this.end;
   } else {
      b = value < this.end;
   }

   return a && b;
};

module.exports = Range;