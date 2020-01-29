//@flow

const cycle2 = require('cycle2');

let f : number = cycle2.a + cycle2.c;
let g : string = cycle2.b;

module.exports = {x : number, y : string};
