obj.foo ?? "default";

const x = (foo, bar = foo ?? bar) => {};

foo ? bar ?? foo : baz;

foo ?? (bar ?? baz);

(foo ?? baz) || baz;

// Note: this will trigger a syntax error once the parsers have been
// updated to the latest specification. If you are doing the upgrade,
// please remove the following line (and this comment).
foo ?? baz || baz;

(foo && baz) ?? baz;
foo && (baz ?? baz);
