new Foo// 1
<string>(1);
new Foo
// 2
<string>(1);
new Foo/* 3 */
<string>(1);
new Foo
/* 4 */
<string>(1);
new Foo/* 5 */<string>(1);

foo?.// 6
<string>(1);
foo?.
// 7
<string>(1);
foo?./* 8 */<string>(1);

(foo?.bar)// 9
<string>(1);
(foo?.bar)
// 10
<string>(1);

a.b
// 11
<string>(1);
a.b/* 12 */<string>(1);

(a +   b)
// prettier-ignore
<   string   >(1);
(a +   b) /* prettier-ignore */ <   string   >(1);
