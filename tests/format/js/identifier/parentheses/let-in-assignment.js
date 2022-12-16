let.a = 1;

let.a[0] = 1;

(let[a] = 1);

(let[a].b.c.e = 1);

foo[let[a]] = 1;

(let)[let[a]] = 1;

(let[a] ??= 1);

foo = let[a];

let()[a] = 1;

foo(let)[a] = 1;

foo(let[a])[a] = 1;

(let[0] = 1);

(let["a"] = 1);

let = 1;

var let = 1;

[let[a]] = 1;

({a: let[a]} = 1)
