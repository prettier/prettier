// Callable properties are not inherited

function f() {}
var o = Object.create(f);
o(); // error: o is not callable
