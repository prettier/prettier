//@flow
const a = require('./a');
class A {
  static x: number = 3;
  _munged(arg) { return a; }
}

module.exports = A;
