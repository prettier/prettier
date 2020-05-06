/**
 * @format
 * @flow
 */

type O = {p: empty};
const o1 = {p: 42};
const o2 = {p: 42};
([o1]: [O]);
([o2]: [{p: empty | empty}] | [{p: empty | empty}]);

const five_line_error: number = `Line 1
Line 2
Line 3
Line 4
Line 5`;

const ten_line_error: number = `Line 1
Line 2
Line 3
Line 4
Line 5
Line 6
Line 7
Line 8
Line 9
Line 10`;
