// Results of using spaceBeforeFunctionParen: true setting
// should match results of using the following
// tslint rule (with one exception marked):
// "space-before-function-paren": [true, "always"]
// (with no rules from "tslint:recommended")

function foo() {
  // ...
}

var bar = function() {
  // ...
};

var bar = function foo() {
  // ...
};

function baz<T>(a: T) {
  // ...
}

// tslint seems to miss this one:
var baz = function<T>(a: T) {
  // ...
};

var baz = function foo<T>(a: T) {
  // ...
};

class Foo {
  constructor() {
    // ...
  }
  public bar() {
    // ...
  }
  public baz<T>(a: T) {
    // ...
  }
}

var foo = {
  bar() {
    // ...
  },
  baz<T>(a: T) {
    // ...
  }
};

var foo = async() => 1;
