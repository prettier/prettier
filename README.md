# C-Prettier

This is [Prettier](https://github.com/prettier/prettier), with an additional option `jsxMaxPropsPerLine` which objective is to allow users to specify the maximum number of props they want on a single line in a JSX element.

eg.

```js
<AmazingElement width={100} height={100} />
```

with option `jsxMaxPropsPerLine` set to `1`:


```js
<AmazingElement
  width={100}
  height={100}
/>
```

See [Prettier Issue #3101](https://github.com/prettier/prettier/issues/3101)

To use the option, add it to your `.prettierrc` (or equivalent) config file.

This is just a very simple fork aiming to be a drop-in replacmeent, so just replace `prettier` by `c-prettier` in your `package.json`, `npm install`, and you're good to go.

You should not have Prettier and C-Prettier installed together, as something will probably break somewhere, since the `bin` file is still named `prettier` to ensure all integrations (plugins for code editors for example) work.
