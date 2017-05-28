class X {
    optionalMethod?() {}
}

interface Iterable<T> {
  export [Symbol.iterator](): Iterator<T>;
}
