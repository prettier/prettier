// Line terminators are not allowed between the argument and a postfix operator,
// so the parentheses must be kept.
(a/*
*/)++;

(a/*
*/)--;

(a.b/*
*/)++;

f((a/*
*/)++);

// Safe, the operator comes first.
f(++(a/*
*/));

// Safe, the comment doesn't span lines.
(a /* comment */)++;

// Safe, a line comment moves to the end of the line.
(a//
)++;
