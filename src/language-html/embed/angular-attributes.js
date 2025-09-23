import { fill } from "../../document/builders.js";
import {
  getTextValueParts,
  getUnescapedAttributeValue,
} from "../utils/index.js";
import {
  interpolationRegex as angularInterpolationRegex,
  printAngularInterpolation,
} from "./angular-interpolation.js";
import {
  formatAttributeValue,
  printExpand,
  shouldHugJsExpression,
} from "./utils.js";

function createAngularPrinter({ parser }) {
  return (textToDoc, print, path /* , options*/) =>
    formatAttributeValue(
      getUnescapedAttributeValue(path.node),
      textToDoc,
      { parser },
      shouldHugJsExpression,
    );
}

const printNgAction = createAngularPrinter({ parser: "__ng_action" });
const printNgBinding = createAngularPrinter({ parser: "__ng_binding" });
const printNgDirective = createAngularPrinter({ parser: "__ng_directive" });

function printAngularAttribute(path, options) {
  if (options.parser !== "angular") {
    return;
  }

  const { node } = path;
  const attributeName = node.fullName;

  /**
   *     (click)="angularStatement"
   *     on-click="angularStatement"
   */
  if (
    (attributeName.startsWith("(") && attributeName.endsWith(")")) ||
    attributeName.startsWith("on-")
  ) {
    return printNgAction;
  }

  /**
   *     [target]="angularExpression"
   *     bind-target="angularExpression"
   *     [(target)]="angularExpression"
   *     bindon-target="angularExpression"
   */
  if (
    (attributeName.startsWith("[") && attributeName.endsWith("]")) ||
    /^bind(?:on)?-/u.test(attributeName) ||
    // Unofficial rudimentary support for some of the most used directives of AngularJS 1.x
    /^ng-(?:if|show|hide|class|style)$/u.test(attributeName)
  ) {
    return printNgBinding;
  }

  /**
   *     *directive="angularDirective"
   */
  if (attributeName.startsWith("*")) {
    return printNgDirective;
  }

  /**
   *     i18n="longDescription"
   *     i18n-attr="longDescription"
   */
  if (/^i18n(?:-.+)?$/u.test(attributeName)) {
    return () => {
      const value = getUnescapedAttributeValue(node);
      return printExpand(
        fill(getTextValueParts(node, value.trim())),
        !value.includes("@@"),
      );
    };
  }

  if (angularInterpolationRegex.test(node.value)) {
    return (textToDoc) =>
      printAngularInterpolation(getUnescapedAttributeValue(node), textToDoc);
  }
}

export default printAngularAttribute;
