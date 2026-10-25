type Foo = {
  get(key: "foo"): `
  `;
};
type Foo = {
  get(key: "foo"): `
   ${x}
  `;
};
type Foo = {
  get(key: "foo"): ``;
};
type Foo = {
  get(key: "foo"): `${x}`;
};

type Bar = {
  get(key: "bar"): {
    bar: "bar"
  };
}
type Bar = {
  get(key: "bar"): { bar: "bar" };
}
