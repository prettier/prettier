"use strict";

const { printComments } = require("../../main/comments");
const { printString, printNumber } = require("../../common/util");
const {
  isNumericLiteral,
  isSimpleNumber,
  isStringLiteral,
  isStringPropSafeToUnquote,
  rawText,
} = require("../utils");
const { printAssignment } = require("./assignment");

const needsQuoteProps = new WeakMap();

function printPropertyKey(path, options, print) {
  const node = path.getNode();

  if (node.computed) {
    // [prettierx] computedPropertySpacing option support (...)
    const computedPropertySpace = options.computedPropertySpacing ? " " : "";

    // [prettierx] computedPropertySpacing option support (...)
    return [
      "[",
      computedPropertySpace,
      print("key"),
      computedPropertySpace,
      "]",
    ];
  }

  const parent = path.getParentNode();
  const { key } = node;

  // flow has `Identifier` key, other parsers use `PrivateIdentifier` (ESTree) or `PrivateName`
  if (node.type === "ClassPrivateProperty" && key.type === "Identifier") {
    return ["#", print("key")];
  }

  if (options.quoteProps === "consistent" && !needsQuoteProps.has(parent)) {
    const objectHasStringProp = (
      parent.properties ||
      parent.body ||
      parent.members
    ).some(
      (prop) =>
        !prop.computed &&
        prop.key &&
        isStringLiteral(prop.key) &&
        !isStringPropSafeToUnquote(prop, options)
    );
    needsQuoteProps.set(parent, objectHasStringProp);
  }

  if (
    (key.type === "Identifier" ||
      (isNumericLiteral(key) &&
        isSimpleNumber(printNumber(rawText(key))) &&
        // Avoid converting 999999999999999999999 to 1e+21, 0.99999999999999999 to 1 and 1.0 to 1.
        String(key.value) === printNumber(rawText(key)) &&
        // [prettierx] support __typescript_estree parser option for testing
        // Quoting number keys is safe in JS and Flow, but not in TypeScript (as
        // mentioned in `isStringPropSafeToUnquote`).
        !(
          options.parser === "typescript" ||
          options.parser === "babel-ts" ||
          options.parser === "__typescript_estree"
        ))) &&
    (options.parser === "json" ||
      (options.quoteProps === "consistent" && needsQuoteProps.get(parent)))
  ) {
    // a -> "a"
    // 1 -> "1"
    // 1.5 -> "1.5"
    const prop = printString(
      JSON.stringify(
        key.type === "Identifier" ? key.name : key.value.toString()
      ),
      options
    );
    return path.call((keyPath) => printComments(keyPath, prop, options), "key");
  }

  if (
    isStringPropSafeToUnquote(node, options) &&
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
          /^\d/.test(key.value) ? printNumber(key.value) : key.value,
          options
        ),
      "key"
    );
  }

  return print("key");
}

// [prettierx] for alignObjectProperties option
// with computedPropertySpacing option support
function getPropertyPadding(options, path) {
  if (!options.alignObjectProperties) {
    return "";
  }

  if (/json/.test(options.parser)) {
    return "";
  }

  const node = path.getValue();
  const { type } = node;

  // grandparent node:
  const parentObject = path.getParentNode(1);

  const { locStart, locEnd } = options;

  // THIS IS A HACK:
  const shouldBreak = options.originalText
    .slice(locStart(parentObject), locEnd(parentObject))
    .match(/{\s*(\/.*)?\n/);

  if (!shouldBreak) {
    return "";
  }

  const nameLength =
    type === "Identifier"
      ? node.name.length
      : node.raw
      ? node.raw.length
      : node.extra.raw
      ? node.extra.raw.length
      : undefined;

  // [prettierx] computedPropertySpacing option support
  const computedPropertyOverhead = options.computedPropertySpacing ? 4 : 2;

  // FUTURE TBD from arijs/prettier-miscellaneous#10
  // (does not seem to be needed to pass the tests):
  // if (nameLength === undefined) {
  //   return "";
  // }

  const { properties } = parentObject;
  const lengths = properties.map((property) => {
    if (!property.key) {
      return 0;
    }
    return (
      property.key.loc.end.column -
      property.key.loc.start.column +
      (property.computed ? computedPropertyOverhead : 0)
    );
  });

  const maxLength = Math.max.apply(null, lengths);
  const padLength = maxLength - nameLength + 1;

  const padding = " ".repeat(padLength);

  return padding;
}

function printProperty(path, options, print) {
  const node = path.getValue();
  if (node.shorthand) {
    return print("value");
  }

  // [prettierx] calculate property padding
  // for alignObjectProperties option
  const propertyPadding = path.call(
    getPropertyPadding.bind(null, options),
    "key"
  );

  // [prettierx] FUTURE TBD: it should be possible to refactor the code
  // to use the same printPropertyKey call for both
  // computed & non-computed properties

  // [prettierx] computedPropertySpacing option support
  const computedPropertySpace = options.computedPropertySpacing ? " " : "";

  // [prettierx] calculate this overhead in case it is needed,
  // with computedPropertySpacing option support:
  const computedPropertyOverhead = options.computedPropertySpacing ? 4 : 2;

  // [prettierx] compose left part,
  // for alignObjectProperties option
  const propertyLeftPart = node.computed
    ? [
        // [prettierx] computed property key,
        // with padding as needed for alignment
        "[",
        // [prettierx] computedPropertySpacing option support (...)
        computedPropertySpace,
        print("key"),
        // [prettierx] computedPropertySpacing option support (...)
        computedPropertySpace,
        "]",
        propertyPadding.slice(computedPropertyOverhead),
      ]
    : [
        // [prettierx] normal property key,
        // for alignObjectProperties option
        printPropertyKey(path, options, print),
        propertyPadding,
      ];

  return printAssignment(
    path,
    options,
    print,
    // [prettierx] with optional property alignment
    // for alignObjectProperties option
    propertyLeftPart,
    ":",
    "value"
  );
}

module.exports = { printProperty, printPropertyKey };
