var FOO = Symbol();
var BAR = Symbol('bar');

// TODO: Expected error
var WAT = Symbol('foo', 'bar');
