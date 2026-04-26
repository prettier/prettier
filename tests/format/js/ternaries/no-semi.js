// https://github.com/prettier/prettier/issues/18965
// no-semi + experimental-ternaries: leading semicolon must be preserved when
// the ternary condition wraps in parens (ifBreak) to avoid ASI hazard.

let o = 1;
(
    1 ||
    12345678901234567890123456789012345678901234567890123456789012345678901234567890
) ?
    2
:   3
