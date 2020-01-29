/* @flow */

class Bar<K, V> {
    good (x: number) : $ReadOnlyMap<K, V> {
        return new Map(); // Fine, Invariant can flow to covariant
    }
}

class FooK<+K, V> {
    bad (x: number) : $ReadOnlyMap<K, V> { // Error: K in invariant position
        return new Map();
    }
}

class FooV<K, +V> {
    bad (x: number) : $ReadOnlyMap<K, V> { // Fine, V in covariant position
        return new Map();
    }
}

class BazK<-K, V> {
    bad (x: number) : $ReadOnlyMap<K, V> {// Error: K in invariant position
        return new Map();
    }
}

class BazV<K, -V> {
    bad (x: number) : $ReadOnlyMap<K, V> {// Error: V in invariant position
        return new Map();
    }
}
