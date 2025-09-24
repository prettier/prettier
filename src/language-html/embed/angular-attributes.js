import { fill } from "../../document/builders.js";
import {
  getTextValueParts,
  getUnescapedAttributeValue,
} from "../utils/index.js";
import {
  isAngularInterpolation,
  printAngularInterpolation,
} from "./angular-interpolation.js";
import {
  formatAttributeValue,
  printExpand,
  shouldHugJsExpression,
} from "./utils.js";

/**
@import {AttributeValuePrinter} from "./attribute.js"
*/

const createAngularPrinter =
  (parser) => (textToDoc, print, path /* , options*/) =>
    formatAttributeValue(
      getUnescapedAttributeValue(path.node),
      textToDoc,
      { parser },
      shouldHugJsExpression,
    );

/** @type {AttributeValuePrinter[]} */
const printers = [
  {
    /*
    - `(click)="angularStatement"`
    - `on-click="angularStatement"`
    */
    test: ({ node: { fullName: attributeName } }) =>
      (attributeName.startsWith("(") && attributeName.endsWith(")")) ||
      attributeName.startsWith("on-"),
    print: createAngularPrinter("__ng_action"),
  },
  {
    /*
    - `[target]="angularExpression"`
    - `bind-target="angularExpression"`
    - `[(target)]="angularExpression"`
    - `bindon-target="angularExpression"`
    */
    test: ({ node: { fullName: attributeName } }) =>
      (attributeName.startsWith("[") && attributeName.endsWith("]")) ||
      /^bind(?:on)?-/u.test(attributeName) ||
      // Unofficial rudimentary support for some of the most used directives of AngularJS 1.x
      /^ng-(?:if|show|hide|class|style)$/u.test(attributeName),
    print: createAngularPrinter("__ng_binding"),
  },
  {
    // `*directive="angularDirective"`
    test: ({ node: { fullName: attributeName } }) =>
      attributeName.startsWith("*"),
    print: createAngularPrinter("__ng_directive"),
  },
  {
    /*
    - `i18n="longDescription"`
    - `i18n-attr="longDescription"`
    */
    test: ({ node: { fullName: attributeName } }) =>
      /^i18n(?:-.+)?$/u.test(attributeName),
    print: printAngularI18n,
  },
  {
    test: isAngularInterpolation,
    print: printAngularInterpolation,
  },
].map(({ test, print }) => ({
  test: (path, options) =>
    options.parser === "angular" && test(path /* , options */),
  print,
}));

function printAngularI18n(textToDoc, print, { node } /* , options */) {
  const value = getUnescapedAttributeValue(node);
  return printExpand(
    fill(getTextValueParts(node, value.trim())),
    !value.includes("@@"),
  );
}

export default printers;
