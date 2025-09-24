// Can't use `export *`
// https://github.com/microsoft/TypeScript/issues/51923

export { equal, ok, strictEqual } from "node:assert";
