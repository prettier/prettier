"use strict";

const {
  builders: { breakParent, group, hardline, indent, line, fill, softline },
  utils: { mapDoc, replaceTextEndOfLine },
} = require("../document/index.js");
const printFrontMatter = require("../utils/front-matter/print.js");
const {
  printClosingTag,
  printClosingTagSuffix,
  needsToBorrowPrevClosingTagEndMarker,
  printOpeningTagPrefix,
  printOpeningTag,
} = require("./print/tag.js");
const { printImgSrcset, printClassNames } = require("./syntax-attribute.js");
const {
  printVueFor,
  printVueBindings,
  isVueEventBindingExpression,
} = require("./syntax-vue.js");
const {
  isScriptLikeTag,
  isVueNonHtmlBlock,
  inferScriptParser,
  htmlTrimPreserveIndentation,
  dedentString,
  unescapeQuoteEntities,
  isVueSlotAttribute,
  isVueSfcBindingsAttribute,
  getTextValueParts,
} = require("./utils/index.js");
const getNodeContent = require("./get-node-content.js");

function printEmbeddedAttributeValue(node, htmlTextToDoc, options) {
  const isKeyMatched = (patterns) =>
    new RegExp(patterns.join("|")).test(node.fullName);
  const getValue = () => unescapeQuoteEntities(node.value);

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
        (options.parser === "__vue_expression" &&
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

  if (
    node.fullName === "srcset" &&
    (node.parent.fullName === "img" || node.parent.fullName === "source")
  ) {
    return printExpand(printImgSrcset(getValue()));
  }

  if (node.fullName === "class" && !options.parentParser) {
    const value = getValue();
    if (!value.includes("{{")) {
      return printClassNames(value);
    }
  }

  if (node.fullName === "style" && !options.parentParser) {
    const value = getValue();
    if (!value.includes("{{")) {
      return printExpand(
        attributeTextToDoc(value, {
          parser: "css",
          __isHTMLStyleAttribute: true,
        })
      );
    }
  }

  if (options.parser === "vue") {
    if (node.fullName === "v-for") {
      return printVueFor(getValue(), attributeTextToDoc);
    }

    if (isVueSlotAttribute(node) || isVueSfcBindingsAttribute(node, options)) {
      return printVueBindings(getValue(), attributeTextToDoc);
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
      const value = getValue();
      const parser = isVueEventBindingExpression(value)
        ? "__js_expression"
        : options.__should_parse_vue_template_with_ts
        ? "__vue_ts_event_binding"
        : "__vue_event_binding";
      return printMaybeHug(
        attributeTextToDoc(value, {
          parser,
        })
      );
    }

    if (isKeyMatched(vueExpressionBindingPatterns)) {
      return printMaybeHug(
        attributeTextToDoc(getValue(), { parser: "__vue_expression" })
      );
    }

    if (isKeyMatched(jsExpressionBindingPatterns)) {
      return printMaybeHug(
        attributeTextToDoc(getValue(), { parser: "__js_expression" })
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
      return printMaybeHug(ngTextToDoc(getValue(), { parser: "__ng_action" }));
    }

    if (isKeyMatched(ngExpressionBindingPatterns)) {
      return printMaybeHug(ngTextToDoc(getValue(), { parser: "__ng_binding" }));
    }

    if (isKeyMatched(ngI18nPatterns)) {
      const value = getValue().trim();
      return printExpand(
        fill(getTextValueParts(node, value)),
        !value.includes("@@")
      );
    }

    if (isKeyMatched(ngDirectiveBindingPatterns)) {
      return printMaybeHug(
        ngTextToDoc(getValue(), { parser: "__ng_directive" })
      );
    }

    const interpolationRegex = /{{(.+?)}}/s;
    const value = getValue();
    if (interpolationRegex.test(value)) {
      const parts = [];
      for (const [index, part] of value.split(interpolationRegex).entries()) {
        if (index % 2 === 0) {
          parts.push(replaceTextEndOfLine(part));
        } else {
          try {
            parts.push(
              group([
                "{{",
                indent([
                  line,
                  ngTextToDoc(part, {
                    parser: "__ng_interpolation",
                    __isInHtmlInterpolation: true, // to avoid unexpected `}}`
                  }),
                ]),
                line,
                "}}",
              ])
            );
          } catch {
            parts.push("{{", replaceTextEndOfLine(part), "}}");
          }
        }
      }
      return group(parts);
    }
  }

  return null;
}

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  switch (node.type) {
    case "element": {
      if (isScriptLikeTag(node) || node.type === "interpolation") {
        // Fall through to "text"
        return;
      }

      if (!node.isSelfClosing && isVueNonHtmlBlock(node, options)) {
        const parser = inferScriptParser(node, options);
        if (!parser) {
          return;
        }

        const content = getNodeContent(node, options);
        let isEmpty = /^\s*$/.test(content);
        let doc = "";
        if (!isEmpty) {
          doc = textToDoc(
            htmlTrimPreserveIndentation(content),
            { parser, __embeddedInHtml: true },
            { stripTrailingHardline: true }
          );
          isEmpty = doc === "";
        }

        return [
          printOpeningTagPrefix(node, options),
          group(printOpeningTag(path, options, print)),
          isEmpty ? "" : hardline,
          doc,
          isEmpty ? "" : hardline,
          printClosingTag(node, options),
          printClosingTagSuffix(node, options),
        ];
      }
      break;
    }
    case "text": {
      if (isScriptLikeTag(node.parent)) {
        const parser = inferScriptParser(node.parent, options);
        if (parser) {
          const value =
            parser === "markdown"
              ? dedentString(node.value.replace(/^[^\S\n]*\n/, ""))
              : node.value;
          const textToDocOptions = { parser, __embeddedInHtml: true };
          if (options.parser === "html" && parser === "babel") {
            let sourceType = "script";
            const { attrMap } = node.parent;
            if (
              attrMap &&
              (attrMap.type === "module" ||
                (attrMap.type === "text/babel" &&
                  attrMap["data-type"] === "module"))
            ) {
              sourceType = "module";
            }
            textToDocOptions.__babelSourceType = sourceType;
          }
          return [
            breakParent,
            printOpeningTagPrefix(node, options),
            textToDoc(value, textToDocOptions, {
              stripTrailingHardline: true,
            }),
            printClosingTagSuffix(node, options),
          ];
        }
      } else if (node.parent.type === "interpolation") {
        const textToDocOptions = {
          __isInHtmlInterpolation: true, // to avoid unexpected `}}`
          __embeddedInHtml: true,
        };
        if (options.parser === "angular") {
          textToDocOptions.parser = "__ng_interpolation";
          textToDocOptions.trailingComma = "none";
        } else if (options.parser === "vue") {
          textToDocOptions.parser = options.__should_parse_vue_template_with_ts
            ? "__vue_ts_expression"
            : "__vue_expression";
        } else {
          textToDocOptions.parser = "__js_expression";
        }
        return [
          indent([
            line,
            textToDoc(node.value, textToDocOptions, {
              stripTrailingHardline: true,
            }),
          ]),
          node.parent.next &&
          needsToBorrowPrevClosingTagEndMarker(node.parent.next)
            ? " "
            : line,
        ];
      }
      break;
    }
    case "attribute": {
      if (!node.value) {
        break;
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

      // lwc: html`<my-element data-for={value}></my-element>`
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

      const embeddedAttributeValueDoc = printEmbeddedAttributeValue(
        node,
        (code, opts) =>
          // strictly prefer single quote to avoid unnecessary html entity escape
          textToDoc(
            code,
            { __isInHtmlAttribute: true, __embeddedInHtml: true, ...opts },
            { stripTrailingHardline: true }
          ),
        options
      );
      if (embeddedAttributeValueDoc) {
        return [
          node.rawName,
          '="',
          group(
            mapDoc(embeddedAttributeValueDoc, (doc) =>
              typeof doc === "string" ? doc.replace(/"/g, "&quot;") : doc
            )
          ),
          '"',
        ];
      }
      break;
    }
    case "front-matter":
      return printFrontMatter(node, textToDoc);
  }
}

module.exports = embed;
