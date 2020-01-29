/**
 * @format
 * @flow
 */

class X {
  p: number | string;
  m() {
    if (typeof this.p === 'number') {
      this.p = 'foo';
    }
    (this.p: number);
  }
}
