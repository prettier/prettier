import postcssParse from "postcss/lib/parse";
import postcssLess from "postcss-less";
import postcssScssParse from "postcss-scss/lib/scss-parse";
import createError from "../common/parser-create-error.js";
import { parseFrontMatter } from "../utils/front-matter/index.js";
import {
  calculateLoc,
  locEnd,
  locStart,
  replaceQuotesInInlineComments,
} from "./loc.js";
import parseMediaQuery from "./parse/parse-media-query.js";
import parseSelector from "./parse/parse-selector.js";
import parseValue from "./parse/parse-value.js";
import { addTypePrefix } from "./parse/utils.js";
import { hasIgnorePragma, hasPragma } from "./pragma.js";
import isModuleRuleName from "./utils/is-module-rule-name.js";
import isSCSSNestedPropertyNode from "./utils/is-scss-nested-property-node.js";

const DEFAULT_SCSS_DIRECTIVE = /(\s*)(!default).*$/u;
const GLOBAL_SCSS_DIRECTIVE = /(\s*)(!global).*$/u;

function parseNestedCSS(node, options) {
  if (node && typeof node === "object") {
    delete node.parent;

    for (const key in node) {
      parseNestedCSS(node[key], options);
    }

    if (!node.type) {
      return node;
    }

    /* c8 ignore next */
    node.raws ??= {};

    // Custom properties looks like declarations
    if (
      node.type === "css-decl" &&
      typeof node.prop === "string" &&
      node.prop.startsWith("--") &&
      typeof node.value === "string" &&
      node.value.startsWith("{")
    ) {
      let rules;
      if (node.value.trimEnd().endsWith("}")) {
        const textBefore = options.originalText.slice(
          0,
          node.source.start.offset,
        );
        const nodeText =
          "a".repeat(node.prop.length) +
          options.originalText.slice(
            node.source.start.offset + node.prop.length,
            node.source.end.offset,
          );
        const fakeContent = textBefore.replaceAll(/[^\n]/gu, " ") + nodeText;
        let parse;
        if (options.parser === "scss") {
          parse = parseScss;
        } else if (options.parser === "less") {
          parse = parseLess;
        } else {
          parse = parseCss;
        }
        let ast;
        try {
          ast = parse(fakeContent, { ...options });
        } catch {
          // noop
        }
        if (ast?.nodes?.length === 1 && ast.nodes[0].type === "css-rule") {
          rules = ast.nodes[0].nodes;
        }
      }
      if (rules) {
        node.value = {
          type: "css-rule",
          nodes: rules,
        };
      } else {
        node.value = {
          type: "value-unknown",
          value: node.raws.value.raw,
        };
      }
      return node;
    }

    let selector = "";

    if (typeof node.selector === "string") {
      selector = node.raws.selector
        ? (node.raws.selector.scss ?? node.raws.selector.raw)
        : node.selector;

      if (node.raws.between && node.raws.between.trim().length > 0) {
        selector += node.raws.between;
      }

      node.raws.selector = selector;
    }

    let value = "";

    if (typeof node.value === "string") {
      value = node.raws.value
        ? (node.raws.value.scss ?? node.raws.value.raw)
        : node.value;

      node.raws.value = value.trim();
    }

    let params = "";

    if (typeof node.params === "string") {
      params = node.raws.params
        ? (node.raws.params.scss ?? node.raws.params.raw)
        : node.params;

      if (node.raws.afterName && node.raws.afterName.trim().length > 0) {
        params = node.raws.afterName + params;
      }

      if (node.raws.between && node.raws.between.trim().length > 0) {
        params = params + node.raws.between;
      }

      params = params.trim();

      node.raws.params = params;
    }

    // Ignore LESS mixin declaration
    if (selector.trim().length > 0) {
      // TODO: confirm this code is dead
      /* c8 ignore next 3 */
      if (selector.startsWith("@") && selector.endsWith(":")) {
        return node;
      }

      // TODO: confirm this code is dead
      /* c8 ignore next 6 */
      // Ignore LESS mixins
      if (node.mixin) {
        node.selector = parseValue(selector, options);

        return node;
      }

      // Check on SCSS nested property
      if (isSCSSNestedPropertyNode(node, options)) {
        node.isSCSSNesterProperty = true;
      }

      node.selector = parseSelector(selector);

      return node;
    }

    if (value.trim().length > 0) {
      const defaultSCSSDirectiveIndex = value.match(DEFAULT_SCSS_DIRECTIVE);

      if (defaultSCSSDirectiveIndex) {
        value = value.slice(0, defaultSCSSDirectiveIndex.index);
        node.scssDefault = true;

        if (defaultSCSSDirectiveIndex[0].trim() !== "!default") {
          node.raws.scssDefault = defaultSCSSDirectiveIndex[0];
        }
      }

      const globalSCSSDirectiveIndex = value.match(GLOBAL_SCSS_DIRECTIVE);

      if (globalSCSSDirectiveIndex) {
        value = value.slice(0, globalSCSSDirectiveIndex.index);
        node.scssGlobal = true;

        if (globalSCSSDirectiveIndex[0].trim() !== "!global") {
          node.raws.scssGlobal = globalSCSSDirectiveIndex[0];
        }
      }

      if (value.startsWith("progid:")) {
        return {
          type: "value-unknown",
          value,
        };
      }

      node.value = parseValue(value, options);
    }

    if (
      options.parser === "less" &&
      node.type === "css-decl" &&
      value.startsWith("extend(")
    ) {
      // extend is missing
      node.extend ||= node.raws.between === ":";

      // `:extend()` is parsed as value
      if (node.extend && !node.selector) {
        delete node.value;
        node.selector = parseSelector(value.slice("extend(".length, -1));
      }
    }

    if (node.type === "css-atrule") {
      if (options.parser === "less") {
        // mixin
        if (node.mixin) {
          const source =
            node.raws.identifier +
            node.name +
            node.raws.afterName +
            node.raws.params;
          node.selector = parseSelector(source);
          delete node.params;
          return node;
        }

        // function
        if (node.function) {
          return node;
        }
      }

      // only css support custom-selector
      if (options.parser === "css" && node.name === "custom-selector") {
        const customSelector = node.params.match(/:--\S+\s+/u)[0].trim();
        node.customSelector = customSelector;
        node.selector = parseSelector(
          node.params.slice(customSelector.length).trim(),
        );
        delete node.params;
        return node;
      }

      if (options.parser === "less") {
        // postcss-less doesn't recognize variables in some cases.
        // `@color: blue;` is recognized fine, but the cases below aren't:

        // `@color:blue;`
        if (node.name.includes(":")) {
          node.variable = true;
          const parts = node.name.split(":");
          node.name = parts[0];
          let value = parts.slice(1).join(":");

          // `@fooBackground:rgba(255, 255, 255, 1);`
          if (node.params) {
            value += node.params;
          }

          node.value = parseValue(value, options);
        }

        // `@color :blue;`
        if (
          !["page", "nest", "keyframes"].includes(node.name) &&
          node.params?.[0] === ":"
        ) {
          node.variable = true;
          const text = node.params.slice(1);
          if (text) {
            node.value = parseValue(text, options);
          }
          node.raws.afterName += ":";
        }

        // Less variable
        if (node.variable) {
          delete node.params;

          if (!node.value) {
            delete node.value;
          }

          return node;
        }
      }
    }

    if (node.type === "css-atrule" && params.length > 0) {
      const { name } = node;
      const lowercasedName = node.name.toLowerCase();

      if (name === "warn" || name === "error") {
        node.params = {
          type: "media-unknown",
          value: params,
        };

        return node;
      }

      if (name === "extend" || name === "nest") {
        node.selector = parseSelector(params);
        delete node.params;

        return node;
      }

      if (name === "at-root") {
        if (/^\(\s*(?:without|with)\s*:.+\)$/su.test(params)) {
          node.params = parseValue(params, options);
        } else {
          node.selector = parseSelector(params);
          delete node.params;
        }

        return node;
      }

      if (isModuleRuleName(lowercasedName)) {
        node.import = true;
        delete node.filename;
        node.params = parseValue(params, options);
        return node;
      }

      if (
        [
          "namespace",
          "supports",
          "if",
          "else",
          "for",
          "each",
          "while",
          "debug",
          "mixin",
          "include",
          "function",
          "return",
          "define-mixin",
          "add-mixin",
        ].includes(name)
      ) {
        // Remove unnecessary spaces in SCSS variable arguments
        // Move spaces after the `...`, so we can keep the range correct
        params = params.replace(/(\$\S+?)(\s+)?\.{3}/u, "$1...$2");
        // Remove unnecessary spaces before SCSS control, mixin and function directives
        // Move spaces after the `(`, so we can keep the range correct
        // Only match the first function call at the beginning, not nested ones
        params = params.replace(/^(?!if)([^"'\s(]+)(\s+)\(/u, "$1($2");

        node.value = parseValue(params, options);
        delete node.params;

        return node;
      }

      if (["media", "custom-media"].includes(lowercasedName)) {
        if (params.includes("#{")) {
          // Workaround for media at rule with scss interpolation
          return {
            type: "media-unknown",
            value: params,
          };
        }

        node.params = parseMediaQuery(params);

        return node;
      }

      node.params = params;

      return node;
    }
  }

  return node;
}

function parseWithParser(parse, text, options) {
  const { frontMatter, content: textToParse } = parseFrontMatter(text);

  let result;

  try {
    result = parse(textToParse, {
      // Prevent file access https://github.com/postcss/postcss/blob/4f4e2932fc97e2c117e1a4b15f0272ed551ed59d/lib/previous-map.js#L18
      map: false,
    });
  } catch (/** @type {any} */ error) {
    const { name, reason, line, column } = error;
    /* c8 ignore 3 */
    if (typeof line !== "number") {
      throw error;
    }

    throw createError(`${name}: ${reason}`, {
      loc: { start: { line, column } },
      cause: error,
    });
  }

  options.originalText = text;
  result = parseNestedCSS(addTypePrefix(result, "css-"), options);

  calculateLoc(result, text);

  if (frontMatter) {
    result.frontMatter = {
      ...frontMatter,
      source: {
        startOffset: frontMatter.start.index,
        endOffset: frontMatter.end.index,
      },
    };
  }

  return result;
}

function parseCss(text, options = {}) {
  return parseWithParser(postcssParse.default, text, options);
}

function parseLess(text, options = {}) {
  return parseWithParser(
    // Workaround for https://github.com/shellscape/postcss-less/issues/145
    // See comments for `replaceQuotesInInlineComments` in `loc.js`.
    (text) => postcssLess.parse(replaceQuotesInInlineComments(text)),
    text,
    options,
  );
}

function parseScss(text, options = {}) {
  return parseWithParser(postcssScssParse, text, options);
}

const postCssParser = {
  astFormat: "postcss",
  hasPragma,
  hasIgnorePragma,
  locStart,
  locEnd,
};

export const css = { ...postCssParser, parse: parseCss };
export const less = { ...postCssParser, parse: parseLess };
export const scss = { ...postCssParser, parse: parseScss };
