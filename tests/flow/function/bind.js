// @flow

let tests = [
  function(x: (a: string, b: string) => void) {
    let y = x.bind(x, 'foo');
    y('bar'); // ok
    y(123); // error, number !~> string
  },
];
