/* @flow */

class Bar<K: {}, V> {
    good (x: number) : $ReadOnlyWeakMap<K, V> {
        return new WeakMap(); // Fine, Invariant in invariant position
    }
}

class FooK<+K: {}, V> {
    bad (x: number) : $ReadOnlyWeakMap<K, V> { // Error: K in invariant position
        return new WeakMap();
    }
}

class FooV<K: {}, +V> {
    bad (x: number) : $ReadOnlyWeakMap<K, V> { // Fine, V in covarint position
        return new WeakMap();
    }
}

class BazK<-K: {}, V> {
    bad (x: number) : $ReadOnlyWeakMap<K, V> {// Error: K in covariant position
        return new WeakMap();
    }
}

class BazV<K: {}, -V> {
    bad (x: number) : $ReadOnlyWeakMap<K, V> {// Error: V in covariant position
        return new WeakMap();
    }
}
