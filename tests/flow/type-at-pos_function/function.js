// @flow

const a = {
  bar(): void {}
};

const b = {
  bar: function (): void {}
};

const c = {
  m<T>(x: T): T { return x; }
};

const d = {
  m: function<T>(x: T): T { return x; }
};
