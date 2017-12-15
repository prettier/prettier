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
      "line": 13,
      "column": 0,
      "offset": 251
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
          "column": 25,
          "offset": 32
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
            "column": 18,
            "offset": 25
          }
        },
        "name": "boolean_test_true",
        "byref": false,
        "curly": false
      },
      "right": {
        "kind": "boolean",
        "loc": {
          "source": null,
          "start": {
            "line": 3,
            "column": 21,
            "offset": 28
          },
          "end": {
            "line": 3,
            "column": 25,
            "offset": 32
          }
        },
        "value": true
      }
    },
    {
      "kind": "assign",
      "loc": {
        "source": null,
        "start": {
          "line": 4,
          "column": 0,
          "offset": 34
        },
        "end": {
          "line": 4,
          "column": 27,
          "offset": 61
        }
      },
      "operator": "=",
      "left": {
        "kind": "variable",
        "loc": {
          "source": null,
          "start": {
            "line": 4,
            "column": 0,
            "offset": 34
          },
          "end": {
            "line": 4,
            "column": 19,
            "offset": 53
          }
        },
        "name": "boolean_test_false",
        "byref": false,
        "curly": false
      },
      "right": {
        "kind": "boolean",
        "loc": {
          "source": null,
          "start": {
            "line": 4,
            "column": 22,
            "offset": 56
          },
          "end": {
            "line": 4,
            "column": 27,
            "offset": 61
          }
        },
        "value": false
      }
    },
    {
      "kind": "assign",
      "loc": {
        "source": null,
        "start": {
          "line": 5,
          "column": 0,
          "offset": 63
        },
        "end": {
          "line": 5,
          "column": 28,
          "offset": 91
        }
      },
      "operator": "=",
      "left": {
        "kind": "variable",
        "loc": {
          "source": null,
          "start": {
            "line": 5,
            "column": 0,
            "offset": 63
          },
          "end": {
            "line": 5,
            "column": 12,
            "offset": 75
          }
        },
        "name": "string_test",
        "byref": false,
        "curly": false
      },
      "right": {
        "kind": "string",
        "loc": {
          "source": null,
          "start": {
            "line": 5,
            "column": 15,
            "offset": 78
          },
          "end": {
            "line": 5,
            "column": 28,
            "offset": 91
          }
        },
        "value": "hello_world",
        "isDoubleQuote": false
      }
    },
    {
      "kind": "assign",
      "loc": {
        "source": null,
        "start": {
          "line": 6,
          "column": 0,
          "offset": 93
        },
        "end": {
          "line": 6,
          "column": 25,
          "offset": 118
        }
      },
      "operator": "=",
      "left": {
        "kind": "variable",
        "loc": {
          "source": null,
          "start": {
            "line": 6,
            "column": 0,
            "offset": 93
          },
          "end": {
            "line": 6,
            "column": 12,
            "offset": 105
          }
        },
        "name": "number_test",
        "byref": false,
        "curly": false
      },
      "right": {
        "kind": "number",
        "loc": {
          "source": null,
          "start": {
            "line": 6,
            "column": 15,
            "offset": 108
          },
          "end": {
            "line": 6,
            "column": 25,
            "offset": 118
          }
        },
        "value": "12345.1234"
      }
    },
    {
      "kind": "doc",
      "loc": {
        "source": null,
        "start": {
          "line": 8,
          "column": 0,
          "offset": 121
        },
        "end": {
          "line": 13,
          "column": 0,
          "offset": 251
        }
      },
      "isDoc": false,
      "lines": [
        "@TODO: more complicated - might split out into separate tests",
        "$inline_test",
        "$magic_test",
        "$nowdoc_test",
        "$encapsed_test"
      ]
    }
  ],
  "errors": []
};
return ast;
}
module.exports = parse;