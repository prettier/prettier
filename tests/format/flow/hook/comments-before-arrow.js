/*
The following should format like `ArrowFunctionExpression`,
but currently the AST shape are different, and it allows line break before `=>`

This is valid

```
type A1 = hook  () /*
1 *\/ => void
```

while this is invalid

```
a = () /*
1 *\/ => void
```
*/
type A1 = hook /* 11 */ () => void
type A2 = hook () /* 12 */ => void
type A3 = hook ()  => /* 13 */ void

a = /* 21 */ () => {}
a = () /* 22 */ => {}
a = ()  => /* 23 */ {}
