// @flow

const b = (x, y, z) => x(y, z.f);
b((k, l) => (l + k), "a", { f: 2 });
