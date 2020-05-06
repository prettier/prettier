/* @flow */

class Bar<T: {}> {
    good (x: number) : $ReadOnlyWeakSet<T> { // Fine, invariant in invariant position
        return new WeakSet();
    }
}

class Foo<+T: {}> {
    bad (x: number) : $ReadOnlyWeakSet<T> { // Error: T in invariant position
        return new WeakSet();
      }
}

class Baz<-T: {}> {
    bad (x: number) : $ReadOnlyWeakSet<T> {// Error: T in invariant position
        return new WeakSet();
    }
}
