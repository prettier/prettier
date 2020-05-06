// @flow

let foo = 123;

{
  let foo = 'abc';
  foo;
}

foo;

let bar;
if (true) {
  bar = 1;
} else {
  bar = 2;
}
bar;


let x;
x = 123;
x;

{
  let val = 'foo';
  let obj = { foo: val };
  let foo = obj.foo;
}
