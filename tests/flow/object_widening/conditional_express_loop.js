//@flow
declare function reduce<T>(fn: (T) => T): any;

reduce(
    (newItem) =>
  true ? {...newItem} : newItem // Ok!
);
