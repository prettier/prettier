/* This is a regression test. If `this` appears in an input position reachable
 * from exports, we would raise a confusing error, because the assert ground
 * visitor would reach the instantiating tvar.
 *
 * For example, the example below would give an assert ground error:
 *  Missing type annotation for new C().
 */

class C {
  m(x: this) { } // error: this in contravariant position
}

module.exports = {
  foo: new C(), // no missing annot error here
}
