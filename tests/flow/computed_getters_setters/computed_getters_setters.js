/**
 * @flow
 */

var f = {
  get ['d']() { return 'foo'; },
  set ['d'](x: number) {},
  set "stringLiteral"(x: number) { },
  get "stringLiteral"(): number { return 4; },
};

class Bar {
  get ['d']() { return 'foo'; }
  set ['d'](x: number) {}
}
