import { createMethodShim } from "./shared.js";

const loneSurrogate = /[\uD800-\uDFFF]/u;

const stringIsWellFormed =
  String.prototype.isWellFormed ??
  /*
  This implementation is not verified, should only apply to meriyah package
  https://github.com/meriyah/meriyah/pull/527

  Update: acorn and babel just use `/[\uD800-\uDFFF]/u.test()`, aligned with them
  https://github.com/acornjs/acorn/blob/c8d515c7f9c8baa62bf5ccffba98507b7be46218/acorn/src/statement.js#L1228
  https://github.com/babel/babel/blob/e74e391f324d1e63533e75c118a02689cb8aeeb4/packages/babel-parser/src/parser/statement.ts#L2679
  */
  function () {
    return !loneSurrogate.test(this);
  };

const isWellFormed = /* @__PURE__ */ createMethodShim(
  "isWellFormed",
  function () {
    if (typeof this === "string") {
      return stringIsWellFormed;
    }
  },
);

export default isWellFormed;
