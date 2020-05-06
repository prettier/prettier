// @flow

declare var b: boolean;
declare function make<U>(cb: (U) => U): $NonMaybeType<U>;
make(x => (b ? x : 42));

declare var arr: Array<{ +f: ?number }>;
let acc = [];
arr.forEach(x => acc.push(x.f));
acc = acc.filter(Boolean);
