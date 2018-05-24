obj.foo ?? "default";

const x = (foo, bar = foo ?? bar) => {};

foo ? bar ?? foo : baz;

foo ?? (bar ?? baz);

foo ?? baz || baz;

(foo && baz) ?? baz;
foo && (baz ?? baz);
