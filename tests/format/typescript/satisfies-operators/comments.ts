const t1 = {
    prop1: 1,
    prop2: 2,
    prop3: 3
} satisfies
// Comment
Record<string, number>;

const t2 = {} /* comment */ satisfies {};
const t3 = {} satisfies /* comment */ {};
const t4 = {} /* comment1 */ satisfies /* comment2 */ {};
