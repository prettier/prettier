"use strict";

function parse() {
  const ast = {
  "kind": "program",
  "loc": {
    "source": null,
    "start": {
      "line": 1,
      "column": 0,
      "offset": 0
    },
    "end": {
      "line": 4,
      "column": 0,
      "offset": 25
    }
  },
  "children": [
    {
      "kind": "assign",
      "loc": {
        "source": null,
        "start": {
          "line": 3,
          "column": 0,
          "offset": 7
        },
        "end": {
          "line": 3,
          "column": 16,
          "offset": 23
        }
      },
      "operator": "=",
      "left": {
        "kind": "variable",
        "loc": {
          "source": null,
          "start": {
            "line": 3,
            "column": 0,
            "offset": 7
          },
          "end": {
            "line": 3,
            "column": 6,
            "offset": 13
          }
        },
        "name": "hello",
        "byref": false,
        "curly": false
      },
      "right": {
        "kind": "string",
        "loc": {
          "source": null,
          "start": {
            "line": 3,
            "column": 9,
            "offset": 16
          },
          "end": {
            "line": 3,
            "column": 16,
            "offset": 23
          }
        },
        "value": "world",
        "isDoubleQuote": false
      }
    }
  ],
  "errors": []
};
return ast;
}
module.exports = parse;