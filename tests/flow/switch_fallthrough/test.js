type Enum = 'foo' | 'bar' | 'baz';
declare var x: Enum;
switch (x) {
  case 'bar':
    break;
}

(x : 'bar'); // error

switch (x) {
  case 'foo':
  case 'bar':
    break;
  case 'qux': // error
    break;
}

switch (x) {
  case 'foo':
  case 'bar':
    break;
  case 'qux': // error
    break;
}

switch (x) {
  case 'bar':
    x = 'foo';
}

(x : 'foo'); // error

declare var y: Enum

switch (y) {
  case 'bar':
  case 'baz':
    y = 'foo';
}

(y : 'foo'); // no error
