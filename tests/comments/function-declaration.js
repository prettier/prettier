function a(/* comment */) {} // comment
function b() {} // comment
function c(/* comment */ argA, argB, argC) {} // comment
call((/*object*/ row) => {});
KEYPAD_NUMBERS.map(num => ( // Buttons 0-9
  <div />
));

function f /* f */() {}
function f (/* args */) {}
function f () /* returns */ {}
function f /* f */(/* args */) /* returns */ {}

function f /* f */(/* a */ a) {}
function f /* f */(a /* a */) {}
function f /* f */(/* a */ a) /* returns */ {}

const obj = {
  f1 /* f */() {},
  f2 (/* args */) {},
  f3 () /* returns */ {},
  f4 /* f */(/* args */) /* returns */ {},
};

(function f /* f */() {})();
(function f (/* args */) {})();
(function f () /* returns */ {})();
(function f /* f */(/* args */) /* returns */ {})();

class C {
  f/* f */() {}
}
class C {
  f(/* args */) {}
}
class C {
  f() /* returns */ {}
}
class C {
  f/* f */(/* args */) /* returns */ {}
}

function foo() 
// this is a function
{
  return 42
}

function foo() // this is a function
{
  return 42
}

function foo() { // this is a function
  return 42
}

function foo() {
  // this is a function
  return 42;
}
