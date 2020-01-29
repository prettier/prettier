/* @flow */

function foo(x: bool | number) {
  if (typeof x === "boolean") {
    x[0]; // error for boolean, not number
  }
}

function bar(): number {
  var x = null;
  if (typeof x === "object") {
    return x; // error, null
  }
  return 0;
}

/* refining globals */
function fn0() {
  if (typeof BAZ !== 'undefined' &&
      typeof BAZ.stuff === 'function') {
    BAZ.stuff(123);
  }
  BAZ.stuff(123); // error, refinement is gone
}
function fn1() {
  BAZ.stuff; // error, could be undefined
  if (typeof BAZ !== 'undefined' &&
      typeof BAZ.stuff === 'function') {
    BAZ.stuff(123); // ok
    BAZ.stuff(123); // error, refinement is gone
  }
}

function anyfun(x: number | Function): number {
  if (typeof x === "function") {
    return 0;
  }
  return x; // OK, x refined to `number`
}

function anyobj(x: number | Object): number {
  if (typeof x === "object") {
    return 0;
  }
  return x; // OK, x refined to `number`
}

function testInvalidValue(x: mixed) {
  if (typeof x === "foo") { // error
    return 0;
  }
}

function testTemplateLiteral(x: string | number) {
  if (typeof x === `string`) {
    return x.length;
  }
}

function testInvalidTemplateLiteral(x: string | number) {
  if (typeof x === `foo`) { // error
    return 0;
  }
}

function testClassIsFunction() {
  class Foo {}
  if (typeof Foo === "function") {
    (Foo: empty); // error, Foo is a class
  }
}

function testInstanceIsObject() {
  class Foo {}
  let x = new Foo();
  if (typeof x === "object") {
    (x: empty); // error
  }
}

function testSymbol(x: mixed) {
  if (typeof x === "symbol") { // ok
    (x: string); // error
  }
}
