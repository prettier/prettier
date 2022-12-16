let.a = 1;

foo = [];
(let[a] = 1);

foo = [];
(let[a].b.c.e = 1);

foo[let[a]] = 1;
(let)[let[a]] = 1;

foo = let[a];
