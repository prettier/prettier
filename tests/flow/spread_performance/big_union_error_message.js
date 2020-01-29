//@flow

let x;
let y;

if (true) {
  x = {foo: 3};
  y = {foo: 3};
} else if (true) {
  x = {bar: 3};
  y = {bar: 3};
} else if (true) {
  x = {baz: 3};
  y = {baz: 3};
} else {
  x = {qux: 3};
  y = {qux: 3};
}
var z = {...x, ...y}; // Error, only mentions two elements per union
