const parser = require("babylon");

function parseWithBabylon(text) {
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
    return parser.parse(text, babylonOptions);
  } catch (originalError) {
    try {
      return parser.parse(
        text,
        Object.assign({}, babylonOptions, { strictMode: false })
      );
    } catch (nonStrictError) {
      throw originalError;
    }
  }
}

module.exports = parseWithBabylon;
