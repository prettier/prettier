// asi with MemberExpression & BinaryExpression:
x ; (a + b).c

// asi with MemberExpression & LogicalExpression:
x ; (a || b).c

// no asi:
x ; ab.c

// asi with MemberExpression, computed property & BinaryExpression:
x ; (a + b)[c]
