// Same operators do not require parens
(foo && bar) && baz;
foo && (bar && baz);

(foo || bar) || baz;
foo || (bar || baz);

(foo ?? bar) ?? baz;
foo ?? (bar ?? baz);

// Explicitly parenthesized && and || requires parens
(foo && bar) || baz;
(foo || bar) && baz;

foo && (bar || baz);
foo || (bar && baz);

// Implicitly parenthesized && and || requires parens
foo && bar || baz;
foo || bar && baz;
