/**
 * Use a naive regular expression to detect JSX
 * copied from typescript.js
 */
export default new RegExp(
  [
    "^[^\"'`]*</", // Contains "</" when probably not in a string
    "|",
    "^[^/]{2}.*/>", // Contains "/>" on line not starting with "//"
  ].join(""),
  "mu",
);
