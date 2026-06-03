const x1 = (a, b, c /* comment */);
const x2 = (a = c /* comment */);

(a, b, c /* comment */);
(a, b, c /* comment */
);
(a = c /* comment */);
(a = c /* comment */
);
({a} = c /* comment */);
({a} = c /* comment */
);

assigned = (a, b, c /* comment */);
// assigned = (a = c /* comment */);

function f() {
  return (a, b, c /* comment */);
  return (a = c /* comment */);
}
