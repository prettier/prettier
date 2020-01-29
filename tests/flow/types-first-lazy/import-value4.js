// @flow

const { A } = require('./import-value5');

export class B extends A {
  m(): B { return new B; }
}
