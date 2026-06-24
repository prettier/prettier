import postcssParse from "postcss/lib/parse";
import postcssLess from "postcss-less";
import postcssScssParse from "postcss-scss/lib/scss-parse";
import createError from "../common/parser-create-error.js";
import { parseFrontMatter } from "../main/front-matter/index.js";
import isObject from "../utilities/is-object.js";
import replaceNonLineBreaksWithSpace from "../utilities/replace-non-line-breaks-with-space.js";
import {
  calculateLoc,
  locEnd,
  locStart,
  replaceQuotesInInlineComments,
} from "./loc.js";
import parseMediaQuery from "./parse/parse-media-query.js";
import parseSelector from "./parse/parse-selector.js";
import parseValue from "./parse/parse-value.js";
import { addTypePrefix } from "./parse/utilities.js";
import { hasIgnorePragma, hasPragma } from "./pragma.js";
import isModuleRuleName from "./utilities/is-module-rule-name.js";
import isSCSSNestedPropertyNode from "./utilities/is-scss-nested-property-node.js";

// Returns `true` when `value[index]` is not inside a string or parentheses,
// i.e. a position where a trailing SCSS flag like `!default` may legitimately
// appear (rather than inside a quoted value such as `"!default"`).
function isTopLevelIndex(value, index) {
  let stringChar = "";
  let parenDepth = 0;
  for (let i = 0; i < index; i++) {
    const character = value[i];
    if (stringChar) {
      if (character === "\\") {
        i++;
      } else if (character === stringChar) {
        stringChar = "";
      }
    } else if (character === '"' || character === "'") {
      stringChar = character;
    } else if (character === "(") {
      parenDepth++;
    } else if (character === ")" && parenDepth > 0) {
      parenDepth--;
    }
  }
  return !stringChar && parenDepth === 0;
}

// Finds a trailing SCSS flag (`!default` / `!global`) that is a real
// declaration flag — i.e. appears at the top level — and returns the matched
// text (including the leading whitespace) and its start index. A flag that
// only occurs inside a string or parentheses (e.g. `$x: "!default"`) is
// ignored. (#19203)
function matchTrailingSCSSDirective(value, directive) {
  let searchFrom = 0;
  while (true) {
    const directiveIndex = value.indexOf(directive, searchFrom);
    if (directiveIndex === -1) {
      return null;
    }

    if (isTopLevelIndex(value, directiveIndex)) {
      let start = directiveIndex;
      while (start > 0 && /\s/u.test(value[start - 1])) {
        start--;
      }
      return { index: start, matched: value.slice(start) };
    }

    searchFrom = directiveIndex + directive.length;
  }
}

function parseNestedCSS(node, options) {
  if (isObject(node)) {
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
        const fakeContent =
          replaceNonLineBreaksWithSpace(textBefore) + nodeText;
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
        params += node.raws.between;
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
      const defaultSCSSDirective = matchTrailingSCSSDirective(
        value,
        "!default",
      );

      if (defaultSCSSDirective) {
        value = value.slice(0, defaultSCSSDirective.index);
        node.scssDefault = true;

        if (defaultSCSSDirective.matched.trim() !== "!default") {
          node.raws.scssDefault = defaultSCSSDirective.matched;
        }
      }

      const globalSCSSDirective = matchTrailingSCSSDirective(value, "!global");

      if (globalSCSSDirective) {
        value = value.slice(0, globalSCSSDirective.index);
        node.scssGlobal = true;

        if (globalSCSSDirective.matched.trim() !== "!global") {
          node.raws.scssGlobal = globalSCSSDirective.matched;
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

      // only CSS support custom-selector
      if (options.parser === "css" && node.name === "custom-selector") {
        const customSelector = node.params.match(/:--\S+\s+/)[0].trim();
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
        if (/^\(\s*(?:without|with)\s*:.+\)$/s.test(params)) {
          node.params = parseValue(params, options);
        } else {
          node.selector = parseSelector(params);
          delete node.params;
        }

        return node;
      }

      const lowercasedName = name.toLowerCase();
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
        params = params.replace(/(\$\S+?)(\s+)?\.{3}/, "$1...$2");
        // Remove unnecessary spaces before SCSS control, mixin and function directives
        // Move spaces after the `(`, so we can keep the range correct
        // Only match the first function call at the beginning, not nested ones
        params = params.replace(/^(?!if)([^"'\s(]+)(\s+)\(/, "$1($2");

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
      type: "front-matter",
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
