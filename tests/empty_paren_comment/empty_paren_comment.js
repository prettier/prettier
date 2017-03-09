let f = (/* ... */) => {}
(function (/* ... */) {})(/* ... */)
function f(/* ... */) {}

const obj = {
  f(/* ... */) {},
  f: (/* ... */) => {},
  f: function(/* ... */) {},
  f: function f(/* ... */) {}
}

class Foo {
  f(/* ... */) {}
  f = (/* ... */) => {};
  static f(/* ... */) {};
  static f = (/* ... */) => {};
  static f = function(/* ... */) {};
  static f = function f(/* ... */) {};
  static f /* ... */() {};
}

f(/* ... */);
f(a, /* ... */);
f(a, /* ... */ b);
f(/* ... */ a, b);
