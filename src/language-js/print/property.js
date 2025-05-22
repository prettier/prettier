import isEs5IdentifierName from "is-es5-identifier-name";
import { printComments } from "../../main/comments/print.js";
import printNumber from "../../utils/print-number.js";
import printString from "../../utils/print-string.js";
import getRaw from "../utils/get-raw.js";
import { isNumericLiteral, isStringLiteral } from "../utils/index.js";
import { printAssignment } from "./assignment.js";

const needsQuoteProps = new WeakMap();

// Matches “simple” numbers like `123` and `2.5` but not `1_000`, `1e+100` or `0b10`.
function isSimpleNumber(numberString) {
  return /^(?:\d+|\d+\.\d+)$/u.test(numberString);
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
  if (
    options.parser === "json" ||
    options.parser === "jsonc" ||
    !isStringLiteral(node.key) ||
    printString(getRaw(node.key), options).slice(1, -1) !== node.key.value
  ) {
    return false;
  }

  // Safe to unquote as identifier
  if (
    isEs5IdentifierName(node.key.value) &&
    // With `--strictPropertyInitialization`, TS treats properties with quoted names differently than unquoted ones.
    // See https://github.com/microsoft/TypeScript/pull/20075
    !(
      (options.parser === "babel-ts" && node.type === "ClassProperty") ||
      (options.parser === "typescript" && node.type === "PropertyDefinition")
    )
  ) {
    return true;
  }

  // Safe to unquote as number
  if (
    isSimpleNumber(node.key.value) &&
    String(Number(node.key.value)) === node.key.value &&
    node.type !== "ImportAttribute" &&
    (options.parser === "babel" ||
      options.parser === "acorn" ||
      options.parser === "espree" ||
      options.parser === "meriyah" ||
      options.parser === "__babel_estree")
  ) {
    return true;
  }

  return false;
}

function shouldQuotePropertyKey(path, options) {
  const { key } = path.node;
  return (
    (key.type === "Identifier" ||
      (isNumericLiteral(key) &&
        isSimpleNumber(printNumber(getRaw(key))) &&
        // Avoid converting 999999999999999999999 to 1e+21, 0.99999999999999999 to 1 and 1.0 to 1.
        String(key.value) === printNumber(getRaw(key)) &&
        // Quoting number keys is safe in JS and Flow, but not in TypeScript (as
        // mentioned in `isStringKeySafeToUnquote`).
        !(options.parser === "typescript" || options.parser === "babel-ts"))) &&
    (options.parser === "json" ||
      options.parser === "jsonc" ||
      (options.quoteProps === "consistent" && needsQuoteProps.get(path.parent)))
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
function printPropertyKey(path, options, print) {
  const { node } = path;

  if (node.computed) {
    return ["[", print("key"), "]"];
  }

  const { parent } = path;
  const { key } = node;

  if (options.quoteProps === "consistent" && !needsQuoteProps.has(parent)) {
    const objectHasStringProp = path.siblings.some(
      (prop) =>
        !prop.computed &&
        isStringLiteral(prop.key) &&
        !isStringKeySafeToUnquote(prop, options),
    );
    needsQuoteProps.set(parent, objectHasStringProp);
  }

  if (shouldQuotePropertyKey(path, options)) {
    // a -> "a"
    // 1 -> "1"
    // 1.5 -> "1.5"
    const prop = printString(
      JSON.stringify(
        key.type === "Identifier" ? key.name : key.value.toString(),
      ),
      options,
    );
    return path.call((keyPath) => printComments(keyPath, prop, options), "key");
  }

  if (
    isStringKeySafeToUnquote(node, options) &&
    (options.quoteProps === "as-needed" ||
      (options.quoteProps === "consistent" && !needsQuoteProps.get(parent)))
  ) {
    // 'a' -> a
    // '1' -> 1
    // '1.5' -> 1.5
    return path.call(
      (keyPath) =>
        printComments(
          keyPath,
          /^\d/u.test(key.value) ? printNumber(key.value) : key.value,
          options,
        ),
      "key",
    );
  }

  return print("key");
}

/*
- `Property`
- `ObjectProperty`
- `ImportAttribute`
*/
function printProperty(path, options, print) {
  const { node } = path;
  if (node.shorthand) {
    return print("value");
  }

  return printAssignment(
    path,
    options,
    print,
    printPropertyKey(path, options, print),
    ":",
    "value",
  );
}

export { printProperty, printPropertyKey };
