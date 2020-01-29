var p = { y: "" };
var q = { z: "" };
var o = {
  x: 5,
  ...p,
  ...q,
};
var y: number = o.y; // Error string ~> number
var z: number = o.z; // Error string ~> number

// test conflicting keys (they get overwritten)
var r = { y: 123 };
var s = {
  ...p,
  ...r,
};
var t: number = s.y;
