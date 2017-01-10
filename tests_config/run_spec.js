"use strict";
const fs = require('fs');
const jscodefmt = require("../");
const recast = require("recast");
const types = require("ast-types");

const RUN_AST_TESTS = process.env["AST_COMPARE"];

// Ignoring empty statements that are added into the output removes a
// lot of noise from test failures and let's us focus on the real
// failures when comparing asts
function removeEmptyStatements(ast) {
  return types.visit(ast, {
    visitEmptyStatement: function(path) {
      path.prune();
      return false;
    }
  });
}

function run_spec(dirname) {
  fs.readdirSync(dirname).forEach(filename => {
    if (filename.endsWith('.js') && filename !== 'jsfmt.spec.js') {
      const path = dirname + '/' + filename;

      if (!RUN_AST_TESTS) {
        const source = read(path).replace(/\r\n/g, '\n');
        const output = prettyprint(source, path);
        test(filename, () => {
          expect(source + '~'.repeat(80) + '\n' + output).toMatchSnapshot();
        });
      }

      if (RUN_AST_TESTS) {
        const source = read(dirname + '/' + filename);
        const ast = removeEmptyStatements(parse(source));
        let prettyprinted = false;
        let ppast;
        let pperr = null;
        try {
          ppast = removeEmptyStatements(parse(prettyprint(source, path)));
        }
        catch(e) {
          pperr = e.stack;
        }

        test(path + ' parse', () => {
          expect(pperr).toBe(null);
          expect(ppast).toBeDefined();
          if(ast.errors.length === 0) {
            expect(ast).toEqual(ppast);
          }
        });
      }

    }
  });
}
global.run_spec = run_spec;

function stripLocation(ast) {
  if (Array.isArray(ast)) {
    return ast.map(e => stripLocation(e));
  }
  if (typeof ast === 'object') {
    const newObj = {};
    for (var key in ast) {
      if (key === 'loc' || key === 'range' || key === 'raw' || key === 'comments') {
        continue;
      }
      newObj[key] = stripLocation(ast[key]);
    }
    return newObj;
  }
  return ast;
}

function parse(string) {
  const flowParser = require('flow-parser');
  return stripLocation(flowParser.parse(string));
}

function prettyprint(src, filename) {
  return jscodefmt.format(src, { filename, useFlowParser: true, printWidth: 80 });
}

function read(filename) {
  return fs.readFileSync(filename, 'utf8');
}
