function Foo() { return {}; }
var foo: number = new Foo(); // error (returns object literal above)

function Bar() { return 0; }
var bar: number = new Bar(); // error (returns new object)

function Qux() { }
var qux: number = new Qux(); // error (returns new object)

class A { }
function B() { return new A(); }
var a: A = new B(); // OK (returns new A)
