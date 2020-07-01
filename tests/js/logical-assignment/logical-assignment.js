a ||= b;

a &&= "foo";
b ||= "foo";
c ??= "foo";

d &&= 42;
e ||= 42;
f ??= 42;

g &&= 42;
h ||= 42;
i ??= 42;

a.baz &&= result.baz;
b.baz ||= result.baz;
c.baz ??= result.baz;

a.foo["baz"] &&= result.foo.baz;
b.foo["baz"] ||= result.foo.baz;
c.foo["baz"] ??= result.foo.baz;

a.foo.bar().baz &&= result.foo.bar().baz;
b.foo.bar().baz ||= result.foo.bar().baz;
c.foo.bar().baz ??= result.foo.bar().baz(a.baz) &&= result.baz;
b.baz ||= result.baz;
c.baz ??= result.baz;

function foo1(results) {
  (results ||= []).push(100);
}

function foo2(results) {
  (results ??= []).push(100);
}

function foo3(results) {
  results ||= [];
  results.push(100);
}

function foo4(results) {
  results ??= [];
  results.push(100);
}

function doSomethingWithAlias(thing, defaultValue) {
  if (v === 1) {
    if ((thing &&= thing.original)) {
      thing.name;
    }
  } else if (v === 2) {
    if ((thing &&= defaultValue)) {
      thing.name;
      defaultValue.name;
    }
  } else if (v === 3) {
    if ((thing ||= defaultValue)) {
      thing.name;
      defaultValue.name;
    }
  } else {
    if ((thing ??= defaultValue)) {
      thing.name;
      defaultValue.name;
    }
  }
}

function foo1(f) {
  f ??= (a) => a;
  f(42);
}

function foo2(f) {
  f ||= (a) => a;
  f(42);
}

function foo3(f) {
  f &&= (a) => a;
  f(42);
}

function bar1(f) {
  f ??= (f.toString(), (a) => a);
  f(42);
}

function bar2(f) {
  f ||= (f.toString(), (a) => a);
  f(42);
}

function bar3(f) {
  f &&= (f.toString(), (a) => a);
  f(42);
}

function foo1(results, results1) {
  (results ||= results1 ||= []).push(100);
}

function foo2(results, results1) {
  (results ??= results1 ??= []).push(100);
}

function foo3(results, results1) {
  (results &&= results1 &&= []).push(100);
}

obj[incr()] ??= incr();
oobj["obj"][incr()] ??= incr();
