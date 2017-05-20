"use strict";

function createError(message, line, column) {
  // Construct an error similar to the ones thrown by Babylon.
  const error = new SyntaxError(message + " (" + line + ":" + column + ")");
  error.loc = { line, column };
  return error;
}

function parse(text, opts) {
  let parseFunction;

  if (opts.parser === "flow") {
    parseFunction = parseWithFlow;
  } else if (opts.parser === "typescript") {
    parseFunction = parseWithTypeScript;
  } else if (opts.parser === "postcss") {
    parseFunction = parseWithPostCSS;
  } else {
    parseFunction = parseWithBabylon;
  }

  try {
    return parseFunction(text);
  } catch (error) {
    const loc = error.loc;

    if (loc) {
      const codeFrame = require("babel-code-frame");
      error.codeFrame = codeFrame(text, loc.line, loc.column + 1, {
        highlightCode: true
      });
      error.message += "\n" + error.codeFrame;
    }

    throw error;
  }
}

function parseWithFlow(text) {
  // Inline the require to avoid loading all the JS if we don't use it
  const flowParser = require("flow-parser");

  const ast = flowParser.parse(text, {
    esproposal_class_instance_fields: true,
    esproposal_class_static_fields: true,
    esproposal_export_star_as: true
  });

  if (ast.errors.length > 0) {
    throw createError(
      ast.errors[0].message,
      ast.errors[0].loc.start.line,
      ast.errors[0].loc.start.column
    );
  }

  return ast;
}

function parseWithBabylon(text) {
  // Inline the require to avoid loading all the JS if we don't use it
  const babylon = require("babylon");

  const babylonOptions = {
    sourceType: "module",
    allowImportExportEverywhere: false,
    allowReturnOutsideFunction: true,
    plugins: [
      "jsx",
      "flow",
      "doExpressions",
      "objectRestSpread",
      "decorators",
      "classProperties",
      "exportExtensions",
      "asyncGenerators",
      "functionBind",
      "functionSent",
      "dynamicImport"
    ]
  };

  try {
    return babylon.parse(text, babylonOptions);
  } catch (originalError) {
    try {
      return babylon.parse(
        text,
        Object.assign({}, babylonOptions, { strictMode: false })
      );
    } catch (nonStrictError) {
      throw originalError;
    }
  }
}

function parseWithTypeScript(text) {
  const jsx = isProbablyJsx(text);
  try {
    try {
      // Try passing with our best guess first.
      return tryParseTypeScript(text, jsx);
    } catch (e) {
      // But if we get it wrong, try the opposite.
      return tryParseTypeScript(text, !jsx);
    }
  } catch (e) {
    throw createError(e.message, e.lineNumber, e.column);
  }
}

function tryParseTypeScript(text, jsx) {
  // While we are working on typescript, we are putting it in devDependencies
  // so it shouldn't be picked up by static analysis
  const r = require;
  const parser = r("typescript-eslint-parser");
  return parser.parse(text, {
    loc: true,
    range: true,
    tokens: true,
    comment: true,
    useJSXTextNode: true,
    ecmaFeatures: { jsx }
  });
}

/**
 * Use a naive regular expression until we address
 * https://github.com/prettier/prettier/issues/1538
 */
function isProbablyJsx(text) {
  return new RegExp(
    [
      "(^[^\"'`]*</)", // Contains "</" when probably not in a string
      "|",
      "(^[^/]{2}.*\/>)" // Contains "/>" on line not starting with "//"
    ].join(""),
    "m"
  ).test(text);
}

function parseSelector(selector) {
  const r = require;
  const selectorParser = r("postcss-selector-parser");
  let result;
  selectorParser(result_ => {
    result = result_;
  }).process(selector);
  return addTypePrefix(result, "selector-");
}

