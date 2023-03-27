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
import printSrcset from "./srcset.js";
import printClassNames from "./class-names.js";
import { printStyleAttribute } from "./style.js";
import {
  isLwcInterpolation,
  printLwcInterpolation,
} from "./lwc-interpolation.js";
import {
  interpolationRegex as angularInterpolationRegex,
  printAngularInterpolation,
} from "./angular-interpolation.js";
import { printAttributeDoc, formatAttributeValue, printAttributeValue , printExpand} from "./utils.js";

function printAttribute(path, options) {
  const { node } = path;

  if (!node.value) {
    return;
  }

  // lit-html: html`<my-element obj=${obj}></my-element>`
  if (
    /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/.test(
      options.originalText.slice(
        node.valueSpan.start.offset,
        node.valueSpan.end.offset
      )
    )
  ) {
    return [node.rawName, "=", node.value];
  }

  if (isLwcInterpolation(path, options)) {
    return printLwcInterpolation(path);
  }

  if (
    node.fullName === "srcset" &&
    (node.parent.fullName === "img" || node.parent.fullName === "source")
  ) {
    return () => printSrcset(path);
  }

  const value = getUnescapedAttributeValue(node);

  if (
    node.fullName === "style" &&
    !options.parentParser &&
    !value.includes("{{")
  ) {
    return printStyleAttribute;
  }

  return async (textToDoc) => printAttributeDoc(path,  await printEmbeddedAttributeValue(
      path,
      textToDoc,
      options
    ))
}

async function printEmbeddedAttributeValue(path, textToDoc, options) {
  const { node } = path;
  const attributeName = node.fullName;

  const attributeTextToDoc = (code, options) =>
    formatAttributeValue(
      code,
      options,
      textToDoc
    );
  const value = getUnescapedAttributeValue(node);

  if (
    node.fullName === "class" &&
    !options.parentParser &&
    !value.includes("{{")
  ) {
    return printClassNames(value);
  }

  if (options.parser === "vue") {
    if (node.fullName === "v-for") {
      return printVueVForDirective(path, textToDoc, options);
    }

    if (isVueSlotAttribute(node) || isVueSfcBindingsAttribute(node, options)) {
      return printVueBindings(path, textToDoc, options);
    }

    /**
     *     @click="jsStatement"
     *     @click="jsExpression"
     *     v-on:click="jsStatement"
     *     v-on:click="jsExpression"
     */
    if (attributeName.startsWith("@") || attributeName.startsWith("v-on:")) {
      const parser = isVueEventBindingExpression(value)
        ? isVueSfcWithTypescriptScript(path, options)
          ? "__ts_expression"
          : "__js_expression"
        : isVueSfcWithTypescriptScript(path, options)
        ? "__vue_ts_event_binding"
        : "__vue_event_binding";
      return printAttributeValue(value, {parser}, textToDoc)
    }

    /**
     *     :class="vueExpression"
     *     v-bind:id="vueExpression"
     */
    if (attributeName.startsWith(":") || attributeName.startsWith("v-bind:")) {
      return (
         printAttributeValue(value, {
          parser: isVueSfcWithTypescriptScript(path, options)
            ? "__vue_ts_expression"
            : "__vue_expression",
        }, textToDoc)
      );
    }

    /**
     *     v-if="jsExpression"
     */
    if (attributeName.startsWith("v-")) {
      return (
         printAttributeValue(value, {
          parser: isVueSfcWithTypescriptScript(path, options)
            ? "__ts_expression"
            : "__js_expression",
        }, textToDoc)
      );
    }
  }

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
      return ( printAttributeValue(value, { parser: "__ng_action", trailingComma: "none" }, textToDoc));
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
      return (
         printAttributeValue(value, { parser: "__ng_binding", trailingComma: "none" }, textToDoc)
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
      return  printAttributeValue(value, { parser: "__ng_directive", trailingComma: "none" }, textToDoc)
    }

    if (angularInterpolationRegex.test(value)) {
      return printAngularInterpolation(path, ngTextToDoc);
    }
  }

  return null;
}

export default printAttribute;
