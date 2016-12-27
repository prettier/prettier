const fs = require('fs');
const child_process = require('child_process');
const jscodefmt = require("../");

function run_spec(dirname) {
  fs.readdirSync(dirname).forEach(filename => {
    if (filename.endsWith('.js') && filename !== 'jsfmt.spec.js') {
      const path = dirname + '/' + filename;

      const RUN_AST_TESTS = true;

      if (!RUN_AST_TESTS) {
        const source = read(path);
        const output = prettyprint(source);
        test(filename, () => {
          expect(source + '~'.repeat(80) + '\n' + output).toMatchSnapshot();
        });
      }

      if (RUN_AST_TESTS) {
        const source = read(dirname + '/' + filename);
        const ast = parse(source);
        let prettyprinted = false;
        let ppast;
        let pperr = null;
        try {
          ppast = parse(prettyprint(source));
        }
        catch(e) {
          pperr = e.stack;
        }

        test(path + ' parse', () => {
          expect(pperr).toBe(null);
          expect(ppast).toBeDefined();
          // expect(ast).toEqual(ppast);
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

function prettyprint(src) {
  return jscodefmt.format(src);
}

function read(filename) {
  return fs.readFileSync(filename, 'utf8');
}
