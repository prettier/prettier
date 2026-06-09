type F<T> = Readonly<{
    log: (() => T) => void,
    ...
  }>;

  declare function map<O extends {...}>(o1: O): {[K in keyof O]: O[K] extends F<infer V> ? V : empty};

  const foo = Object.freeze({bar: {log: (f: () => string) => {}}})
  const o1 = map(foo) as {readonly bar: number}; // error
