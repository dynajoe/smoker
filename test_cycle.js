var CycleMap = require('./lib/cycle_map');
var Range = require('./lib/range');

pid_cycle_map = new CycleMap([
                                  { range: new Range(Number.NEGATIVE_INFINITY, -2, false, true), cycle: 0 },
                                  { range: new Range(-2, 10, false, true), cycle: 0.60 },
                                  { range: new Range(10, 19, false, true), cycle: 0.75 },
                                  { range: new Range(19, Number.POSITIVE_INFINITY, false, true), cycle: 1 }
],
function (r) {
   return r ? r.cycle : 0;
});

console.log(pid_cycle_map.cycleAt(1.6));
