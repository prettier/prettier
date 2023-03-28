import { group, indent, fill, softline } from "../../document/builders.js";
import { mapDoc } from "../../document/utils.js";
import {
  isVueSlotAttribute,
  isVueSfcBindingsAttribute,
  getTextValueParts,
  getUnescapedAttributeValue,
} from "../utils/index.js";
import isVueSfcWithTypescriptScript from "../utils/is-vue-sfc-with-typescript-script.js";
import {
  printVueBindings,
  isVueEventBindingExpression,
} from "./vue-bindings.js";
import { printVueVForDirective } from "./vue-v-for-directive.js";
import { printVueVOnDirective } from "./vue-v-on-directive.js";
import { printVueVBindDirective } from "./vue-v-bind-directive.js";
import { printVueVUnknownDirective } from "./vue-v-unknown-directive.js";
import printSrcset from "./srcset.js";
import printClassNames from "./class-names.js";
import { printStyleAttribute } from "./style.js";
import {
  interpolationRegex as angularInterpolationRegex,
  printAngularInterpolation,
} from "./angular-interpolation.js";
import { printAttributeValue, printExpand } from "./utils.js";

function createAttributePrinter(valuePrinter) {
  return async (textToDoc, print, path, options) => {
    const { node } = path;
    const value = getUnescapedAttributeValue(node);
    const valueDoc = await valuePrinter(value, textToDoc);
    if (!valueDoc) {
      return;
    }

    return [
      path.node.rawName,
      '="',
      group(
        mapDoc(valueDoc, (doc) =>
          typeof doc === "string" ? doc.replaceAll('"', "&quot;") : doc
        )
      ),
      '"',
    ];
  };
}

function printVueAttribute(valuePrinter, { parseWithTs }) {
  return async (textToDoc, print, path, options) => {
    const { node } = path;
    const value = getUnescapedAttributeValue(node);
    const valueDoc = await valuePrinter(value, textToDoc, { parseWithTs });
    if (!valueDoc) {
      return;
    }

    return [
      path.node.rawName,
      '="',
      group(
        mapDoc(valueDoc, (doc) =>
          typeof doc === "string" ? doc.replaceAll('"', "&quot;") : doc
        )
      ),
      '"',
    ];
  };
}

function printAngularAttribute({ parser }) {
  return async (textToDoc, print, path, options) => {
    const { node } = path;
    const value = getUnescapedAttributeValue(node);
    const valueDoc = await printAttributeValue(
      value,
      {
        parser,
        // angular does not allow trailing comma
        trailingComma: "none",
      },
      textToDoc
    );
    if (!valueDoc) {
      return;
    }

    return [
      path.node.rawName,
      '="',
      group(
        mapDoc(valueDoc, (doc) =>
          typeof doc === "string" ? doc.replaceAll('"', "&quot;") : doc
        )
      ),
      '"',
    ];
  };
}

function printAttribute(path, options) {
  const { node } = path;

  if (!node.value) {
    return;
  }

  if (
    // lit-html: html`<my-element obj=${obj}></my-element>`
    /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/.test(
      options.originalText.slice(
        node.valueSpan.start.offset,
        node.valueSpan.end.offset
      )
    ) || // lwc: html`<my-element data-for={value}></my-element>`
    (options.parser === "lwc" &&
      node.value.startsWith("{") &&
      node.value.endsWith("}"))
  ) {
    return [node.rawName, "=", node.value];
  }

  const x =
    printSrcset(path, options) ??
    printStyleAttribute(path, options) ??
    printClassNames(path, options);
  if (x) {
    return x;
  }

  const value = getUnescapedAttributeValue(node);

  if (
    node.fullName === "class" &&
    !options.parentParser &&
    !value.includes("{{")
  ) {
    return printClassNames;
  }

  const attributeName = node.fullName;
  if (options.parser === "vue") {
    const parseWithTs = isVueSfcWithTypescriptScript(path, options);

    if (node.fullName === "v-for") {
      return printVueAttribute(printVueVForDirective, { parseWithTs });
    }

    if (isVueSlotAttribute(node) || isVueSfcBindingsAttribute(node, options)) {
      return printVueAttribute(printVueBindings, { parseWithTs });
    }

    /**
     *     @click="jsStatement"
     *     @click="jsExpression"
     *     v-on:click="jsStatement"
     *     v-on:click="jsExpression"
     */
    if (attributeName.startsWith("@") || attributeName.startsWith("v-on:")) {
      return printVueAttribute(printVueVOnDirective, { parseWithTs });
    }

    /**
     *     :class="vueExpression"
     *     v-bind:id="vueExpression"
     */
    if (attributeName.startsWith(":") || attributeName.startsWith("v-bind:")) {
      return printVueAttribute(printVueVBindDirective, { parseWithTs });
    }

    /**
     *     v-if="jsExpression"
     */
    if (attributeName.startsWith("v-")) {
      return printVueAttribute(printVueVUnknownDirective, { parseWithTs });
    }
  }

  if (options.parser === "angular") {
    /**
     *     (click)="angularStatement"
     *     on-click="angularStatement"
     */
    if (
      (attributeName.startsWith("(") && attributeName.endsWith(")")) ||
      attributeName.startsWith("on-")
    ) {
      return printAngularAttribute({ parser: "__ng_action" });
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
      return printAngularAttribute({ parser: "__ng_binding" });
    }

    /**
     *     i18n="longDescription"
     *     i18n-attr="longDescription"
     */
    if (/^i18n(?:-.+)?$/.test(attributeName)) {
      return createAttributePrinter(() =>
        printExpand(
          fill(getTextValueParts(node, value.trim())),
          !value.includes("@@")
        )
      );
    }

    /**
     *     *directive="angularDirective"
     */
    if (attributeName.startsWith("*")) {
      return printAngularAttribute({ parser: "__ng_directive" });
    }

    if (angularInterpolationRegex.test(value)) {
      return createAttributePrinter(printAngularInterpolation);
    }
  }
}

export default printAttribute;
