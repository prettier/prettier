import { getUnescapedAttributeValue } from "../utils/index.js";
import { group, indent, fill, softline } from "../../document/builders.js";
import { getTextValueParts } from "../utils/index.js";
import { printAttribute, printAttributeValue, printExpand } from "./utils.js";
import {
  interpolationRegex as angularInterpolationRegex,
  printAngularInterpolation,
} from "./angular-interpolation.js";

function createAngularPrinter({ parser }) {
  return async (textToDoc, print, path /*, options*/) => {
    const { node } = path;
    const value = getUnescapedAttributeValue(node);
    return printAttribute(
      path,
      await printAttributeValue(
        value,
        {
          parser,
          // angular does not allow trailing comma
          trailingComma: "none",
        },
        textToDoc
      )
    );
  };
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
    /^bind(?:on)?-/.test(attributeName) ||
    // Unofficial rudimentary support for some of the most used directives of AngularJS 1.x
    /^ng-(?:if|show|hide|class|style)$/.test(attributeName)
  ) {
    return printNgBinding;
  }

  /**
   *     *directive="angularDirective"
   */
  if (attributeName.startsWith("*")) {
    return printNgDirective;
  }

  const value = getUnescapedAttributeValue(node);

  /**
   *     i18n="longDescription"
   *     i18n-attr="longDescription"
   */
  if (/^i18n(?:-.+)?$/.test(attributeName)) {
    return () =>
      printAttribute(
        path,
        printExpand(
          fill(getTextValueParts(node, value.trim())),
          !value.includes("@@")
        )
      );
  }

  if (angularInterpolationRegex.test(value)) {
    return async (textToDoc) =>
      printAttribute(path, await printAngularInterpolation(value, textToDoc));
  }
}

export default printAngularAttribute;
