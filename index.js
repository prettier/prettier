const recast = require("recast");
const babylon = require("babylon");
const Printer = require("./src/printer").Printer;
const flowParser = require("flow-parser");

var babylonOptions = {
  sourceType: 'module',
  allowImportExportEverywhere: false,
  allowReturnOutsideFunction: false,
  plugins: [
    'asyncFunctions',
    'asyncGenerators',
    'classConstructorCall',
    'classProperties',
    'decorators',
    'doExpressions',
    'exponentiationOperator',
    'exportExtensions',
    'flow',
    'functionSent',
    'functionBind',
    'jsx',
    'objectRestSpread',
    'trailingFunctionCommas'
  ]
};

module.exports = {
  format: function(text, opts={}) {
    let ast;

    if(opts.useFlowParser) {
      ast = flowParser.parse(text);
      if(ast.errors.length > 0) {
        let msg = ast.errors[0].message + " on line " + ast.errors[0].loc.start.line
        if(opts.filename) {
          msg += " in file " + opts.filename;
        }
        throw new Error(msg);
      }
    }
    else {
      ast = recast.parse(text, {
        parser: {
          parse: function(source) {
            return babylon.parse(source, babylonOptions);
          }
        }
      });
    }

    ast.tokens = [];

    const printer = new Printer(opts);
    return printer.printGenerically(ast).code;
  }
};
