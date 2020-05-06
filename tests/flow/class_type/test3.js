type T = { [string]: Class<null> }
var o: T = {};

// need use to force evaluation of ClassT type
o.p.foo;
