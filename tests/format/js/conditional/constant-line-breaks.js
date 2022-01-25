const a = foo === null ? bar: baz;
const b = !foooooooooo ? bar: baz;
const c = fooooooooooo ? bar: baz;
const d = foooo.oooooo ? bar: baz;
const e = foooooo.oo() ? bar: baz;
const f = fooooooooo++ ? bar: baz;

const func = async () => {
  const a = await oo() ? bar: baz;
  const x = {
    prop1: await oo() ? bar : baz,
  }
}

const x = {
  prop1: foo === null ? bar : baz,
  prop2: !foooooooooo ? bar : baz,
  prop3: fooooooooooo ? bar : baz,
  prop4: foooo.oooooo ? bar : baz,
  prop5: foooooo.oo() ? bar : baz,
  prop6: fooooooooo++ ? bar : baz,
};
