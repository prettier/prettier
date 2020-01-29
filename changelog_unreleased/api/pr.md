#### Change default value for `singleQuotes` to `true` ([#7466](https://github.com/prettier/prettier/pull/7466) by [@karlhorky](https://github.com/karlhorky))

[Since version 0.0.1](https://github.com/prettier/prettier/commit/599b4311bb6be9204689a7725d37d6fdfca770aa), Prettier has an [option](https://prettier.io/docs/en/options.html#quotes) to use single quotes instead of double quotes.
Since version 2.0, the default of this option changes from `false` to `true`.

<!-- prettier-ignore -->
```js
// Input
const foo = 'bar';
// Prettier stable
const foo = "bar";
// Prettier master
const foo = 'bar';
```

The JavaScript ecosystem has largely standardized on single quotes, with it being the most popular style seen in the wild.

If the old behavior is still preferred, please configure Prettier with `{ "singleQuotes": false }`.