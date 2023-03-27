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
import {printVueVOnDirective} from "./vue-v-on-directive.js"
import { printVueVBindDirective } from "./vue-v-bind-directive.js";
import {printVueVUnknownDirective} from "./vue-v-unknown-directive.js"
import printSrcsetValue from "./srcset.js";
import printClassNames from "./class-names.js";
import { printStyleAttribute as printStyleAttributeValue } from "./style.js";
import {
  interpolationRegex as angularInterpolationRegex,
  printAngularInterpolation,
} from "./angular-interpolation.js";
import {
  printAttributeDoc,
  formatAttributeValue,
  printAttributeValue,
  printExpand,
} from "./utils.js";

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

function printVueAttribute(valuePrinter, {parseWithTs}) {

  return async (textToDoc, print, path, options) => {
    const { node } = path;
    const value = getUnescapedAttributeValue(node);
    const valueDoc = await valuePrinter(value, textToDoc, {parseWithTs});
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
  }
}

const printSrcset = createAttributePrinter(printSrcsetValue);
const printStyleAttribute = createAttributePrinter(printStyleAttributeValue);

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

  if (
    node.fullName === "srcset" &&
    (node.parent.fullName === "img" || node.parent.fullName === "source")
  ) {
    return printSrcset;
  }

  const value = getUnescapedAttributeValue(node);

  if (
    node.fullName === "style" &&
    !options.parentParser &&
    !value.includes("{{")
  ) {
    return printStyleAttribute;
  }

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
      return printVueAttribute(printVueVForDirective, {parseWithTs});
}

    if (isVueSlotAttribute(node) || isVueSfcBindingsAttribute(node, options)) {
      return printVueAttribute(printVueBindings, {parseWithTs});
    }



    /**
     *     @click="jsStatement"
     *     @click="jsExpression"
     *     v-on:click="jsStatement"
     *     v-on:click="jsExpression"
     */
    if (attributeName.startsWith("@") || attributeName.startsWith("v-on:")) {
      return printVueAttribute(printVueVOnDirective, {parseWithTs});
    }


      /**
      *     :class="vueExpression"
      *     v-bind:id="vueExpression"
      */
      if (attributeName.startsWith(":") || attributeName.startsWith("v-bind:")) {
        return  printVueAttribute(printVueVBindDirective, {parseWithTs});
      }

    /**
     *     v-if="jsExpression"
     */
   if( attributeName.startsWith("v-")) {
      return printVueAttribute(printVueVUnknownDirective, {parseWithTs});
    }

    }

  return async (textToDoc) =>
    printAttributeDoc(
      path,
      await printEmbeddedAttributeValue(path, textToDoc, options)
    );
}

async function printEmbeddedAttributeValue(path, textToDoc, options) {
  const { node } = path;
  const attributeName = node.fullName;

  const attributeTextToDoc = (code, options) =>
    formatAttributeValue(code, options, textToDoc);
  const value = getUnescapedAttributeValue(node);


  if (options.parser === "angular") {
    const ngTextToDoc = (code, options) =>
      // angular does not allow trailing comma
      attributeTextToDoc(code, { ...options });

    /**
     *     (click)="angularStatement"
     *     on-click="angularStatement"
     */
    if (
      (attributeName.startsWith("(") && attributeName.endsWith(")")) ||
      attributeName.startsWith("on-")
    ) {
      return printAttributeValue(
        value,
        { parser: "__ng_action", trailingComma: "none" },
        textToDoc
      );
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
      return printAttributeValue(
        value,
        { parser: "__ng_binding", trailingComma: "none" },
        textToDoc
      );
    }

    /**
     *     i18n="longDescription"
     *     i18n-attr="longDescription"
     */
    if (/^i18n(?:-.+)?$/.test(attributeName)) {
      return printExpand(
        fill(getTextValueParts(node, value.trim())),
        !value.includes("@@")
      );
    }

    /**
     *     *directive="angularDirective"
     */
    if (attributeName.startsWith("*")) {
      return printAttributeValue(
        value,
        { parser: "__ng_directive", trailingComma: "none" },
        textToDoc
      );
    }

    if (angularInterpolationRegex.test(value)) {
      return printAngularInterpolation(path, ngTextToDoc);
    }
  }

  return null;
}

export default printAttribute;
