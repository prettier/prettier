//@flow

function foo(arr: $ReadOnlyArray<Object>) {
    return arr.map(foo)
        .reduce((acc, item) => acc.concat(item), [])
        .filter(Boolean);
  }
