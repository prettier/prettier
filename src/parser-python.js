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
          args: [
            {
              annotation: null,
              arg: "x",
              ast_type: "arg",
              col_offset: 10,
              lineno: 1
            },
            {
              annotation: null,
              arg: "y",
              ast_type: "arg",
              col_offset: 13,
              lineno: 1
            }
          ],
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
            col_offset: 4,
            lineno: 2,
            value: {
              args: [
                {
                  ast_type: "Str",
                  col_offset: 10,
                  lineno: 2,
                  s: "hello world"
                },
                {
                  ast_type: "Name",
                  col_offset: 25,
                  ctx: { ast_type: "Load" },
                  id: "x",
                  lineno: 2
                },
                {
                  ast_type: "Name",
                  col_offset: 28,
                  ctx: { ast_type: "Load" },
                  id: "y",
                  lineno: 2
                }
              ],
              ast_type: "Call",
              col_offset: 4,
              func: {
                ast_type: "Name",
                col_offset: 4,
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
