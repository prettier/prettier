// @flow

class C<T> {
  arr: Array<{value: T}>;

  foo(value: T) {
    var entry: {value: T} = {value};
    this.arr.push(entry);
  }
}
