import isEs5IdentifierName from "is-es5-identifier-name";
import { printComments } from "../../main/comments/print.js";
import printNumber from "../../utilities/print-number.js";
import printString from "../../utilities/print-string.js";
import getRaw from "../utilities/get-raw.js";
import { isNumericLiteral, isStringLiteral } from "../utilities/index.js";

/**
@import {NumericLiteral} from "../types/estree.js"
*/

const needsQuoteProps = new WeakMap();
const isTsEnumMember = (node) => node.type === "TSEnumMember";
const getKeyProperty = (node) => (isTsEnumMember(node) ? "id" : "key");
const getKey = (node) => node[getKeyProperty(node)];
const isComputedKey = (node) => !isTsEnumMember(node) && node.computed;

// Matches “simple” numbers like `123` and `2.5` but not `1_000`, `1e+100` or `0b10`.
function isSimpleNumber(numberString) {
  return /^(?:\d+|\d+\.\d+)$/.test(numberString);
}

/**
@param {NumericLiteral} numericLiteral
@returns {boolean}
*/
function isNumberSafeToQuote(numericLiteral, options) {
  const { parser } = options;

  // Quoting number keys is safe in JS and Flow, but not in TypeScript (as
  // mentioned in `isStringKeySafeToUnquote`).
  if (parser === "typescript" || parser === "babel-ts" || parser === "oxc-ts") {
    return false;
  }

  const printedNumber = printNumber(getRaw(numericLiteral));

  return (
    // Avoid converting 999999999999999999999 to 1e+21, 0.99999999999999999 to 1 and 1.0 to 1.
    String(numericLiteral.value) === printedNumber &&
    isSimpleNumber(printedNumber)
  );
}

// Note: Quoting/unquoting numbers in TypeScript is not safe.
//
// let a = { 1: 1, 2: 2 }
// let b = { '1': 1, '2': 2 }
//
// declare let aa: keyof typeof a;
// declare let bb: keyof typeof b;
//
// aa = bb;
// ^^
// Type '"1" | "2"' is not assignable to type '1 | 2'.
//   Type '"1"' is not assignable to type '1 | 2'.(2322)
//
// And in Flow, you get:
//
// const x = {
//   0: 1
//   ^ Non-string literal property keys not supported. [unsupported-syntax]
// }
//
// Angular does not support unquoted numbers in expressions.
//
// So we play it safe and only unquote numbers for the JavaScript parsers.
// (Vue supports unquoted numbers in expressions, but let’s keep it simple.)
//
// Identifiers can be unquoted in more circumstances, though.
function isStringKeySafeToUnquote(node, options) {
  const key = getKey(node);

  if (
    options.parser === "json" ||
    options.parser === "jsonc" ||
    !isStringLiteral(key) ||
    printString(getRaw(key), options).slice(1, -1) !== key.value
  ) {
    return false;
  }

  // Safe to unquote as identifier
  if (
    isEs5IdentifierName(key.value) &&
    // With `--strictPropertyInitialization`, TS treats properties with quoted names differently than unquoted ones.
    // See https://github.com/microsoft/TypeScript/pull/20075
    !(
      (options.parser === "babel-ts" && node.type === "ClassProperty") ||
      ((options.parser === "typescript" || options.parser === "oxc-ts") &&
        node.type === "PropertyDefinition")
    )
  ) {
    return true;
  }

  // Safe to unquote as number
  if (
    isSimpleNumber(key.value) &&
    String(Number(key.value)) === key.value &&
    node.type !== "ImportAttribute" &&
    (options.parser === "babel" ||
      options.parser === "acorn" ||
      options.parser === "oxc" ||
      options.parser === "espree" ||
      options.parser === "meriyah" ||
      options.parser === "__babel_estree")
  ) {
    return true;
  }

  return false;
}

function shouldQuoteKey(path, options) {
  const key = getKey(path.node);
  return (
    (key.type === "Identifier" ||
      (isNumericLiteral(key) && isNumberSafeToQuote(key, options))) &&
    (options.parser === "json" ||
      options.parser === "jsonc" ||
      (options.quoteProps === "consistent" && needsQuoteProps.get(path.parent)))
  );
}

function shouldUnquoteKey(path, options) {
  return (
    isStringKeySafeToUnquote(path.node, options) &&
    (options.quoteProps === "as-needed" ||
      (options.quoteProps === "consistent" &&
        !needsQuoteProps.get(path.parent)))
  );
}

/*
- `ClassProperty`
- `PropertyDefinition`
- `ClassPrivateProperty`
- `ClassAccessorProperty`
- `AccessorProperty`
- `ObjectMethod`
- `Property`
- `ObjectProperty`
- `ClassMethod`
- `ClassPrivateMethod`
- `MethodDefinition
- `Property`
- `ObjectProperty`
- `ImportAttribute`
- `TSAbstractAccessorProperty` (TypeScript)
- `TSAbstractPropertyDefinition` (TypeScript)
- `TSAbstractMethodDefinition` (TypeScript)
- `TSDeclareMethod` (TypeScript)
- `TSPropertySignature` (TypeScript)
- `ObjectTypeProperty` (Flow)
*/
function printKey(path, options, print) {
  const { node } = path;
  const isTsEnumMember = node.type === "TSEnumMember";
  const property = isTsEnumMember ? "id" : "key";

  if (!isTsEnumMember && node.computed) {
    return ["[", print(property), "]"];
  }

  const { parent } = path;
  const { [property]: key } = node;

  if (options.quoteProps === "consistent" && !needsQuoteProps.has(parent)) {
    const objectHasStringProp = path.siblings.some(
      (prop) =>
        (isTsEnumMember || !prop.computed) &&
        isStringLiteral(prop[property]) &&
        !isStringKeySafeToUnquote(prop, options),
    );
    needsQuoteProps.set(parent, objectHasStringProp);
  }

  if (shouldQuoteKey(path, options)) {
    // a -> "a"
    // 1 -> "1"
    // 1.5 -> "1.5"
    const printed = printString(
      JSON.stringify(
        key.type === "Identifier" ? key.name : key.value.toString(),
      ),
      options,
    );
    return path.call(() => printComments(path, printed, options), property);
  }

  if (shouldUnquoteKey(path, options)) {
    // 'a' -> a
    // '1' -> 1
    // '1.5' -> 1.5
    const printed = /^\d/.test(key.value) ? printNumber(key.value) : key.value;
    return path.call(() => printComments(path, printed, options), property);
  }

  return print(property);
}

export { printKey };
