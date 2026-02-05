const parserName = "doc-explorer";
const languageName = "Doc explorer";
const astFormat = parserName;

const expressionParserName = "__js_expression";

// `Symbol.for('description')`
function isSymbol(node) {
  return (
    node.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    !node.callee.computed &&
    !node.callee.optional &&
    node.callee.object.type === "Identifier" &&
    node.callee.object.name === "Symbol" &&
    node.callee.property.type === "Identifier" &&
    node.callee.property.name === "for" &&
    node.arguments.length === 1 &&
    node.arguments[0].type === "StringLiteral"
  );
}

function validateNode(node, builderNames) {
  if (!node?.type) {
    return;
  }

  if (node.type === "ObjectExpression") {
    for (const property of node.properties) {
      if (
        property.type !== "ObjectProperty" ||
        property.computed ||
        property.shorthand ||
        property.method
      ) {
        throw new Error("Unexpected object property.");
      }

      const { value } = property;

      if (isSymbol(value)) {
        continue;
      }

      validateNode(value, builderNames);
    }
    return;
  }

  if (node.type === "Identifier" && !builderNames.has(node.name)) {
    throw new Error(`Unexpected identifier name '${node.name}'.`);
  }

  for (const value of Object.values(node)) {
    const children = Array.isArray(value) ? value : [value];

    for (const child of children) {
      validateNode(child, builderNames);
    }
  }
}

export function createDocExplorerPlugin(
  prettier,
  prettierPackageManifest,
  version,
) {
  const builderNames = new Set(Object.keys(prettier.doc.builders));

  async function getJsExpressionParser() {
    const plugin = prettierPackageManifest.plugins.find((plugin) =>
      plugin.parsers?.includes(expressionParserName),
    );
    const pluginModule = await import(`./lib/${version}/${plugin.file}`);
    return pluginModule.parsers[expressionParserName];
  }

  let expressionParser;
  async function validateDoc(text) {
    expressionParser ??= await getJsExpressionParser();

    const ast = expressionParser.parse(text);
    if (ast.type !== "JsExpressionRoot") {
      throw new Error("Invalid doc");
    }

    validateNode(ast.node, builderNames);
  }

  async function parse(text) {
    await validateDoc(text);

    const value = new Function(
      `{ ${Object.keys(prettier.doc.builders)} }`,
      `const result = (${text || "''"}\n); return result;`,
    )(prettier.doc.builders);

    return { value };
  }

  return {
    parsers: {
      [parserName]: {
        parse,
        astFormat,
      },
    },
    printers: {
      [astFormat]: {
        print: ({ node }) => node.value,
      },
    },
    languages: [{ name: languageName, parsers: [parserName] }],
  };
}
