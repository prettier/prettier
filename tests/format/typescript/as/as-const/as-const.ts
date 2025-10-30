1 /* comment */ as const;
1 as /* comment */ const;
1 as const /* comment */;
1 as const; /* comment */

(1 // comment
) as const;
1 as // comment
const;
1 as const // comment
;
1 as const; // comment

1 as /* comment */ not_const;

// https://github.com/prettier/prettier/issues/18160
// 1 as /*
// 1
// */ const;
1 as
/*
2
*/ const;
// https://github.com/prettier/prettier/issues/18160
// 1 as /*
// 3
// */
// const;
1 as
/*
4
*/
const;
