// @flow

var obj = {
  n(y) {
    return this.m(y);
  },
  m(x) {
    return "";
  }
}

obj.n(0)
