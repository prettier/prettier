/* @flow */

function takesBotFunction (x : empty => empty) {}
function takesTopFunction (x : mixed => mixed) {}
function takesMidFunction (x : empty => mixed) {}
function takesMidFunction2 (x : mixed => empty) {}
function takesHigherOrderFn (x : empty => empty => mixed) {}
function takesHigherOrderFn2 (x : (empty => mixed) => mixed) {}
function takesMultiArgFn (x : (empty, empty) => mixed) {}
function takesMultiArgFn2 (x : (mixed, mixed) => mixed) {}

function fun(x: mixed) {
  if (typeof x === "function") {
    takesBotFunction(x); //error
  }
}

function fun2(x: mixed) {
  if (typeof x === "function") {
    takesTopFunction(x); // error
  }
}

function fun3(x: mixed) {
  if (typeof x === "function") {
    takesMidFunction(x); // error
  }
}

function fun4(x: mixed) {
  if (typeof x === "function") {
    takesMidFunction2(x); // error
  }
}

function fun5(x: mixed) {
  if (typeof x === "function") {
    takesHigherOrderFn(x); // error
  }
}

function fun6(x: mixed) {
  if (typeof x === "function") {
    takesHigherOrderFn2(x); // error
  }
}

function fun7(x: mixed) {
  if (typeof x === "function") {
    takesMultiArgFn(x); // error
  }
}

function fun8(x: mixed) {
  if (typeof x === "function") {
    takesMultiArgFn2(x); // error
  }
}

function fun9(x: mixed, y : mixed, z : empty) {
  if (typeof x === "function") {
    x(y); // error
    x(z);
    x(x); // error
    x(1,2,3,4,5); //error
    x(...[1,2]); //error
    x();
  }
}

declare var obj : {field : mixed};
if (typeof obj.field === 'function') {
  const f = obj.field(0); // error
  const f2 = f.foo; // error
}

function fun10(x: mixed) {
  if (typeof x === "function") {
    x.name;
    x.length;
    x.foo; // error
    x.name = "bar"
    x.length = 3;
  }
}
