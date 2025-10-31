// Test case for issue #18145: parentheses should be preserved when child operator
// has higher precedence than parent bitwise operator
// https://github.com/prettier/prettier/issues/18145

// Parentheses should be preserved when using % with bitwise shift operators
1 << (bit % 8);
1 >> (bit - 8);

// Parentheses should be preserved for other bitwise operators too
1 | (bit % 8);
1 & (bit % 8);
1 ^ (bit % 8);
1 >>> (bit % 8);

// Regression test: % with + / - should still work correctly
// (a + b) % c should not become a + b % c
(a + b) % c;
a % (b + c);

// Parentheses should be preserved when using other operators with bitwise
1 << (bit * 8);
1 >> (bit / 8);
1 << (bit + 8);
1 >> (bit - 8);

