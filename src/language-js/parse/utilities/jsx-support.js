/**
Follow https://typescript-eslint.io/packages/parser/#jsx
- `.js`, `.mjs`, `.cjs`, `.jsx`, `.tsx` files are always parsed as `{jsx: true}`.
- `.ts`, `.mts`, `.cts` files are always parsed as `{jsx: false}`.
*/

function shouldEnableJsx(filepath) {
  if (typeof filepath !== "string") {
    return;
  }

  filepath = filepath.toLowerCase();

  if (/\.(?:js|mjs|cjs|jsx|tsx)$/.test(filepath)) {
    return true;
  }

  if (/\.(?:ts|mts|cts)$/.test(filepath)) {
    return false;
  }
}

export { shouldEnableJsx };
