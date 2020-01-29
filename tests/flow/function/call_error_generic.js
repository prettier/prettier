// @flow

declare var some: ?{
  x: string;
}

declare class Set<T> {
  add(x: T): void;
}
declare class ROArray<+T> { }
declare class RWArray<T> extends ROArray<T> { }

declare function from<X>(set: Set<X>): RWArray<X>;

const foo = (() => {
  const set = new Set();
  set.add(some?.x);
  return from(set);
})();

function bar(x: ROArray<string>) { }

bar(foo);
