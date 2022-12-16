let.a = 1;

foo = [];
(let[a] = 1);

foo = [];
(let[a].b.c.e = 1);

foo = [];
foo[let[a]] = 1;

foo = [];
(let)[let[a]] = 1;

foo = [];
(let[a] ??= 1);

foo = let[a];

foo = [];
let()[a] = 1;

foo = [];
foo(let)[a] = 1;

foo = [];
foo(let[a])[a] = 1;
