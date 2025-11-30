import { fill } from "../../document/index.js";
import {
  getTextValueParts,
  getUnescapedAttributeValue,
} from "../utilities/index.js";
import {
  isAngularInterpolation,
  printAngularInterpolation,
} from "./angular-interpolation.js";
import {
  formatAttributeValue,
  printExpand,
  shouldHugJsExpression,
} from "./utilities.js";

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
    test(path /* , options */) {
      const name = path.node.fullName;
      return (
        (name.startsWith("(") && name.endsWith(")")) || name.startsWith("on-")
      );
    },
    print: createAngularPrinter("__ng_action"),
  },
  {
    /*
    - `[target]="angularExpression"`
    - `bind-target="angularExpression"`
    - `[(target)]="angularExpression"`
    - `bindon-target="angularExpression"`
    */
    test(path /* , options */) {
      const name = path.node.fullName;
      return (
        (name.startsWith("[") && name.endsWith("]")) ||
        /^bind(?:on)?-/u.test(name) ||
        // Unofficial rudimentary support for some of the most used directives of AngularJS 1.x
        /^ng-(?:if|show|hide|class|style)$/u.test(name)
      );
    },
    print: createAngularPrinter("__ng_binding"),
  },
  {
    /*
    - `*directive="angularDirective"`
    */
    test: (path /* , options */) => path.node.fullName.startsWith("*"),
    print: createAngularPrinter("__ng_directive"),
  },
  {
    /*
    - `i18n="longDescription"`
    - `i18n-attr="longDescription"`
    */
    test: (path /* , options */) => /^i18n(?:-.+)?$/u.test(path.node.fullName),
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
    // @ts-expect-error -- Need investigate how `replaceEndOfLine` works
    fill(getTextValueParts(node, value.trim())),
    !value.includes("@@"),
  );
}

export default printers;
