var o1 = { x: 0, y: "" };
var o2 = { z: o1 }

var o3 = {};
o3.w = o2;

//declare module.exports: { w: any };

module.exports = o3;
