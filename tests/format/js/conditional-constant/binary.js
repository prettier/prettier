const a = foooo === foo ? bar: baz;

a.b = foooooooo === foo ? bar: baz;

const c = a === foo ? bar: baz ? bar: baz;

const d = foo ? bar: a === foo;

const e = foo ? (foo ? bar: baz): baz;

const f = foo ? (foo === bar): baz;

const g = foooo && fooo ? bar: baz;

const h = foooo ?? fooo ? bar: baz;

const i = foooo || fooo ? bar: baz;

const j = fooooo > fooo ? bar: baz;

const k = fooooo < fooo ? bar: baz;

const l = foooo >= fooo ? bar: baz;

const m = foooo <= fooo ? bar: baz;

const n = foooo != fooo ? bar: baz;

const o = foooo != fooo && fooo != fooo ? bar: baz;

const x = {
  prop1: fooooo === foo ? foo: foo,
}

class X {
  prop1 = foooo === foo ? foo: foo;
  #prop2 = fooo === foo ? foo: foo;
}

