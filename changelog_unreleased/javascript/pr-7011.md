#### Preserve parentheses for JSDoc type casting with extra spaces and asterisk at end ([#7011](https://github.com/prettier/prettier/pull/7011) by [@evilebottnawi](https://github.com/evilebottnawi))

Formatting of comments in labeled statements was not stable

<!-- prettier-ignore -->
```javascript
// Input
const foo = /** @type {!Foo} **/ (baz);
const bar = /** @type {!Foo}  * * */(baz);

// Prettier stable
const foo = /** @type {!Foo} **/ baz;
const bar = /** @type {!Foo}  * * */ baz;

// Prettier master
const foo = /** @type {!Foo} **/ (baz);
const bar = /** @type {!Foo}  * * */ (baz);
```
