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

  if (options.parser === "lwc") {
    const interpolationRegex = /^{.*}$/s;
    if (
      interpolationRegex.test(
        options.originalText.slice(
          node.valueSpan.start.offset,
          node.valueSpan.end.offset
        )
      )
    ) {
      return [node.rawName, "=", node.value];
    }
  }

  return async (textToDoc) => {
    const embeddedAttributeValueDoc = await printEmbeddedAttributeValue(
      path,
      (code, opts) =>
        // strictly prefer single quote to avoid unnecessary html entity escape
        textToDoc(code, {
          __isInHtmlAttribute: true,
          __embeddedInHtml: true,
          ...opts,
        }),
      options
    );
    if (embeddedAttributeValueDoc) {
      return [
        node.rawName,
        '="',
        group(
          mapDoc(embeddedAttributeValueDoc, (doc) =>
            typeof doc === "string" ? doc.replaceAll('"', "&quot;") : doc
          )
        ),
        '"',
      ];
    }
  };
}
async function printEmbeddedAttributeValue(path, htmlTextToDoc, options) {
  const { node } = path;
  const isKeyMatched = (patterns) =>
    new RegExp(patterns.join("|")).test(node.fullName);

  let shouldHug = false;

  const __onHtmlBindingRoot = (root, options) => {
    const rootNode =
      root.type === "NGRoot"
        ? root.node.type === "NGMicrosyntax" &&
          root.node.body.length === 1 &&
          root.node.body[0].type === "NGMicrosyntaxExpression"
          ? root.node.body[0].expression
          : root.node
        : root.type === "JsExpressionRoot"
        ? root.node
        : root;
    if (
      rootNode &&
      (rootNode.type === "ObjectExpression" ||
        rootNode.type === "ArrayExpression" ||
        ((options.parser === "__vue_expression" ||
          options.parser === "__vue_ts_expression") &&
          (rootNode.type === "TemplateLiteral" ||
            rootNode.type === "StringLiteral")))
    ) {
      shouldHug = true;
    }
  };

  const printHug = (doc) => group(doc);
  const printExpand = (doc, canHaveTrailingWhitespace = true) =>
    group([indent([softline, doc]), canHaveTrailingWhitespace ? softline : ""]);
  const printMaybeHug = (doc) => (shouldHug ? printHug(doc) : printExpand(doc));

  const attributeTextToDoc = (code, opts) =>
    htmlTextToDoc(code, {
      __onHtmlBindingRoot,
      __embeddedInHtml: true,
      ...opts,
    });
  const value = getUnescapedAttributeValue(node);

  if (
    node.fullName === "srcset" &&
    (node.parent.fullName === "img" || node.parent.fullName === "source")
  ) {
    return printExpand(printSrcset(value));
  }

  if (
    node.fullName === "class" &&
    !options.parentParser &&
    !value.includes("{{")
  ) {
    return printClassNames(value);
  }

  if (
    node.fullName === "style" &&
    !options.parentParser &&
    !value.includes("{{")
  ) {
    return printExpand(await printStyleAttribute(value, attributeTextToDoc));
  }

  if (options.parser === "vue") {
    if (node.fullName === "v-for") {
      return printVueVForDirective(path, attributeTextToDoc, options);
    }

    if (isVueSlotAttribute(node) || isVueSfcBindingsAttribute(node, options)) {
      return printVueBindings(path, attributeTextToDoc, options);
    }

    /**
     *     @click="jsStatement"
     *     @click="jsExpression"
     *     v-on:click="jsStatement"
     *     v-on:click="jsExpression"
     */
    const vueEventBindingPatterns = ["^@", "^v-on:"];
    /**
     *     :class="vueExpression"
     *     v-bind:id="vueExpression"
     */
    const vueExpressionBindingPatterns = ["^:", "^v-bind:"];
    /**
     *     v-if="jsExpression"
     */
    const jsExpressionBindingPatterns = ["^v-"];

    if (isKeyMatched(vueEventBindingPatterns)) {
      const parser = isVueEventBindingExpression(value)
        ? isVueSfcWithTypescriptScript(path, options)
          ? "__ts_expression"
          : "__js_expression"
        : isVueSfcWithTypescriptScript(path, options)
        ? "__vue_ts_event_binding"
        : "__vue_event_binding";
      return printMaybeHug(await attributeTextToDoc(value, { parser }));
    }

    if (isKeyMatched(vueExpressionBindingPatterns)) {
      return printMaybeHug(
        await attributeTextToDoc(value, {
          parser: isVueSfcWithTypescriptScript(path, options)
            ? "__vue_ts_expression"
            : "__vue_expression",
        })
      );
    }

    if (isKeyMatched(jsExpressionBindingPatterns)) {
      return printMaybeHug(
        await attributeTextToDoc(value, {
          parser: isVueSfcWithTypescriptScript(path, options)
            ? "__ts_expression"
            : "__js_expression",
        })
      );
    }
  }

  if (options.parser === "angular") {
    const ngTextToDoc = (code, opts) =>
      // angular does not allow trailing comma
      attributeTextToDoc(code, { ...opts, trailingComma: "none" });

    /**
     *     *directive="angularDirective"
     */
    const ngDirectiveBindingPatterns = ["^\\*"];
    /**
     *     (click)="angularStatement"
     *     on-click="angularStatement"
     */
    const ngStatementBindingPatterns = ["^\\(.+\\)$", "^on-"];
    /**
     *     [target]="angularExpression"
     *     bind-target="angularExpression"
     *     [(target)]="angularExpression"
     *     bindon-target="angularExpression"
     */
    const ngExpressionBindingPatterns = [
      "^\\[.+\\]$",
      "^bind(on)?-",
      // Unofficial rudimentary support for some of the most used directives of AngularJS 1.x
      "^ng-(if|show|hide|class|style)$",
    ];
    /**
     *     i18n="longDescription"
     *     i18n-attr="longDescription"
     */
    const ngI18nPatterns = ["^i18n(-.+)?$"];

    if (isKeyMatched(ngStatementBindingPatterns)) {
      return printMaybeHug(await ngTextToDoc(value, { parser: "__ng_action" }));
    }

    if (isKeyMatched(ngExpressionBindingPatterns)) {
      return printMaybeHug(
        await ngTextToDoc(value, { parser: "__ng_binding" })
      );
    }

    if (isKeyMatched(ngI18nPatterns)) {
      return printExpand(
        fill(getTextValueParts(node, value.trim())),
        !value.includes("@@")
      );
    }

    if (isKeyMatched(ngDirectiveBindingPatterns)) {
      return printMaybeHug(
        await ngTextToDoc(value, { parser: "__ng_directive" })
      );
    }

    if (angularInterpolationRegex.test(value)) {
      return printAngularInterpolation(path, ngTextToDoc);
    }
  }

  return null;
}

export default printAttribute;
