// Original issue case - long condition with experimental-ternaries and no-semi
let o = 1;
(1 || 12345678901234567890123456789012345678901234567890123456789012345678901234567890) ? 2 : 3

// Simple case
let x = 1;
(true) ? 2 : 3

// Nested parens
let y = 1;
((a || b)) ? 2 : 3

// Multiple consecutive
let z = 1;
(a) ? 2 : 3
(b) ? 4 : 5
