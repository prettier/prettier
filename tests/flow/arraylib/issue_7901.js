// @flow

var und1: void = [0].reduce(acc => acc, undefined); // ok
var und2: void = [0].reduceRight(acc => acc, undefined); // ok