function parseValueNodes(nodes) {
  let parenGroup = {
    open: null,
    close: null,
    groups: [],
    type: "paren_group"
  };
  const parenGroupStack = [parenGroup];
  const rootParenGroup = parenGroup;
  let commaGroup = {
    groups: [],
    type: "comma_group"
  };
  const commaGroupStack = [commaGroup];

  for (let i = 0; i < nodes.length; ++i) {
    if (nodes[i].type === "paren" && nodes[i].value === "(") {
      parenGroup = {
        open: nodes[i],
        close: null,
        groups: [],
        type: "paren_group"
      };
      parenGroupStack.push(parenGroup);

      commaGroup = {
        groups: [],
        type: "comma_group"
      };
      commaGroupStack.push(commaGroup);
    } else if (nodes[i].type === "paren" && nodes[i].value === ")") {
      if (commaGroup.groups.length) {
        parenGroup.groups.push(commaGroup);
      }
      parenGroup.close = nodes[i];

      if (commaGroupStack.length === 1) {
        throw new Error("Unbalanced parenthesis");
      }

      commaGroupStack.pop();
      commaGroup = commaGroupStack[commaGroupStack.length - 1];
      commaGroup.groups.push(parenGroup);

      parenGroupStack.pop();
      parenGroup = parenGroupStack[parenGroupStack.length - 1];
    } else if (nodes[i].type === "comma") {
      parenGroup.groups.push(commaGroup);
      commaGroup = {
        groups: [],
        type: "comma_group"
      };
      commaGroupStack[commaGroupStack.length - 1] = commaGroup;
    } else {
      commaGroup.groups.push(nodes[i]);
    }
  }
  if (commaGroup.groups.length > 0) {
    parenGroup.groups.push(commaGroup);
  }
  return rootParenGroup;
}

function addTypePrefix(node, prefix) {
  if (node && typeof node === "object") {
    delete node.parent;
    for (const key in node) {
      addTypePrefix(node[key], prefix);
      if (key === "type" && typeof node[key] === "string") {
        if (!node[key].startsWith(prefix)) {
          node[key] = prefix + node[key];
        }
      }
    }
  }
  return node;
}

function addMissingType(node) {
  if (node && typeof node === "object") {
    delete node.parent;
    for (const key in node) {
      addMissingType(node[key]);
    }
    if (!Array.isArray(node) && node.value && !node.type) {
      node.type = "unknown";
    }
  }
  return node;
}

function parseNestedValue(node) {
  if (node && typeof node === "object") {
    delete node.parent;
    for (const key in node) {
      parseNestedValue(node[key]);
      if (key === "nodes") {
        node.group = parseValueNodes(node[key]);
        delete node[key];
      }
    }
  }
  return node;
}

function parseValue(value) {
  const r = require;
  const valueParser = r("postcss-values-parser");
  const result = valueParser(value).parse();
  const parsedResult = parseNestedValue(result);
  return addTypePrefix(parsedResult, "value-");
}

function parseMediaQuery(value) {
  const r = require;
  const mediaParser = r("postcss-media-query-parser").default;
  const result = addMissingType(mediaParser(value));
  return addTypePrefix(result, "media-");
}

function parseNestedCSS(node) {
  if (node && typeof node === "object") {
    delete node.parent;
    for (const key in node) {
      parseNestedCSS(node[key]);
    }
    if (typeof node.selector === "string") {
      node.selector = parseSelector(node.selector);
    }
    if (typeof node.value === "string") {
      node.value = parseValue(node.value);
    }
    if (node.type === "css-atrule" && typeof node.params === "string") {
      node.params = parseMediaQuery(node.params);
    }
  }
  return node;
}

function parseWithPostCSS(text) {
  const r = require;
  const parser = r("postcss-less");
  try {
    const result = parser.parse(text);
    const prefixedResult = addTypePrefix(result, "css-");
    const parsedResult = parseNestedCSS(prefixedResult);
    // console.log(JSON.stringify(parsedResult, null, 2));
    return parsedResult;
  } catch (e) {
    if (typeof e.line !== "number") {
      throw e;
    }
    throw createError(e.name + " " + e.reason, e.line, e.column);
  }
}

module.exports = { parse };
