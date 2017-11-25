"use strict";

function parse(text /*, parsers, opts*/) {
  // TODO: implement parsing using astexport
  // https://github.com/fpoli/python-astexport

  // This is a sample AST used for testing purpose.
  const ast = {
    ast_type: "Module",
    body: [
      {
        args: {
          args: [],
          ast_type: "arguments",
          defaults: [],
          kw_defaults: [],
          kwarg: null,
          kwonlyargs: [],
          vararg: null
        },
        ast_type: "FunctionDef",
        body: [
          {
            ast_type: "Expr",
            col_offset: 2,
            lineno: 2,
            value: {
              args: [
                { ast_type: "Str", col_offset: 8, lineno: 2, s: "hello world" }
              ],
              ast_type: "Call",
              col_offset: 2,
              func: {
                ast_type: "Name",
                col_offset: 2,
                ctx: { ast_type: "Load" },
                id: "print",
                lineno: 2
              },
              keywords: [],
              lineno: 2
            }
          }
        ],
        col_offset: 0,
        decorator_list: [],
        lineno: 1,
        name: "hello",
        returns: null
      }
    ]
  };

  ast.comments = [];
  return ast;
}

module.exports = parse;
