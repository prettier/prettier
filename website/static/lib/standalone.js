(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.prettier = factory());
}(this, (function () { 'use strict';

var name = "prettier";
var version$1 = "1.14.3";
var description = "Prettier is an opinionated code formatter";
var bin = {
  "prettier": "./bin/prettier.js"
};
var repository = "prettier/prettier";
var homepage = "https://prettier.io";
var author = "James Long";
var license = "MIT";
var main = "./index.js";
var engines = {
  "node": ">=6"
};
var dependencies = {
  "@babel/code-frame": "7.0.0-beta.46",
  "@babel/parser": "7.0.0-beta.55",
  "@glimmer/syntax": "0.30.3",
  "@iarna/toml": "2.0.0",
  "camelcase": "4.1.0",
  "chalk": "2.1.0",
  "cjk-regex": "1.0.2",
  "cosmiconfig": "5.0.5",
  "dashify": "0.2.2",
  "dedent": "0.7.0",
  "diff": "3.2.0",
  "editorconfig": "0.15.0",
  "editorconfig-to-prettier": "0.0.6",
  "emoji-regex": "6.5.1",
  "escape-string-regexp": "1.0.5",
  "esutils": "2.0.2",
  "find-parent-dir": "0.3.0",
  "find-project-root": "1.1.1",
  "flow-parser": "0.78.0",
  "get-stream": "3.0.0",
  "globby": "6.1.0",
  "graphql": "0.13.2",
  "html-tag-names": "1.1.2",
  "ignore": "3.3.7",
  "jest-docblock": "23.2.0",
  "json-stable-stringify": "1.0.1",
  "leven": "2.1.0",
  "linguist-languages": "6.2.1-dev.20180706",
  "lodash.uniqby": "4.7.0",
  "mem": "1.1.0",
  "minimatch": "3.0.4",
  "minimist": "1.2.0",
  "normalize-path": "3.0.0",
  "parse5": "3.0.3",
  "postcss-less": "1.1.5",
  "postcss-media-query-parser": "0.2.3",
  "postcss-scss": "1.0.6",
  "postcss-selector-parser": "2.2.3",
  "postcss-values-parser": "1.5.0",
  "remark-parse": "5.0.0",
  "resolve": "1.5.0",
  "semver": "5.4.1",
  "string-width": "2.1.1",
  "typescript": "3.0.1",
  "typescript-eslint-parser": "18.0.0",
  "unicode-regex": "1.0.1",
  "unified": "6.1.6",
  "yaml": "ikatyang/yaml#a765c1ee16d6b8a5e715564645f2b85f7e04828b",
  "yaml-unist-parser": "ikatyang/yaml-unist-parser#cd4f73325b3fc02a6d17842d0d9cee0dfc729c9b"
};
var devDependencies = {
  "@babel/cli": "7.0.0-beta.55",
  "@babel/core": "7.0.0-beta.55",
  "@babel/preset-env": "7.0.0-beta.55",
  "babel-loader": "8.0.0-beta.3",
  "benchmark": "2.1.4",
  "builtin-modules": "2.0.0",
  "codecov": "2.2.0",
  "cross-env": "5.0.5",
  "eslint": "4.18.2",
  "eslint-config-prettier": "2.9.0",
  "eslint-friendly-formatter": "3.0.0",
  "eslint-plugin-import": "2.9.0",
  "eslint-plugin-prettier": "2.6.0",
  "eslint-plugin-react": "7.7.0",
  "execa": "0.10.0",
  "has-ansi": "3.0.0",
  "jest": "23.3.0",
  "jest-junit": "5.0.0",
  "jest-watch-typeahead": "0.1.0",
  "mkdirp": "0.5.1",
  "prettier": "1.14.1",
  "prettylint": "1.0.0",
  "rimraf": "2.6.2",
  "rollup": "0.47.6",
  "rollup-plugin-alias": "1.4.0",
  "rollup-plugin-babel": "4.0.0-beta.4",
  "rollup-plugin-commonjs": "8.2.6",
  "rollup-plugin-json": "2.1.1",
  "rollup-plugin-node-builtins": "2.0.0",
  "rollup-plugin-node-globals": "1.1.0",
  "rollup-plugin-node-resolve": "2.0.0",
  "rollup-plugin-replace": "1.2.1",
  "rollup-plugin-uglify": "3.0.0",
  "shelljs": "0.8.1",
  "snapshot-diff": "0.4.0",
  "strip-ansi": "4.0.0",
  "tempy": "0.2.1",
  "webpack": "3.12.0"
};
var resolutions = {
  "@babel/code-frame": "7.0.0-beta.46"
};
var scripts = {
  "prepublishOnly": "echo \"Error: must publish from dist/\" && exit 1",
  "prepare-release": "yarn && yarn build && yarn test:dist",
  "test": "jest",
  "test:dist": "node ./scripts/test-dist.js",
  "test-integration": "jest tests_integration",
  "perf-repeat": "yarn && yarn build && cross-env NODE_ENV=production node ./dist/bin-prettier.js --debug-repeat ${PERF_REPEAT:-1000} --loglevel debug ${PERF_FILE:-./index.js} > /dev/null",
  "perf-repeat-inspect": "yarn && yarn build && cross-env NODE_ENV=production node --inspect-brk ./dist/bin-prettier.js --debug-repeat ${PERF_REPEAT:-1000} --loglevel debug ${PERF_FILE:-./index.js} > /dev/null",
  "perf-benchmark": "yarn && yarn build && cross-env NODE_ENV=production node ./dist/bin-prettier.js --debug-benchmark --loglevel debug ${PERF_FILE:-./index.js} > /dev/null",
  "lint": "cross-env EFF_NO_LINK_RULES=true eslint . --format node_modules/eslint-friendly-formatter",
  "lint-docs": "prettylint {.,docs,website,website/blog}/*.md",
  "build": "node --max-old-space-size=2048 ./scripts/build/build.js",
  "build-docs": "node ./scripts/build-docs.js",
  "check-deps": "node ./scripts/check-deps.js"
};
var _package = {
  name: name,
  version: version$1,
  description: description,
  bin: bin,
  repository: repository,
  homepage: homepage,
  author: author,
  license: license,
  main: main,
  engines: engines,
  dependencies: dependencies,
  devDependencies: devDependencies,
  resolutions: resolutions,
  scripts: scripts
};

var _package$1 = Object.freeze({
	name: name,
	version: version$1,
	description: description,
	bin: bin,
	repository: repository,
	homepage: homepage,
	author: author,
	license: license,
	main: main,
	engines: engines,
	dependencies: dependencies,
	devDependencies: devDependencies,
	resolutions: resolutions,
	scripts: scripts,
	default: _package
});

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var base = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports['default'] =
  /*istanbul ignore end*/
  Diff;

  function Diff() {}

  Diff.prototype = {
    /*istanbul ignore start*/

    /*istanbul ignore end*/
    diff: function diff(oldString, newString) {
      /*istanbul ignore start*/
      var
      /*istanbul ignore end*/
      options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
      var callback = options.callback;

      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      this.options = options;
      var self = this;

      function done(value) {
        if (callback) {
          setTimeout(function () {
            callback(undefined, value);
          }, 0);
          return true;
        } else {
          return value;
        }
      } // Allow subclasses to massage the input prior to running


      oldString = this.castInput(oldString);
      newString = this.castInput(newString);
      oldString = this.removeEmpty(this.tokenize(oldString));
      newString = this.removeEmpty(this.tokenize(newString));
      var newLen = newString.length,
          oldLen = oldString.length;
      var editLength = 1;
      var maxEditLength = newLen + oldLen;
      var bestPath = [{
        newPos: -1,
        components: []
      }]; // Seed editLength = 0, i.e. the content starts with the same values

      var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);

      if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
        // Identity per the equality and tokenizer
        return done([{
          value: this.join(newString),
          count: newString.length
        }]);
      } // Main worker method. checks all permutations of a given edit length for acceptance.


      function execEditLength() {
        for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
          var basePath =
          /*istanbul ignore start*/
          void 0;

          var addPath = bestPath[diagonalPath - 1],
              removePath = bestPath[diagonalPath + 1],
              _oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;

          if (addPath) {
            // No one else is going to attempt to use this value, clear it
            bestPath[diagonalPath - 1] = undefined;
          }

          var canAdd = addPath && addPath.newPos + 1 < newLen,
              canRemove = removePath && 0 <= _oldPos && _oldPos < oldLen;

          if (!canAdd && !canRemove) {
            // If this path is a terminal then prune
            bestPath[diagonalPath] = undefined;
            continue;
          } // Select the diagonal that we want to branch from. We select the prior
          // path whose position in the new string is the farthest from the origin
          // and does not pass the bounds of the diff graph


          if (!canAdd || canRemove && addPath.newPos < removePath.newPos) {
            basePath = clonePath(removePath);
            self.pushComponent(basePath.components, undefined, true);
          } else {
            basePath = addPath; // No need to clone, we've pulled it from the list

            basePath.newPos++;
            self.pushComponent(basePath.components, true, undefined);
          }

          _oldPos = self.extractCommon(basePath, newString, oldString, diagonalPath); // If we have hit the end of both strings, then we are done

          if (basePath.newPos + 1 >= newLen && _oldPos + 1 >= oldLen) {
            return done(buildValues(self, basePath.components, newString, oldString, self.useLongestToken));
          } else {
            // Otherwise track this path as a potential candidate and continue.
            bestPath[diagonalPath] = basePath;
          }
        }

        editLength++;
      } // Performs the length of edit iteration. Is a bit fugly as this has to support the
      // sync and async mode which is never fun. Loops over execEditLength until a value
      // is produced.


      if (callback) {
        (function exec() {
          setTimeout(function () {
            // This should not happen, but we want to be safe.

            /* istanbul ignore next */
            if (editLength > maxEditLength) {
              return callback();
            }

            if (!execEditLength()) {
              exec();
            }
          }, 0);
        })();
      } else {
        while (editLength <= maxEditLength) {
          var ret = execEditLength();

          if (ret) {
            return ret;
          }
        }
      }
    },

    /*istanbul ignore start*/

    /*istanbul ignore end*/
    pushComponent: function pushComponent(components, added, removed) {
      var last = components[components.length - 1];

      if (last && last.added === added && last.removed === removed) {
        // We need to clone here as the component clone operation is just
        // as shallow array clone
        components[components.length - 1] = {
          count: last.count + 1,
          added: added,
          removed: removed
        };
      } else {
        components.push({
          count: 1,
          added: added,
          removed: removed
        });
      }
    },

    /*istanbul ignore start*/

    /*istanbul ignore end*/
    extractCommon: function extractCommon(basePath, newString, oldString, diagonalPath) {
      var newLen = newString.length,
          oldLen = oldString.length,
          newPos = basePath.newPos,
          oldPos = newPos - diagonalPath,
          commonCount = 0;

      while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
        newPos++;
        oldPos++;
        commonCount++;
      }

      if (commonCount) {
        basePath.components.push({
          count: commonCount
        });
      }

      basePath.newPos = newPos;
      return oldPos;
    },

    /*istanbul ignore start*/

    /*istanbul ignore end*/
    equals: function equals(left, right) {
      return left === right;
    },

    /*istanbul ignore start*/

    /*istanbul ignore end*/
    removeEmpty: function removeEmpty(array) {
      var ret = [];

      for (var i = 0; i < array.length; i++) {
        if (array[i]) {
          ret.push(array[i]);
        }
      }

      return ret;
    },

    /*istanbul ignore start*/

    /*istanbul ignore end*/
    castInput: function castInput(value) {
      return value;
    },

    /*istanbul ignore start*/

    /*istanbul ignore end*/
    tokenize: function tokenize(value) {
      return value.split('');
    },

    /*istanbul ignore start*/

    /*istanbul ignore end*/
    join: function join(chars) {
      return chars.join('');
    }
  };

  function buildValues(diff, components, newString, oldString, useLongestToken) {
    var componentPos = 0,
        componentLen = components.length,
        newPos = 0,
        oldPos = 0;

    for (; componentPos < componentLen; componentPos++) {
      var component = components[componentPos];

      if (!component.removed) {
        if (!component.added && useLongestToken) {
          var value = newString.slice(newPos, newPos + component.count);
          value = value.map(function (value, i) {
            var oldValue = oldString[oldPos + i];
            return oldValue.length > value.length ? oldValue : value;
          });
          component.value = diff.join(value);
        } else {
          component.value = diff.join(newString.slice(newPos, newPos + component.count));
        }

        newPos += component.count; // Common case

        if (!component.added) {
          oldPos += component.count;
        }
      } else {
        component.value = diff.join(oldString.slice(oldPos, oldPos + component.count));
        oldPos += component.count; // Reverse add and remove so removes are output first to match common convention
        // The diffing algorithm is tied to add then remove output and this is the simplest
        // route to get the desired output with minimal overhead.

        if (componentPos && components[componentPos - 1].added) {
          var tmp = components[componentPos - 1];
          components[componentPos - 1] = components[componentPos];
          components[componentPos] = tmp;
        }
      }
    } // Special case handle for when one terminal is ignored. For this case we merge the
    // terminal into the prior string and drop the change.


    var lastComponent = components[componentLen - 1];

    if (componentLen > 1 && (lastComponent.added || lastComponent.removed) && diff.equals('', lastComponent.value)) {
      components[componentLen - 2].value += lastComponent.value;
      components.pop();
    }

    return components;
  }

  function clonePath(path) {
    return {
      newPos: path.newPos,
      components: path.components.slice(0)
    };
  }
});
unwrapExports(base);

var character = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports.characterDiff = undefined;
  exports.
  /*istanbul ignore end*/
  diffChars = diffChars;
  /*istanbul ignore start*/

  var _base2 = _interopRequireDefault(base);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      'default': obj
    };
  }
  /*istanbul ignore end*/


  var characterDiff =
  /*istanbul ignore start*/
  exports.
  /*istanbul ignore end*/
  characterDiff = new
  /*istanbul ignore start*/
  _base2['default']();

  function diffChars(oldStr, newStr, callback) {
    return characterDiff.diff(oldStr, newStr, callback);
  }
});
unwrapExports(character);

var params = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports.
  /*istanbul ignore end*/
  generateOptions = generateOptions;

  function generateOptions(options, defaults) {
    if (typeof options === 'function') {
      defaults.callback = options;
    } else if (options) {
      for (var name in options) {
        /* istanbul ignore else */
        if (options.hasOwnProperty(name)) {
          defaults[name] = options[name];
        }
      }
    }

    return defaults;
  }
});
unwrapExports(params);

var word = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports.wordDiff = undefined;
  exports.
  /*istanbul ignore end*/
  diffWords = diffWords;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  diffWordsWithSpace = diffWordsWithSpace;
  /*istanbul ignore start*/

  var _base2 = _interopRequireDefault(base);
  /*istanbul ignore end*/

  /*istanbul ignore start*/


  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      'default': obj
    };
  }
  /*istanbul ignore end*/
  // Based on https://en.wikipedia.org/wiki/Latin_script_in_Unicode
  //
  // Ranges and exceptions:
  // Latin-1 Supplement, 0080–00FF
  //  - U+00D7  × Multiplication sign
  //  - U+00F7  ÷ Division sign
  // Latin Extended-A, 0100–017F
  // Latin Extended-B, 0180–024F
  // IPA Extensions, 0250–02AF
  // Spacing Modifier Letters, 02B0–02FF
  //  - U+02C7  ˇ &#711;  Caron
  //  - U+02D8  ˘ &#728;  Breve
  //  - U+02D9  ˙ &#729;  Dot Above
  //  - U+02DA  ˚ &#730;  Ring Above
  //  - U+02DB  ˛ &#731;  Ogonek
  //  - U+02DC  ˜ &#732;  Small Tilde
  //  - U+02DD  ˝ &#733;  Double Acute Accent
  // Latin Extended Additional, 1E00–1EFF


  var extendedWordChars = /^[A-Za-z\xC0-\u02C6\u02C8-\u02D7\u02DE-\u02FF\u1E00-\u1EFF]+$/;
  var reWhitespace = /\S/;
  var wordDiff =
  /*istanbul ignore start*/
  exports.
  /*istanbul ignore end*/
  wordDiff = new
  /*istanbul ignore start*/
  _base2['default']();

  wordDiff.equals = function (left, right) {
    return left === right || this.options.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right);
  };

  wordDiff.tokenize = function (value) {
    var tokens = value.split(/(\s+|\b)/); // Join the boundary splits that we do not consider to be boundaries. This is primarily the extended Latin character set.

    for (var i = 0; i < tokens.length - 1; i++) {
      // If we have an empty string in the next field and we have only word chars before and after, merge
      if (!tokens[i + 1] && tokens[i + 2] && extendedWordChars.test(tokens[i]) && extendedWordChars.test(tokens[i + 2])) {
        tokens[i] += tokens[i + 2];
        tokens.splice(i + 1, 2);
        i--;
      }
    }

    return tokens;
  };

  function diffWords(oldStr, newStr, callback) {
    var options =
    /*istanbul ignore start*/
    (0, params.generateOptions
    /*istanbul ignore end*/
    )(callback, {
      ignoreWhitespace: true
    });
    return wordDiff.diff(oldStr, newStr, options);
  }

  function diffWordsWithSpace(oldStr, newStr, callback) {
    return wordDiff.diff(oldStr, newStr, callback);
  }
});
unwrapExports(word);

var line = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports.lineDiff = undefined;
  exports.
  /*istanbul ignore end*/
  diffLines = diffLines;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  diffTrimmedLines = diffTrimmedLines;
  /*istanbul ignore start*/

  var _base2 = _interopRequireDefault(base);
  /*istanbul ignore end*/

  /*istanbul ignore start*/


  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      'default': obj
    };
  }
  /*istanbul ignore end*/


  var lineDiff =
  /*istanbul ignore start*/
  exports.
  /*istanbul ignore end*/
  lineDiff = new
  /*istanbul ignore start*/
  _base2['default']();

  lineDiff.tokenize = function (value) {
    var retLines = [],
        linesAndNewlines = value.split(/(\n|\r\n)/); // Ignore the final empty token that occurs if the string ends with a new line

    if (!linesAndNewlines[linesAndNewlines.length - 1]) {
      linesAndNewlines.pop();
    } // Merge the content and line separators into single tokens


    for (var i = 0; i < linesAndNewlines.length; i++) {
      var line = linesAndNewlines[i];

      if (i % 2 && !this.options.newlineIsToken) {
        retLines[retLines.length - 1] += line;
      } else {
        if (this.options.ignoreWhitespace) {
          line = line.trim();
        }

        retLines.push(line);
      }
    }

    return retLines;
  };

  function diffLines(oldStr, newStr, callback) {
    return lineDiff.diff(oldStr, newStr, callback);
  }

  function diffTrimmedLines(oldStr, newStr, callback) {
    var options =
    /*istanbul ignore start*/
    (0, params.generateOptions
    /*istanbul ignore end*/
    )(callback, {
      ignoreWhitespace: true
    });
    return lineDiff.diff(oldStr, newStr, options);
  }
});
unwrapExports(line);

var sentence = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports.sentenceDiff = undefined;
  exports.
  /*istanbul ignore end*/
  diffSentences = diffSentences;
  /*istanbul ignore start*/

  var _base2 = _interopRequireDefault(base);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      'default': obj
    };
  }
  /*istanbul ignore end*/


  var sentenceDiff =
  /*istanbul ignore start*/
  exports.
  /*istanbul ignore end*/
  sentenceDiff = new
  /*istanbul ignore start*/
  _base2['default']();

  sentenceDiff.tokenize = function (value) {
    return value.split(/(\S.+?[.!?])(?=\s+|$)/);
  };

  function diffSentences(oldStr, newStr, callback) {
    return sentenceDiff.diff(oldStr, newStr, callback);
  }
});
unwrapExports(sentence);

var css = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports.cssDiff = undefined;
  exports.
  /*istanbul ignore end*/
  diffCss = diffCss;
  /*istanbul ignore start*/

  var _base2 = _interopRequireDefault(base);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      'default': obj
    };
  }
  /*istanbul ignore end*/


  var cssDiff =
  /*istanbul ignore start*/
  exports.
  /*istanbul ignore end*/
  cssDiff = new
  /*istanbul ignore start*/
  _base2['default']();

  cssDiff.tokenize = function (value) {
    return value.split(/([{}:;,]|\s+)/);
  };

  function diffCss(oldStr, newStr, callback) {
    return cssDiff.diff(oldStr, newStr, callback);
  }
});
unwrapExports(css);

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null) return null;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _taggedTemplateLiteral(strings, raw) {
  if (!raw) {
    raw = strings.slice(0);
  }

  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var json = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports.jsonDiff = undefined;

  var _typeof$$1 = typeof Symbol === "function" && _typeof(Symbol.iterator) === "symbol" ? function (obj) {
    return _typeof(obj);
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : _typeof(obj);
  };

  exports.
  /*istanbul ignore end*/
  diffJson = diffJson;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  canonicalize = canonicalize;
  /*istanbul ignore start*/

  var _base2 = _interopRequireDefault$$1(base);
  /*istanbul ignore end*/

  /*istanbul ignore start*/


  function _interopRequireDefault$$1(obj) {
    return obj && obj.__esModule ? obj : {
      'default': obj
    };
  }
  /*istanbul ignore end*/


  var objectPrototypeToString = Object.prototype.toString;
  var jsonDiff =
  /*istanbul ignore start*/
  exports.
  /*istanbul ignore end*/
  jsonDiff = new
  /*istanbul ignore start*/
  _base2['default'](); // Discriminate between two lines of pretty-printed, serialized JSON where one of them has a
  // dangling comma and the other doesn't. Turns out including the dangling comma yields the nicest output:

  jsonDiff.useLongestToken = true;
  jsonDiff.tokenize =
  /*istanbul ignore start*/
  line.lineDiff.
  /*istanbul ignore end*/
  tokenize;

  jsonDiff.castInput = function (value) {
    /*istanbul ignore start*/
    var
    /*istanbul ignore end*/
    undefinedReplacement = this.options.undefinedReplacement;
    return typeof value === 'string' ? value : JSON.stringify(canonicalize(value), function (k, v) {
      if (typeof v === 'undefined') {
        return undefinedReplacement;
      }

      return v;
    }, '  ');
  };

  jsonDiff.equals = function (left, right) {
    return (
      /*istanbul ignore start*/
      _base2['default'].
      /*istanbul ignore end*/
      prototype.equals(left.replace(/,([\r\n])/g, '$1'), right.replace(/,([\r\n])/g, '$1'))
    );
  };

  function diffJson(oldObj, newObj, options) {
    return jsonDiff.diff(oldObj, newObj, options);
  } // This function handles the presence of circular references by bailing out when encountering an
  // object that is already on the "stack" of items being processed.


  function canonicalize(obj, stack, replacementStack) {
    stack = stack || [];
    replacementStack = replacementStack || [];
    var i =
    /*istanbul ignore start*/
    void 0;

    for (i = 0; i < stack.length; i += 1) {
      if (stack[i] === obj) {
        return replacementStack[i];
      }
    }

    var canonicalizedObj =
    /*istanbul ignore start*/
    void 0;

    if ('[object Array]' === objectPrototypeToString.call(obj)) {
      stack.push(obj);
      canonicalizedObj = new Array(obj.length);
      replacementStack.push(canonicalizedObj);

      for (i = 0; i < obj.length; i += 1) {
        canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack);
      }

      stack.pop();
      replacementStack.pop();
      return canonicalizedObj;
    }

    if (obj && obj.toJSON) {
      obj = obj.toJSON();
    }

    if (
    /*istanbul ignore start*/
    (typeof
    /*istanbul ignore end*/
    obj === 'undefined' ? 'undefined' : _typeof$$1(obj)) === 'object' && obj !== null) {
      stack.push(obj);
      canonicalizedObj = {};
      replacementStack.push(canonicalizedObj);
      var sortedKeys = [],
          key =
      /*istanbul ignore start*/
      void 0;

      for (key in obj) {
        /* istanbul ignore else */
        if (obj.hasOwnProperty(key)) {
          sortedKeys.push(key);
        }
      }

      sortedKeys.sort();

      for (i = 0; i < sortedKeys.length; i += 1) {
        key = sortedKeys[i];
        canonicalizedObj[key] = canonicalize(obj[key], stack, replacementStack);
      }

      stack.pop();
      replacementStack.pop();
    } else {
      canonicalizedObj = obj;
    }

    return canonicalizedObj;
  }
});
unwrapExports(json);

var array = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports.arrayDiff = undefined;
  exports.
  /*istanbul ignore end*/
  diffArrays = diffArrays;
  /*istanbul ignore start*/

  var _base2 = _interopRequireDefault(base);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      'default': obj
    };
  }
  /*istanbul ignore end*/


  var arrayDiff =
  /*istanbul ignore start*/
  exports.
  /*istanbul ignore end*/
  arrayDiff = new
  /*istanbul ignore start*/
  _base2['default']();

  arrayDiff.tokenize = arrayDiff.join = function (value) {
    return value.slice();
  };

  function diffArrays(oldArr, newArr, callback) {
    return arrayDiff.diff(oldArr, newArr, callback);
  }
});
unwrapExports(array);

var parse = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports.
  /*istanbul ignore end*/
  parsePatch = parsePatch;

  function parsePatch(uniDiff) {
    /*istanbul ignore start*/
    var
    /*istanbul ignore end*/
    options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var diffstr = uniDiff.split(/\r\n|[\n\v\f\r\x85]/),
        delimiters = uniDiff.match(/\r\n|[\n\v\f\r\x85]/g) || [],
        list = [],
        i = 0;

    function parseIndex() {
      var index = {};
      list.push(index); // Parse diff metadata

      while (i < diffstr.length) {
        var line = diffstr[i]; // File header found, end parsing diff metadata

        if (/^(\-\-\-|\+\+\+|@@)\s/.test(line)) {
          break;
        } // Diff index


        var header = /^(?:Index:|diff(?: -r \w+)+)\s+(.+?)\s*$/.exec(line);

        if (header) {
          index.index = header[1];
        }

        i++;
      } // Parse file headers if they are defined. Unified diff requires them, but
      // there's no technical issues to have an isolated hunk without file header


      parseFileHeader(index);
      parseFileHeader(index); // Parse hunks

      index.hunks = [];

      while (i < diffstr.length) {
        var _line = diffstr[i];

        if (/^(Index:|diff|\-\-\-|\+\+\+)\s/.test(_line)) {
          break;
        } else if (/^@@/.test(_line)) {
          index.hunks.push(parseHunk());
        } else if (_line && options.strict) {
          // Ignore unexpected content unless in strict mode
          throw new Error('Unknown line ' + (i + 1) + ' ' + JSON.stringify(_line));
        } else {
          i++;
        }
      }
    } // Parses the --- and +++ headers, if none are found, no lines
    // are consumed.


    function parseFileHeader(index) {
      var headerPattern = /^(---|\+\+\+)\s+([\S ]*)(?:\t(.*?)\s*)?$/;
      var fileHeader = headerPattern.exec(diffstr[i]);

      if (fileHeader) {
        var keyPrefix = fileHeader[1] === '---' ? 'old' : 'new';
        index[keyPrefix + 'FileName'] = fileHeader[2];
        index[keyPrefix + 'Header'] = fileHeader[3];
        i++;
      }
    } // Parses a hunk
    // This assumes that we are at the start of a hunk.


    function parseHunk() {
      var chunkHeaderIndex = i,
          chunkHeaderLine = diffstr[i++],
          chunkHeader = chunkHeaderLine.split(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      var hunk = {
        oldStart: +chunkHeader[1],
        oldLines: +chunkHeader[2] || 1,
        newStart: +chunkHeader[3],
        newLines: +chunkHeader[4] || 1,
        lines: [],
        linedelimiters: []
      };
      var addCount = 0,
          removeCount = 0;

      for (; i < diffstr.length; i++) {
        // Lines starting with '---' could be mistaken for the "remove line" operation
        // But they could be the header for the next file. Therefore prune such cases out.
        if (diffstr[i].indexOf('--- ') === 0 && i + 2 < diffstr.length && diffstr[i + 1].indexOf('+++ ') === 0 && diffstr[i + 2].indexOf('@@') === 0) {
          break;
        }

        var operation = diffstr[i][0];

        if (operation === '+' || operation === '-' || operation === ' ' || operation === '\\') {
          hunk.lines.push(diffstr[i]);
          hunk.linedelimiters.push(delimiters[i] || '\n');

          if (operation === '+') {
            addCount++;
          } else if (operation === '-') {
            removeCount++;
          } else if (operation === ' ') {
            addCount++;
            removeCount++;
          }
        } else {
          break;
        }
      } // Handle the empty block count case


      if (!addCount && hunk.newLines === 1) {
        hunk.newLines = 0;
      }

      if (!removeCount && hunk.oldLines === 1) {
        hunk.oldLines = 0;
      } // Perform optional sanity checking


      if (options.strict) {
        if (addCount !== hunk.newLines) {
          throw new Error('Added line count did not match for hunk at line ' + (chunkHeaderIndex + 1));
        }

        if (removeCount !== hunk.oldLines) {
          throw new Error('Removed line count did not match for hunk at line ' + (chunkHeaderIndex + 1));
        }
      }

      return hunk;
    }

    while (i < diffstr.length) {
      parseIndex();
    }

    return list;
  }
});
unwrapExports(parse);

var distanceIterator = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  "use strict";

  exports.__esModule = true;

  exports["default"] =
  /*istanbul ignore end*/
  function (start, minLine, maxLine) {
    var wantForward = true,
        backwardExhausted = false,
        forwardExhausted = false,
        localOffset = 1;
    return function iterator() {
      if (wantForward && !forwardExhausted) {
        if (backwardExhausted) {
          localOffset++;
        } else {
          wantForward = false;
        } // Check if trying to fit beyond text length, and if not, check it fits
        // after offset location (or desired location on first iteration)


        if (start + localOffset <= maxLine) {
          return localOffset;
        }

        forwardExhausted = true;
      }

      if (!backwardExhausted) {
        if (!forwardExhausted) {
          wantForward = true;
        } // Check if trying to fit before text beginning, and if not, check it fits
        // before offset location


        if (minLine <= start - localOffset) {
          return -localOffset++;
        }

        backwardExhausted = true;
        return iterator();
      } // We tried to fit hunk before text beginning and beyond text lenght, then
      // hunk can't fit on the text. Return undefined

    };
  };
});
unwrapExports(distanceIterator);

var apply = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports.
  /*istanbul ignore end*/
  applyPatch = applyPatch;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  applyPatches = applyPatches;
  /*istanbul ignore start*/

  var _distanceIterator2 = _interopRequireDefault(distanceIterator);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      'default': obj
    };
  }
  /*istanbul ignore end*/


  function applyPatch(source, uniDiff) {
    /*istanbul ignore start*/
    var
    /*istanbul ignore end*/
    options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (typeof uniDiff === 'string') {
      uniDiff =
      /*istanbul ignore start*/
      (0, parse.parsePatch
      /*istanbul ignore end*/
      )(uniDiff);
    }

    if (Array.isArray(uniDiff)) {
      if (uniDiff.length > 1) {
        throw new Error('applyPatch only works with a single input.');
      }

      uniDiff = uniDiff[0];
    } // Apply the diff to the input


    var lines = source.split(/\r\n|[\n\v\f\r\x85]/),
        delimiters = source.match(/\r\n|[\n\v\f\r\x85]/g) || [],
        hunks = uniDiff.hunks,
        compareLine = options.compareLine || function (lineNumber, line, operation, patchContent)
    /*istanbul ignore start*/
    {
      return (
        /*istanbul ignore end*/
        line === patchContent
      );
    },
        errorCount = 0,
        fuzzFactor = options.fuzzFactor || 0,
        minLine = 0,
        offset = 0,
        removeEOFNL =
    /*istanbul ignore start*/
    void 0
    /*istanbul ignore end*/
    ,
        addEOFNL =
    /*istanbul ignore start*/
    void 0;
    /**
     * Checks if the hunk exactly fits on the provided location
     */


    function hunkFits(hunk, toPos) {
      for (var j = 0; j < hunk.lines.length; j++) {
        var line = hunk.lines[j],
            operation = line[0],
            content = line.substr(1);

        if (operation === ' ' || operation === '-') {
          // Context sanity check
          if (!compareLine(toPos + 1, lines[toPos], operation, content)) {
            errorCount++;

            if (errorCount > fuzzFactor) {
              return false;
            }
          }

          toPos++;
        }
      }

      return true;
    } // Search best fit offsets for each hunk based on the previous ones


    for (var i = 0; i < hunks.length; i++) {
      var hunk = hunks[i],
          maxLine = lines.length - hunk.oldLines,
          localOffset = 0,
          toPos = offset + hunk.oldStart - 1;
      var iterator =
      /*istanbul ignore start*/
      (0, _distanceIterator2['default']
      /*istanbul ignore end*/
      )(toPos, minLine, maxLine);

      for (; localOffset !== undefined; localOffset = iterator()) {
        if (hunkFits(hunk, toPos + localOffset)) {
          hunk.offset = offset += localOffset;
          break;
        }
      }

      if (localOffset === undefined) {
        return false;
      } // Set lower text limit to end of the current hunk, so next ones don't try
      // to fit over already patched text


      minLine = hunk.offset + hunk.oldStart + hunk.oldLines;
    } // Apply patch hunks


    for (var _i = 0; _i < hunks.length; _i++) {
      var _hunk = hunks[_i],
          _toPos = _hunk.offset + _hunk.newStart - 1;

      if (_hunk.newLines == 0) {
        _toPos++;
      }

      for (var j = 0; j < _hunk.lines.length; j++) {
        var line = _hunk.lines[j],
            operation = line[0],
            content = line.substr(1),
            delimiter = _hunk.linedelimiters[j];

        if (operation === ' ') {
          _toPos++;
        } else if (operation === '-') {
          lines.splice(_toPos, 1);
          delimiters.splice(_toPos, 1);
          /* istanbul ignore else */
        } else if (operation === '+') {
          lines.splice(_toPos, 0, content);
          delimiters.splice(_toPos, 0, delimiter);
          _toPos++;
        } else if (operation === '\\') {
          var previousOperation = _hunk.lines[j - 1] ? _hunk.lines[j - 1][0] : null;

          if (previousOperation === '+') {
            removeEOFNL = true;
          } else if (previousOperation === '-') {
            addEOFNL = true;
          }
        }
      }
    } // Handle EOFNL insertion/removal


    if (removeEOFNL) {
      while (!lines[lines.length - 1]) {
        lines.pop();
        delimiters.pop();
      }
    } else if (addEOFNL) {
      lines.push('');
      delimiters.push('\n');
    }

    for (var _k = 0; _k < lines.length - 1; _k++) {
      lines[_k] = lines[_k] + delimiters[_k];
    }

    return lines.join('');
  } // Wrapper that supports multiple file patches via callbacks.


  function applyPatches(uniDiff, options) {
    if (typeof uniDiff === 'string') {
      uniDiff =
      /*istanbul ignore start*/
      (0, parse.parsePatch
      /*istanbul ignore end*/
      )(uniDiff);
    }

    var currentIndex = 0;

    function processIndex() {
      var index = uniDiff[currentIndex++];

      if (!index) {
        return options.complete();
      }

      options.loadFile(index, function (err, data) {
        if (err) {
          return options.complete(err);
        }

        var updatedContent = applyPatch(data, index, options);
        options.patched(index, updatedContent, function (err) {
          if (err) {
            return options.complete(err);
          }

          processIndex();
        });
      });
    }

    processIndex();
  }
});
unwrapExports(apply);

var create = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports.
  /*istanbul ignore end*/
  structuredPatch = structuredPatch;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  createTwoFilesPatch = createTwoFilesPatch;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  createPatch = createPatch;
  /*istanbul ignore start*/

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }
  /*istanbul ignore end*/


  function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
    if (!options) {
      options = {};
    }

    if (typeof options.context === 'undefined') {
      options.context = 4;
    }

    var diff =
    /*istanbul ignore start*/
    (0, line.diffLines
    /*istanbul ignore end*/
    )(oldStr, newStr, options);
    diff.push({
      value: '',
      lines: []
    }); // Append an empty value to make cleanup easier

    function contextLines(lines) {
      return lines.map(function (entry) {
        return ' ' + entry;
      });
    }

    var hunks = [];
    var oldRangeStart = 0,
        newRangeStart = 0,
        curRange = [],
        oldLine = 1,
        newLine = 1;
    /*istanbul ignore start*/

    var _loop = function _loop(
    /*istanbul ignore end*/
    i) {
      var current = diff[i],
          lines = current.lines || current.value.replace(/\n$/, '').split('\n');
      current.lines = lines;

      if (current.added || current.removed) {
        /*istanbul ignore start*/
        var _curRange;
        /*istanbul ignore end*/
        // If we have previous context, start with that


        if (!oldRangeStart) {
          var prev = diff[i - 1];
          oldRangeStart = oldLine;
          newRangeStart = newLine;

          if (prev) {
            curRange = options.context > 0 ? contextLines(prev.lines.slice(-options.context)) : [];
            oldRangeStart -= curRange.length;
            newRangeStart -= curRange.length;
          }
        } // Output our changes

        /*istanbul ignore start*/


        (_curRange =
        /*istanbul ignore end*/
        curRange).push.
        /*istanbul ignore start*/
        apply
        /*istanbul ignore end*/
        (
        /*istanbul ignore start*/
        _curRange
        /*istanbul ignore end*/
        ,
        /*istanbul ignore start*/
        _toConsumableArray(
        /*istanbul ignore end*/
        lines.map(function (entry) {
          return (current.added ? '+' : '-') + entry;
        }))); // Track the updated file position


        if (current.added) {
          newLine += lines.length;
        } else {
          oldLine += lines.length;
        }
      } else {
        // Identical context lines. Track line changes
        if (oldRangeStart) {
          // Close out any changes that have been output (or join overlapping)
          if (lines.length <= options.context * 2 && i < diff.length - 2) {
            /*istanbul ignore start*/
            var _curRange2;
            /*istanbul ignore end*/
            // Overlapping

            /*istanbul ignore start*/


            (_curRange2 =
            /*istanbul ignore end*/
            curRange).push.
            /*istanbul ignore start*/
            apply
            /*istanbul ignore end*/
            (
            /*istanbul ignore start*/
            _curRange2
            /*istanbul ignore end*/
            ,
            /*istanbul ignore start*/
            _toConsumableArray(
            /*istanbul ignore end*/
            contextLines(lines)));
          } else {
            /*istanbul ignore start*/
            var _curRange3;
            /*istanbul ignore end*/
            // end the range and output


            var contextSize = Math.min(lines.length, options.context);
            /*istanbul ignore start*/

            (_curRange3 =
            /*istanbul ignore end*/
            curRange).push.
            /*istanbul ignore start*/
            apply
            /*istanbul ignore end*/
            (
            /*istanbul ignore start*/
            _curRange3
            /*istanbul ignore end*/
            ,
            /*istanbul ignore start*/
            _toConsumableArray(
            /*istanbul ignore end*/
            contextLines(lines.slice(0, contextSize))));

            var hunk = {
              oldStart: oldRangeStart,
              oldLines: oldLine - oldRangeStart + contextSize,
              newStart: newRangeStart,
              newLines: newLine - newRangeStart + contextSize,
              lines: curRange
            };

            if (i >= diff.length - 2 && lines.length <= options.context) {
              // EOF is inside this hunk
              var oldEOFNewline = /\n$/.test(oldStr);
              var newEOFNewline = /\n$/.test(newStr);

              if (lines.length == 0 && !oldEOFNewline) {
                // special case: old has no eol and no trailing context; no-nl can end up before adds
                curRange.splice(hunk.oldLines, 0, '\\ No newline at end of file');
              } else if (!oldEOFNewline || !newEOFNewline) {
                curRange.push('\\ No newline at end of file');
              }
            }

            hunks.push(hunk);
            oldRangeStart = 0;
            newRangeStart = 0;
            curRange = [];
          }
        }

        oldLine += lines.length;
        newLine += lines.length;
      }
    };

    for (var i = 0; i < diff.length; i++) {
      /*istanbul ignore start*/
      _loop(
      /*istanbul ignore end*/
      i);
    }

    return {
      oldFileName: oldFileName,
      newFileName: newFileName,
      oldHeader: oldHeader,
      newHeader: newHeader,
      hunks: hunks
    };
  }

  function createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
    var diff = structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options);
    var ret = [];

    if (oldFileName == newFileName) {
      ret.push('Index: ' + oldFileName);
    }

    ret.push('===================================================================');
    ret.push('--- ' + diff.oldFileName + (typeof diff.oldHeader === 'undefined' ? '' : '\t' + diff.oldHeader));
    ret.push('+++ ' + diff.newFileName + (typeof diff.newHeader === 'undefined' ? '' : '\t' + diff.newHeader));

    for (var i = 0; i < diff.hunks.length; i++) {
      var hunk = diff.hunks[i];
      ret.push('@@ -' + hunk.oldStart + ',' + hunk.oldLines + ' +' + hunk.newStart + ',' + hunk.newLines + ' @@');
      ret.push.apply(ret, hunk.lines);
    }

    return ret.join('\n') + '\n';
  }

  function createPatch(fileName, oldStr, newStr, oldHeader, newHeader, options) {
    return createTwoFilesPatch(fileName, fileName, oldStr, newStr, oldHeader, newHeader, options);
  }
});
unwrapExports(create);

var dmp = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  "use strict";

  exports.__esModule = true;
  exports.
  /*istanbul ignore end*/
  convertChangesToDMP = convertChangesToDMP; // See: http://code.google.com/p/google-diff-match-patch/wiki/API

  function convertChangesToDMP(changes) {
    var ret = [],
        change =
    /*istanbul ignore start*/
    void 0
    /*istanbul ignore end*/
    ,
        operation =
    /*istanbul ignore start*/
    void 0;

    for (var i = 0; i < changes.length; i++) {
      change = changes[i];

      if (change.added) {
        operation = 1;
      } else if (change.removed) {
        operation = -1;
      } else {
        operation = 0;
      }

      ret.push([operation, change.value]);
    }

    return ret;
  }
});
unwrapExports(dmp);

var xml = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports.
  /*istanbul ignore end*/
  convertChangesToXML = convertChangesToXML;

  function convertChangesToXML(changes) {
    var ret = [];

    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];

      if (change.added) {
        ret.push('<ins>');
      } else if (change.removed) {
        ret.push('<del>');
      }

      ret.push(escapeHTML(change.value));

      if (change.added) {
        ret.push('</ins>');
      } else if (change.removed) {
        ret.push('</del>');
      }
    }

    return ret.join('');
  }

  function escapeHTML(s) {
    var n = s;
    n = n.replace(/&/g, '&amp;');
    n = n.replace(/</g, '&lt;');
    n = n.replace(/>/g, '&gt;');
    n = n.replace(/"/g, '&quot;');
    return n;
  }
});
unwrapExports(xml);

var lib = createCommonjsModule(function (module, exports) {
  /*istanbul ignore start*/
  'use strict';

  exports.__esModule = true;
  exports.canonicalize = exports.convertChangesToXML = exports.convertChangesToDMP = exports.parsePatch = exports.applyPatches = exports.applyPatch = exports.createPatch = exports.createTwoFilesPatch = exports.structuredPatch = exports.diffArrays = exports.diffJson = exports.diffCss = exports.diffSentences = exports.diffTrimmedLines = exports.diffLines = exports.diffWordsWithSpace = exports.diffWords = exports.diffChars = exports.Diff = undefined;
  /*istanbul ignore end*/

  /*istanbul ignore start*/

  var _base2 = _interopRequireDefault(base);
  /*istanbul ignore end*/

  /*istanbul ignore start*/


  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      'default': obj
    };
  }

  exports.
  /*istanbul ignore end*/
  Diff = _base2['default'];
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  diffChars = character.diffChars;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  diffWords = word.diffWords;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  diffWordsWithSpace = word.diffWordsWithSpace;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  diffLines = line.diffLines;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  diffTrimmedLines = line.diffTrimmedLines;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  diffSentences = sentence.diffSentences;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  diffCss = css.diffCss;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  diffJson = json.diffJson;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  diffArrays = array.diffArrays;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  structuredPatch = create.structuredPatch;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  createTwoFilesPatch = create.createTwoFilesPatch;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  createPatch = create.createPatch;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  applyPatch = apply.applyPatch;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  applyPatches = apply.applyPatches;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  parsePatch = parse.parsePatch;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  convertChangesToDMP = dmp.convertChangesToDMP;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  convertChangesToXML = xml.convertChangesToXML;
  /*istanbul ignore start*/

  exports.
  /*istanbul ignore end*/
  canonicalize = json.canonicalize;
  /* See LICENSE file for terms of use */

  /*
   * Text diff implementation.
   *
   * This library supports the following APIS:
   * JsDiff.diffChars: Character by character diff
   * JsDiff.diffWords: Word (as defined by \b regex) diff which ignores whitespace
   * JsDiff.diffLines: Line based diff
   *
   * JsDiff.diffCss: Diff targeted at CSS content
   *
   * These methods are based on the implementation proposed in
   * "An O(ND) Difference Algorithm and its Variations" (Myers, 1986).
   * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927
   */
});
unwrapExports(lib);

/*!
 * normalize-path <https://github.com/jonschlinkert/normalize-path>
 *
 * Copyright (c) 2014-2018, Jon Schlinkert.
 * Released under the MIT License.
 */
var normalizePath = function normalizePath(path, stripTrailing) {
  if (typeof path !== 'string') {
    throw new TypeError('expected path to be a string');
  }

  if (path === '\\' || path === '/') return '/';
  var len = path.length;
  if (len <= 1) return path; // ensure that win32 namespaces has two leading slashes, so that the path is
  // handled properly by the win32 version of path.parse() after being normalized
  // https://msdn.microsoft.com/library/windows/desktop/aa365247(v=vs.85).aspx#namespaces

  var prefix = '';

  if (len > 4 && path[3] === '\\') {
    var ch = path[2];

    if ((ch === '?' || ch === '.') && path.slice(0, 2) === '\\\\') {
      path = path.slice(2);
      prefix = '//';
    }
  }

  var segs = path.split(/[/\\]+/);

  if (stripTrailing !== false && segs[segs.length - 1] === '') {
    segs.pop();
  }

  return prefix + segs.join('/');
};

var ConfigError =
/*#__PURE__*/
function (_Error) {
  _inherits(ConfigError, _Error);

  function ConfigError() {
    _classCallCheck(this, ConfigError);

    return _possibleConstructorReturn(this, _getPrototypeOf(ConfigError).apply(this, arguments));
  }

  return ConfigError;
}(_wrapNativeSuper(Error));

var DebugError =
/*#__PURE__*/
function (_Error2) {
  _inherits(DebugError, _Error2);

  function DebugError() {
    _classCallCheck(this, DebugError);

    return _possibleConstructorReturn(this, _getPrototypeOf(DebugError).apply(this, arguments));
  }

  return DebugError;
}(_wrapNativeSuper(Error));

var UndefinedParserError$1 =
/*#__PURE__*/
function (_Error3) {
  _inherits(UndefinedParserError, _Error3);

  function UndefinedParserError() {
    _classCallCheck(this, UndefinedParserError);

    return _possibleConstructorReturn(this, _getPrototypeOf(UndefinedParserError).apply(this, arguments));
  }

  return UndefinedParserError;
}(_wrapNativeSuper(Error));

var errors = {
  ConfigError: ConfigError,
  DebugError: DebugError,
  UndefinedParserError: UndefinedParserError$1
};

var global$1 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};

// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;

if (typeof global$1.setTimeout === 'function') {
  cachedSetTimeout = setTimeout;
}

if (typeof global$1.clearTimeout === 'function') {
  cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

function nextTick(fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
} // v8 likes predictible objects

function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

var title = 'browser';
var platform = 'browser';
var browser = true;
var env = {};
var argv = [];
var version$2 = ''; // empty string to avoid regexp issues

var versions = {};
var release = {};
var config = {};

function noop() {}

var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;
function binding(name) {
  throw new Error('process.binding is not supported');
}
function cwd() {
  return '/';
}
function chdir(dir) {
  throw new Error('process.chdir is not supported');
}

function umask() {
  return 0;
} // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js

var performance = global$1.performance || {};

var performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function () {
  return new Date().getTime();
}; // generate timestamp or delta
// see http://nodejs.org/api/process.html#process_process_hrtime


function hrtime(previousTimestamp) {
  var clocktime = performanceNow.call(performance) * 1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor(clocktime % 1 * 1e9);

  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];

    if (nanoseconds < 0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }

  return [seconds, nanoseconds];
}
var startTime = new Date();
function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime;
  return dif / 1000;
}
var process = {
  nextTick: nextTick,
  title: title,
  browser: browser,
  env: env,
  argv: argv,
  version: version$2,
  versions: versions,
  on: on,
  addListener: addListener,
  once: once,
  off: off,
  removeListener: removeListener,
  removeAllListeners: removeAllListeners,
  emit: emit,
  binding: binding,
  cwd: cwd,
  chdir: chdir,
  umask: umask,
  hrtime: hrtime,
  platform: platform,
  release: release,
  config: config,
  uptime: uptime
};

var semver = createCommonjsModule(function (module, exports) {
  exports = module.exports = SemVer; // The debug function is excluded entirely from the minified version.

  /* nomin */

  var debug;
  /* nomin */

  if (_typeof(process) === 'object' &&
  /* nomin */
  process.env &&
  /* nomin */
  process.env.NODE_DEBUG &&
  /* nomin */
  /\bsemver\b/i.test(process.env.NODE_DEBUG))
    /* nomin */
    debug = function debug() {
      /* nomin */
      var args = Array.prototype.slice.call(arguments, 0);
      /* nomin */

      args.unshift('SEMVER');
      /* nomin */

      console.log.apply(console, args);
      /* nomin */
    };
    /* nomin */
  else
    /* nomin */
    debug = function debug() {}; // Note: this is the semver.org version of the spec that it implements
  // Not necessarily the package version of this code.

  exports.SEMVER_SPEC_VERSION = '2.0.0';
  var MAX_LENGTH = 256;
  var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991; // The actual regexps go on exports.re

  var re = exports.re = [];
  var src = exports.src = [];
  var R = 0; // The following Regular Expressions can be used for tokenizing,
  // validating, and parsing SemVer version strings.
  // ## Numeric Identifier
  // A single `0`, or a non-zero digit followed by zero or more digits.

  var NUMERICIDENTIFIER = R++;
  src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
  var NUMERICIDENTIFIERLOOSE = R++;
  src[NUMERICIDENTIFIERLOOSE] = '[0-9]+'; // ## Non-numeric Identifier
  // Zero or more digits, followed by a letter or hyphen, and then zero or
  // more letters, digits, or hyphens.

  var NONNUMERICIDENTIFIER = R++;
  src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*'; // ## Main Version
  // Three dot-separated numeric identifiers.

  var MAINVERSION = R++;
  src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' + '(' + src[NUMERICIDENTIFIER] + ')\\.' + '(' + src[NUMERICIDENTIFIER] + ')';
  var MAINVERSIONLOOSE = R++;
  src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' + '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' + '(' + src[NUMERICIDENTIFIERLOOSE] + ')'; // ## Pre-release Version Identifier
  // A numeric identifier, or a non-numeric identifier.

  var PRERELEASEIDENTIFIER = R++;
  src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] + '|' + src[NONNUMERICIDENTIFIER] + ')';
  var PRERELEASEIDENTIFIERLOOSE = R++;
  src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] + '|' + src[NONNUMERICIDENTIFIER] + ')'; // ## Pre-release Version
  // Hyphen, followed by one or more dot-separated pre-release version
  // identifiers.

  var PRERELEASE = R++;
  src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] + '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';
  var PRERELEASELOOSE = R++;
  src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] + '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))'; // ## Build Metadata Identifier
  // Any combination of digits, letters, or hyphens.

  var BUILDIDENTIFIER = R++;
  src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+'; // ## Build Metadata
  // Plus sign, followed by one or more period-separated build metadata
  // identifiers.

  var BUILD = R++;
  src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] + '(?:\\.' + src[BUILDIDENTIFIER] + ')*))'; // ## Full Version String
  // A main version, followed optionally by a pre-release version and
  // build metadata.
  // Note that the only major, minor, patch, and pre-release sections of
  // the version string are capturing groups.  The build metadata is not a
  // capturing group, because it should not ever be used in version
  // comparison.

  var FULL = R++;
  var FULLPLAIN = 'v?' + src[MAINVERSION] + src[PRERELEASE] + '?' + src[BUILD] + '?';
  src[FULL] = '^' + FULLPLAIN + '$'; // like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
  // also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
  // common in the npm registry.

  var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] + src[PRERELEASELOOSE] + '?' + src[BUILD] + '?';
  var LOOSE = R++;
  src[LOOSE] = '^' + LOOSEPLAIN + '$';
  var GTLT = R++;
  src[GTLT] = '((?:<|>)?=?)'; // Something like "2.*" or "1.2.x".
  // Note that "x.x" is a valid xRange identifer, meaning "any version"
  // Only the first item is strictly required.

  var XRANGEIDENTIFIERLOOSE = R++;
  src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
  var XRANGEIDENTIFIER = R++;
  src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';
  var XRANGEPLAIN = R++;
  src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' + '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' + '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' + '(?:' + src[PRERELEASE] + ')?' + src[BUILD] + '?' + ')?)?';
  var XRANGEPLAINLOOSE = R++;
  src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' + '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' + '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' + '(?:' + src[PRERELEASELOOSE] + ')?' + src[BUILD] + '?' + ')?)?';
  var XRANGE = R++;
  src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
  var XRANGELOOSE = R++;
  src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$'; // Tilde ranges.
  // Meaning is "reasonably at or greater than"

  var LONETILDE = R++;
  src[LONETILDE] = '(?:~>?)';
  var TILDETRIM = R++;
  src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
  re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
  var tildeTrimReplace = '$1~';
  var TILDE = R++;
  src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
  var TILDELOOSE = R++;
  src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$'; // Caret ranges.
  // Meaning is "at least and backwards compatible with"

  var LONECARET = R++;
  src[LONECARET] = '(?:\\^)';
  var CARETTRIM = R++;
  src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
  re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
  var caretTrimReplace = '$1^';
  var CARET = R++;
  src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
  var CARETLOOSE = R++;
  src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$'; // A simple gt/lt/eq thing, or just "" to indicate "any version"

  var COMPARATORLOOSE = R++;
  src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
  var COMPARATOR = R++;
  src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$'; // An expression to strip any whitespace between the gtlt and the thing
  // it modifies, so that `> 1.2.3` ==> `>1.2.3`

  var COMPARATORTRIM = R++;
  src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] + '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')'; // this one has to use the /g flag

  re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
  var comparatorTrimReplace = '$1$2$3'; // Something like `1.2.3 - 1.2.4`
  // Note that these all use the loose form, because they'll be
  // checked against either the strict or loose comparator form
  // later.

  var HYPHENRANGE = R++;
  src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' + '\\s+-\\s+' + '(' + src[XRANGEPLAIN] + ')' + '\\s*$';
  var HYPHENRANGELOOSE = R++;
  src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' + '\\s+-\\s+' + '(' + src[XRANGEPLAINLOOSE] + ')' + '\\s*$'; // Star ranges basically just allow anything at all.

  var STAR = R++;
  src[STAR] = '(<|>)?=?\\s*\\*'; // Compile to actual regexp objects.
  // All are flag-free, unless they were created above with a flag.

  for (var i = 0; i < R; i++) {
    debug(i, src[i]);
    if (!re[i]) re[i] = new RegExp(src[i]);
  }

  exports.parse = parse;

  function parse(version, loose) {
    if (version instanceof SemVer) return version;
    if (typeof version !== 'string') return null;
    if (version.length > MAX_LENGTH) return null;
    var r = loose ? re[LOOSE] : re[FULL];
    if (!r.test(version)) return null;

    try {
      return new SemVer(version, loose);
    } catch (er) {
      return null;
    }
  }

  exports.valid = valid;

  function valid(version, loose) {
    var v = parse(version, loose);
    return v ? v.version : null;
  }

  exports.clean = clean;

  function clean(version, loose) {
    var s = parse(version.trim().replace(/^[=v]+/, ''), loose);
    return s ? s.version : null;
  }

  exports.SemVer = SemVer;

  function SemVer(version, loose) {
    if (version instanceof SemVer) {
      if (version.loose === loose) return version;else version = version.version;
    } else if (typeof version !== 'string') {
      throw new TypeError('Invalid Version: ' + version);
    }

    if (version.length > MAX_LENGTH) throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters');
    if (!(this instanceof SemVer)) return new SemVer(version, loose);
    debug('SemVer', version, loose);
    this.loose = loose;
    var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);
    if (!m) throw new TypeError('Invalid Version: ' + version);
    this.raw = version; // these are actually numbers

    this.major = +m[1];
    this.minor = +m[2];
    this.patch = +m[3];
    if (this.major > MAX_SAFE_INTEGER || this.major < 0) throw new TypeError('Invalid major version');
    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) throw new TypeError('Invalid minor version');
    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) throw new TypeError('Invalid patch version'); // numberify any prerelease numeric ids

    if (!m[4]) this.prerelease = [];else this.prerelease = m[4].split('.').map(function (id) {
      if (/^[0-9]+$/.test(id)) {
        var num = +id;
        if (num >= 0 && num < MAX_SAFE_INTEGER) return num;
      }

      return id;
    });
    this.build = m[5] ? m[5].split('.') : [];
    this.format();
  }

  SemVer.prototype.format = function () {
    this.version = this.major + '.' + this.minor + '.' + this.patch;
    if (this.prerelease.length) this.version += '-' + this.prerelease.join('.');
    return this.version;
  };

  SemVer.prototype.toString = function () {
    return this.version;
  };

  SemVer.prototype.compare = function (other) {
    debug('SemVer.compare', this.version, this.loose, other);
    if (!(other instanceof SemVer)) other = new SemVer(other, this.loose);
    return this.compareMain(other) || this.comparePre(other);
  };

  SemVer.prototype.compareMain = function (other) {
    if (!(other instanceof SemVer)) other = new SemVer(other, this.loose);
    return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
  };

  SemVer.prototype.comparePre = function (other) {
    if (!(other instanceof SemVer)) other = new SemVer(other, this.loose); // NOT having a prerelease is > having one

    if (this.prerelease.length && !other.prerelease.length) return -1;else if (!this.prerelease.length && other.prerelease.length) return 1;else if (!this.prerelease.length && !other.prerelease.length) return 0;
    var i = 0;

    do {
      var a = this.prerelease[i];
      var b = other.prerelease[i];
      debug('prerelease compare', i, a, b);
      if (a === undefined && b === undefined) return 0;else if (b === undefined) return 1;else if (a === undefined) return -1;else if (a === b) continue;else return compareIdentifiers(a, b);
    } while (++i);
  }; // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.


  SemVer.prototype.inc = function (release$$1, identifier) {
    switch (release$$1) {
      case 'premajor':
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor = 0;
        this.major++;
        this.inc('pre', identifier);
        break;

      case 'preminor':
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor++;
        this.inc('pre', identifier);
        break;

      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0;
        this.inc('patch', identifier);
        this.inc('pre', identifier);
        break;
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.

      case 'prerelease':
        if (this.prerelease.length === 0) this.inc('patch', identifier);
        this.inc('pre', identifier);
        break;

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) this.major++;
        this.minor = 0;
        this.patch = 0;
        this.prerelease = [];
        break;

      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0) this.minor++;
        this.patch = 0;
        this.prerelease = [];
        break;

      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0) this.patch++;
        this.prerelease = [];
        break;
      // This probably shouldn't be used publicly.
      // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.

      case 'pre':
        if (this.prerelease.length === 0) this.prerelease = [0];else {
          var i = this.prerelease.length;

          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++;
              i = -2;
            }
          }

          if (i === -1) // didn't increment anything
            this.prerelease.push(0);
        }

        if (identifier) {
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          if (this.prerelease[0] === identifier) {
            if (isNaN(this.prerelease[1])) this.prerelease = [identifier, 0];
          } else this.prerelease = [identifier, 0];
        }

        break;

      default:
        throw new Error('invalid increment argument: ' + release$$1);
    }

    this.format();
    this.raw = this.version;
    return this;
  };

  exports.inc = inc;

  function inc(version, release$$1, loose, identifier) {
    if (typeof loose === 'string') {
      identifier = loose;
      loose = undefined;
    }

    try {
      return new SemVer(version, loose).inc(release$$1, identifier).version;
    } catch (er) {
      return null;
    }
  }

  exports.diff = diff;

  function diff(version1, version2) {
    if (eq(version1, version2)) {
      return null;
    } else {
      var v1 = parse(version1);
      var v2 = parse(version2);

      if (v1.prerelease.length || v2.prerelease.length) {
        for (var key in v1) {
          if (key === 'major' || key === 'minor' || key === 'patch') {
            if (v1[key] !== v2[key]) {
              return 'pre' + key;
            }
          }
        }

        return 'prerelease';
      }

      for (var key in v1) {
        if (key === 'major' || key === 'minor' || key === 'patch') {
          if (v1[key] !== v2[key]) {
            return key;
          }
        }
      }
    }
  }

  exports.compareIdentifiers = compareIdentifiers;
  var numeric = /^[0-9]+$/;

  function compareIdentifiers(a, b) {
    var anum = numeric.test(a);
    var bnum = numeric.test(b);

    if (anum && bnum) {
      a = +a;
      b = +b;
    }

    return anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : a > b ? 1 : 0;
  }

  exports.rcompareIdentifiers = rcompareIdentifiers;

  function rcompareIdentifiers(a, b) {
    return compareIdentifiers(b, a);
  }

  exports.major = major;

  function major(a, loose) {
    return new SemVer(a, loose).major;
  }

  exports.minor = minor;

  function minor(a, loose) {
    return new SemVer(a, loose).minor;
  }

  exports.patch = patch;

  function patch(a, loose) {
    return new SemVer(a, loose).patch;
  }

  exports.compare = compare;

  function compare(a, b, loose) {
    return new SemVer(a, loose).compare(new SemVer(b, loose));
  }

  exports.compareLoose = compareLoose;

  function compareLoose(a, b) {
    return compare(a, b, true);
  }

  exports.rcompare = rcompare;

  function rcompare(a, b, loose) {
    return compare(b, a, loose);
  }

  exports.sort = sort;

  function sort(list, loose) {
    return list.sort(function (a, b) {
      return exports.compare(a, b, loose);
    });
  }

  exports.rsort = rsort;

  function rsort(list, loose) {
    return list.sort(function (a, b) {
      return exports.rcompare(a, b, loose);
    });
  }

  exports.gt = gt;

  function gt(a, b, loose) {
    return compare(a, b, loose) > 0;
  }

  exports.lt = lt;

  function lt(a, b, loose) {
    return compare(a, b, loose) < 0;
  }

  exports.eq = eq;

  function eq(a, b, loose) {
    return compare(a, b, loose) === 0;
  }

  exports.neq = neq;

  function neq(a, b, loose) {
    return compare(a, b, loose) !== 0;
  }

  exports.gte = gte;

  function gte(a, b, loose) {
    return compare(a, b, loose) >= 0;
  }

  exports.lte = lte;

  function lte(a, b, loose) {
    return compare(a, b, loose) <= 0;
  }

  exports.cmp = cmp;

  function cmp(a, op, b, loose) {
    var ret;

    switch (op) {
      case '===':
        if (_typeof(a) === 'object') a = a.version;
        if (_typeof(b) === 'object') b = b.version;
        ret = a === b;
        break;

      case '!==':
        if (_typeof(a) === 'object') a = a.version;
        if (_typeof(b) === 'object') b = b.version;
        ret = a !== b;
        break;

      case '':
      case '=':
      case '==':
        ret = eq(a, b, loose);
        break;

      case '!=':
        ret = neq(a, b, loose);
        break;

      case '>':
        ret = gt(a, b, loose);
        break;

      case '>=':
        ret = gte(a, b, loose);
        break;

      case '<':
        ret = lt(a, b, loose);
        break;

      case '<=':
        ret = lte(a, b, loose);
        break;

      default:
        throw new TypeError('Invalid operator: ' + op);
    }

    return ret;
  }

  exports.Comparator = Comparator;

  function Comparator(comp, loose) {
    if (comp instanceof Comparator) {
      if (comp.loose === loose) return comp;else comp = comp.value;
    }

    if (!(this instanceof Comparator)) return new Comparator(comp, loose);
    debug('comparator', comp, loose);
    this.loose = loose;
    this.parse(comp);
    if (this.semver === ANY) this.value = '';else this.value = this.operator + this.semver.version;
    debug('comp', this);
  }

  var ANY = {};

  Comparator.prototype.parse = function (comp) {
    var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
    var m = comp.match(r);
    if (!m) throw new TypeError('Invalid comparator: ' + comp);
    this.operator = m[1];
    if (this.operator === '=') this.operator = ''; // if it literally is just '>' or '' then allow anything.

    if (!m[2]) this.semver = ANY;else this.semver = new SemVer(m[2], this.loose);
  };

  Comparator.prototype.toString = function () {
    return this.value;
  };

  Comparator.prototype.test = function (version) {
    debug('Comparator.test', version, this.loose);
    if (this.semver === ANY) return true;
    if (typeof version === 'string') version = new SemVer(version, this.loose);
    return cmp(version, this.operator, this.semver, this.loose);
  };

  Comparator.prototype.intersects = function (comp, loose) {
    if (!(comp instanceof Comparator)) {
      throw new TypeError('a Comparator is required');
    }

    var rangeTmp;

    if (this.operator === '') {
      rangeTmp = new Range(comp.value, loose);
      return satisfies(this.value, rangeTmp, loose);
    } else if (comp.operator === '') {
      rangeTmp = new Range(this.value, loose);
      return satisfies(comp.semver, rangeTmp, loose);
    }

    var sameDirectionIncreasing = (this.operator === '>=' || this.operator === '>') && (comp.operator === '>=' || comp.operator === '>');
    var sameDirectionDecreasing = (this.operator === '<=' || this.operator === '<') && (comp.operator === '<=' || comp.operator === '<');
    var sameSemVer = this.semver.version === comp.semver.version;
    var differentDirectionsInclusive = (this.operator === '>=' || this.operator === '<=') && (comp.operator === '>=' || comp.operator === '<=');
    var oppositeDirectionsLessThan = cmp(this.semver, '<', comp.semver, loose) && (this.operator === '>=' || this.operator === '>') && (comp.operator === '<=' || comp.operator === '<');
    var oppositeDirectionsGreaterThan = cmp(this.semver, '>', comp.semver, loose) && (this.operator === '<=' || this.operator === '<') && (comp.operator === '>=' || comp.operator === '>');
    return sameDirectionIncreasing || sameDirectionDecreasing || sameSemVer && differentDirectionsInclusive || oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
  };

  exports.Range = Range;

  function Range(range, loose) {
    if (range instanceof Range) {
      if (range.loose === loose) {
        return range;
      } else {
        return new Range(range.raw, loose);
      }
    }

    if (range instanceof Comparator) {
      return new Range(range.value, loose);
    }

    if (!(this instanceof Range)) return new Range(range, loose);
    this.loose = loose; // First, split based on boolean or ||

    this.raw = range;
    this.set = range.split(/\s*\|\|\s*/).map(function (range) {
      return this.parseRange(range.trim());
    }, this).filter(function (c) {
      // throw out any that are not relevant for whatever reason
      return c.length;
    });

    if (!this.set.length) {
      throw new TypeError('Invalid SemVer Range: ' + range);
    }

    this.format();
  }

  Range.prototype.format = function () {
    this.range = this.set.map(function (comps) {
      return comps.join(' ').trim();
    }).join('||').trim();
    return this.range;
  };

  Range.prototype.toString = function () {
    return this.range;
  };

  Range.prototype.parseRange = function (range) {
    var loose = this.loose;
    range = range.trim();
    debug('range', range, loose); // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`

    var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
    range = range.replace(hr, hyphenReplace);
    debug('hyphen replace', range); // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`

    range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
    debug('comparator trim', range, re[COMPARATORTRIM]); // `~ 1.2.3` => `~1.2.3`

    range = range.replace(re[TILDETRIM], tildeTrimReplace); // `^ 1.2.3` => `^1.2.3`

    range = range.replace(re[CARETTRIM], caretTrimReplace); // normalize spaces

    range = range.split(/\s+/).join(' '); // At this point, the range is completely trimmed and
    // ready to be split into comparators.

    var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
    var set = range.split(' ').map(function (comp) {
      return parseComparator(comp, loose);
    }).join(' ').split(/\s+/);

    if (this.loose) {
      // in loose mode, throw out any that are not valid comparators
      set = set.filter(function (comp) {
        return !!comp.match(compRe);
      });
    }

    set = set.map(function (comp) {
      return new Comparator(comp, loose);
    });
    return set;
  };

  Range.prototype.intersects = function (range, loose) {
    if (!(range instanceof Range)) {
      throw new TypeError('a Range is required');
    }

    return this.set.some(function (thisComparators) {
      return thisComparators.every(function (thisComparator) {
        return range.set.some(function (rangeComparators) {
          return rangeComparators.every(function (rangeComparator) {
            return thisComparator.intersects(rangeComparator, loose);
          });
        });
      });
    });
  }; // Mostly just for testing and legacy API reasons


  exports.toComparators = toComparators;

  function toComparators(range, loose) {
    return new Range(range, loose).set.map(function (comp) {
      return comp.map(function (c) {
        return c.value;
      }).join(' ').trim().split(' ');
    });
  } // comprised of xranges, tildes, stars, and gtlt's at this point.
  // already replaced the hyphen ranges
  // turn into a set of JUST comparators.


  function parseComparator(comp, loose) {
    debug('comp', comp);
    comp = replaceCarets(comp, loose);
    debug('caret', comp);
    comp = replaceTildes(comp, loose);
    debug('tildes', comp);
    comp = replaceXRanges(comp, loose);
    debug('xrange', comp);
    comp = replaceStars(comp, loose);
    debug('stars', comp);
    return comp;
  }

  function isX(id) {
    return !id || id.toLowerCase() === 'x' || id === '*';
  } // ~, ~> --> * (any, kinda silly)
  // ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
  // ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
  // ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
  // ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
  // ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0


  function replaceTildes(comp, loose) {
    return comp.trim().split(/\s+/).map(function (comp) {
      return replaceTilde(comp, loose);
    }).join(' ');
  }

  function replaceTilde(comp, loose) {
    var r = loose ? re[TILDELOOSE] : re[TILDE];
    return comp.replace(r, function (_, M, m, p, pr) {
      debug('tilde', comp, _, M, m, p, pr);
      var ret;
      if (isX(M)) ret = '';else if (isX(m)) ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';else if (isX(p)) // ~1.2 == >=1.2.0 <1.3.0
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';else if (pr) {
        debug('replaceTilde pr', pr);
        if (pr.charAt(0) !== '-') pr = '-' + pr;
        ret = '>=' + M + '.' + m + '.' + p + pr + ' <' + M + '.' + (+m + 1) + '.0';
      } else // ~1.2.3 == >=1.2.3 <1.3.0
        ret = '>=' + M + '.' + m + '.' + p + ' <' + M + '.' + (+m + 1) + '.0';
      debug('tilde return', ret);
      return ret;
    });
  } // ^ --> * (any, kinda silly)
  // ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
  // ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
  // ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
  // ^1.2.3 --> >=1.2.3 <2.0.0
  // ^1.2.0 --> >=1.2.0 <2.0.0


  function replaceCarets(comp, loose) {
    return comp.trim().split(/\s+/).map(function (comp) {
      return replaceCaret(comp, loose);
    }).join(' ');
  }

  function replaceCaret(comp, loose) {
    debug('caret', comp, loose);
    var r = loose ? re[CARETLOOSE] : re[CARET];
    return comp.replace(r, function (_, M, m, p, pr) {
      debug('caret', comp, _, M, m, p, pr);
      var ret;
      if (isX(M)) ret = '';else if (isX(m)) ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';else if (isX(p)) {
        if (M === '0') ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';else ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0';
      } else if (pr) {
        debug('replaceCaret pr', pr);
        if (pr.charAt(0) !== '-') pr = '-' + pr;

        if (M === '0') {
          if (m === '0') ret = '>=' + M + '.' + m + '.' + p + pr + ' <' + M + '.' + m + '.' + (+p + 1);else ret = '>=' + M + '.' + m + '.' + p + pr + ' <' + M + '.' + (+m + 1) + '.0';
        } else ret = '>=' + M + '.' + m + '.' + p + pr + ' <' + (+M + 1) + '.0.0';
      } else {
        debug('no pr');

        if (M === '0') {
          if (m === '0') ret = '>=' + M + '.' + m + '.' + p + ' <' + M + '.' + m + '.' + (+p + 1);else ret = '>=' + M + '.' + m + '.' + p + ' <' + M + '.' + (+m + 1) + '.0';
        } else ret = '>=' + M + '.' + m + '.' + p + ' <' + (+M + 1) + '.0.0';
      }
      debug('caret return', ret);
      return ret;
    });
  }

  function replaceXRanges(comp, loose) {
    debug('replaceXRanges', comp, loose);
    return comp.split(/\s+/).map(function (comp) {
      return replaceXRange(comp, loose);
    }).join(' ');
  }

  function replaceXRange(comp, loose) {
    comp = comp.trim();
    var r = loose ? re[XRANGELOOSE] : re[XRANGE];
    return comp.replace(r, function (ret, gtlt, M, m, p, pr) {
      debug('xRange', comp, ret, gtlt, M, m, p, pr);
      var xM = isX(M);
      var xm = xM || isX(m);
      var xp = xm || isX(p);
      var anyX = xp;
      if (gtlt === '=' && anyX) gtlt = '';

      if (xM) {
        if (gtlt === '>' || gtlt === '<') {
          // nothing is allowed
          ret = '<0.0.0';
        } else {
          // nothing is forbidden
          ret = '*';
        }
      } else if (gtlt && anyX) {
        // replace X with 0
        if (xm) m = 0;
        if (xp) p = 0;

        if (gtlt === '>') {
          // >1 => >=2.0.0
          // >1.2 => >=1.3.0
          // >1.2.3 => >= 1.2.4
          gtlt = '>=';

          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else if (xp) {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === '<=') {
          // <=0.7.x is actually <0.8.0, since any 0.7.x should
          // pass.  Similarly, <=7.x is actually <8.0.0, etc.
          gtlt = '<';
          if (xm) M = +M + 1;else m = +m + 1;
        }

        ret = gtlt + M + '.' + m + '.' + p;
      } else if (xm) {
        ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
      } else if (xp) {
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
      }

      debug('xRange return', ret);
      return ret;
    });
  } // Because * is AND-ed with everything else in the comparator,
  // and '' means "any version", just remove the *s entirely.


  function replaceStars(comp, loose) {
    debug('replaceStars', comp, loose); // Looseness is ignored here.  star is always as loose as it gets!

    return comp.trim().replace(re[STAR], '');
  } // This function is passed to string.replace(re[HYPHENRANGE])
  // M, m, patch, prerelease, build
  // 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
  // 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
  // 1.2 - 3.4 => >=1.2.0 <3.5.0


  function hyphenReplace($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) {
    if (isX(fM)) from = '';else if (isX(fm)) from = '>=' + fM + '.0.0';else if (isX(fp)) from = '>=' + fM + '.' + fm + '.0';else from = '>=' + from;
    if (isX(tM)) to = '';else if (isX(tm)) to = '<' + (+tM + 1) + '.0.0';else if (isX(tp)) to = '<' + tM + '.' + (+tm + 1) + '.0';else if (tpr) to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;else to = '<=' + to;
    return (from + ' ' + to).trim();
  } // if ANY of the sets match ALL of its comparators, then pass


  Range.prototype.test = function (version) {
    if (!version) return false;
    if (typeof version === 'string') version = new SemVer(version, this.loose);

    for (var i = 0; i < this.set.length; i++) {
      if (testSet(this.set[i], version)) return true;
    }

    return false;
  };

  function testSet(set, version) {
    for (var i = 0; i < set.length; i++) {
      if (!set[i].test(version)) return false;
    }

    if (version.prerelease.length) {
      // Find the set of versions that are allowed to have prereleases
      // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
      // That should allow `1.2.3-pr.2` to pass.
      // However, `1.2.4-alpha.notready` should NOT be allowed,
      // even though it's within the range set by the comparators.
      for (var i = 0; i < set.length; i++) {
        debug(set[i].semver);
        if (set[i].semver === ANY) continue;

        if (set[i].semver.prerelease.length > 0) {
          var allowed = set[i].semver;
          if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) return true;
        }
      } // Version has a -pre, but it's not one of the ones we like.


      return false;
    }

    return true;
  }

  exports.satisfies = satisfies;

  function satisfies(version, range, loose) {
    try {
      range = new Range(range, loose);
    } catch (er) {
      return false;
    }

    return range.test(version);
  }

  exports.maxSatisfying = maxSatisfying;

  function maxSatisfying(versions$$1, range, loose) {
    var max = null;
    var maxSV = null;

    try {
      var rangeObj = new Range(range, loose);
    } catch (er) {
      return null;
    }

    versions$$1.forEach(function (v) {
      if (rangeObj.test(v)) {
        // satisfies(v, range, loose)
        if (!max || maxSV.compare(v) === -1) {
          // compare(max, v, true)
          max = v;
          maxSV = new SemVer(max, loose);
        }
      }
    });
    return max;
  }

  exports.minSatisfying = minSatisfying;

  function minSatisfying(versions$$1, range, loose) {
    var min = null;
    var minSV = null;

    try {
      var rangeObj = new Range(range, loose);
    } catch (er) {
      return null;
    }

    versions$$1.forEach(function (v) {
      if (rangeObj.test(v)) {
        // satisfies(v, range, loose)
        if (!min || minSV.compare(v) === 1) {
          // compare(min, v, true)
          min = v;
          minSV = new SemVer(min, loose);
        }
      }
    });
    return min;
  }

  exports.validRange = validRange;

  function validRange(range, loose) {
    try {
      // Return '*' instead of '' so that truthiness works.
      // This will throw if it's invalid anyway
      return new Range(range, loose).range || '*';
    } catch (er) {
      return null;
    }
  } // Determine if version is less than all the versions possible in the range


  exports.ltr = ltr;

  function ltr(version, range, loose) {
    return outside(version, range, '<', loose);
  } // Determine if version is greater than all the versions possible in the range.


  exports.gtr = gtr;

  function gtr(version, range, loose) {
    return outside(version, range, '>', loose);
  }

  exports.outside = outside;

  function outside(version, range, hilo, loose) {
    version = new SemVer(version, loose);
    range = new Range(range, loose);
    var gtfn, ltefn, ltfn, comp, ecomp;

    switch (hilo) {
      case '>':
        gtfn = gt;
        ltefn = lte;
        ltfn = lt;
        comp = '>';
        ecomp = '>=';
        break;

      case '<':
        gtfn = lt;
        ltefn = gte;
        ltfn = gt;
        comp = '<';
        ecomp = '<=';
        break;

      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    } // If it satisifes the range it is not outside


    if (satisfies(version, range, loose)) {
      return false;
    } // From now on, variable terms are as if we're in "gtr" mode.
    // but note that everything is flipped for the "ltr" function.


    for (var i = 0; i < range.set.length; ++i) {
      var comparators = range.set[i];
      var high = null;
      var low = null;
      comparators.forEach(function (comparator) {
        if (comparator.semver === ANY) {
          comparator = new Comparator('>=0.0.0');
        }

        high = high || comparator;
        low = low || comparator;

        if (gtfn(comparator.semver, high.semver, loose)) {
          high = comparator;
        } else if (ltfn(comparator.semver, low.semver, loose)) {
          low = comparator;
        }
      }); // If the edge version comparator has a operator then our version
      // isn't outside it

      if (high.operator === comp || high.operator === ecomp) {
        return false;
      } // If the lowest version comparator has an operator and our version
      // is less than it then it isn't higher than the range


      if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
        return false;
      } else if (low.operator === ecomp && ltfn(version, low.semver)) {
        return false;
      }
    }

    return true;
  }

  exports.prerelease = prerelease;

  function prerelease(version, loose) {
    var parsed = parse(version, loose);
    return parsed && parsed.prerelease.length ? parsed.prerelease : null;
  }

  exports.intersects = intersects;

  function intersects(r1, r2, loose) {
    r1 = new Range(r1, loose);
    r2 = new Range(r2, loose);
    return r1.intersects(r2);
  }
});

var arrayify = function arrayify(object, keyName) {
  return Object.keys(object).reduce(function (array, key) {
    return array.concat(Object.assign(_defineProperty({}, keyName, key), object[key]));
  }, []);
};

var dedent_1 = createCommonjsModule(function (module) {
  "use strict";

  function dedent(strings) {
    var raw = void 0;

    if (typeof strings === "string") {
      // dedent can be used as a plain function
      raw = [strings];
    } else {
      raw = strings.raw;
    } // first, perform interpolation


    var result = "";

    for (var i = 0; i < raw.length; i++) {
      result += raw[i]. // join lines when there is a suppressed newline
      replace(/\\\n[ \t]*/g, ""). // handle escaped backticks
      replace(/\\`/g, "`");

      if (i < (arguments.length <= 1 ? 0 : arguments.length - 1)) {
        result += arguments.length <= i + 1 ? undefined : arguments[i + 1];
      }
    } // now strip indentation


    var lines = result.split("\n");
    var mindent = null;
    lines.forEach(function (l) {
      var m = l.match(/^(\s+)\S+/);

      if (m) {
        var indent = m[1].length;

        if (!mindent) {
          // this is the first indented line
          mindent = indent;
        } else {
          mindent = Math.min(mindent, indent);
        }
      }
    });

    if (mindent !== null) {
      result = lines.map(function (l) {
        return l[0] === " " ? l.slice(mindent) : l;
      }).join("\n");
    } // dedent eats leading and trailing whitespace too


    result = result.trim(); // handle escaped newlines at the end to ensure they don't get stripped too

    return result.replace(/\\n/g, "\n");
  }

  {
    module.exports = dedent;
  }
});

function _templateObject5() {
  var data = _taggedTemplateLiteral(["\n      Require either '@prettier' or '@format' to be present in the file's first docblock comment\n      in order for it to be formatted.\n    "]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = _taggedTemplateLiteral(["\n      Format code starting at a given character offset.\n      The range will extend backwards to the start of the first line containing the selected statement.\n      This option cannot be used with --cursor-offset.\n    "]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = _taggedTemplateLiteral(["\n      Format code ending at a given character offset (exclusive).\n      The range will extend forwards to the end of the selected statement.\n      This option cannot be used with --cursor-offset.\n    "]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = _taggedTemplateLiteral(["\n      Custom directory that contains prettier plugins in node_modules subdirectory.\n      Overrides default behavior when plugins are searched relatively to the location of Prettier.\n      Multiple values are accepted.\n    "]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n      Print (to stderr) where a cursor at the given position would move to after formatting.\n      This option cannot be used with --range-start and --range-end.\n    "]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var CATEGORY_CONFIG = "Config";
var CATEGORY_EDITOR = "Editor";
var CATEGORY_FORMAT = "Format";
var CATEGORY_OTHER = "Other";
var CATEGORY_OUTPUT = "Output";
var CATEGORY_GLOBAL = "Global";
var CATEGORY_SPECIAL = "Special";
/**
 * @typedef {Object} OptionInfo
 * @property {string} since - available since version
 * @property {string} category
 * @property {'int' | 'boolean' | 'choice' | 'path'} type
 * @property {boolean} array - indicate it's an array of the specified type
 * @property {boolean?} deprecated - deprecated since version
 * @property {OptionRedirectInfo?} redirect - redirect deprecated option
 * @property {string} description
 * @property {string?} oppositeDescription - for `false` option
 * @property {OptionValueInfo} default
 * @property {OptionRangeInfo?} range - for type int
 * @property {OptionChoiceInfo?} choices - for type choice
 * @property {(value: any) => boolean} exception
 *
 * @typedef {number | boolean | string} OptionValue
 * @typedef {OptionValue | [{ value: OptionValue[] }] | Array<{ since: string, value: OptionValue}>} OptionValueInfo
 *
 * @typedef {Object} OptionRedirectInfo
 * @property {string} option
 * @property {OptionValue} value
 *
 * @typedef {Object} OptionRangeInfo
 * @property {number} start - recommended range start
 * @property {number} end - recommended range end
 * @property {number} step - recommended range step
 *
 * @typedef {Object} OptionChoiceInfo
 * @property {boolean | string} value - boolean for the option that is originally boolean type
 * @property {string?} description - undefined if redirect
 * @property {string?} since - undefined if available since the first version of the option
 * @property {string?} deprecated - deprecated since version
 * @property {OptionValueInfo?} redirect - redirect deprecated value
 *
 * @property {string?} cliName
 * @property {string?} cliCategory
 * @property {string?} cliDescription
 */

/** @type {{ [name: string]: OptionInfo } */

var options$2 = {
  cursorOffset: {
    since: "1.4.0",
    category: CATEGORY_SPECIAL,
    type: "int",
    default: -1,
    range: {
      start: -1,
      end: Infinity,
      step: 1
    },
    description: dedent_1(_templateObject()),
    cliCategory: CATEGORY_EDITOR
  },
  filepath: {
    since: "1.4.0",
    category: CATEGORY_SPECIAL,
    type: "path",
    default: undefined,
    description: "Specify the input filepath. This will be used to do parser inference.",
    cliName: "stdin-filepath",
    cliCategory: CATEGORY_OTHER,
    cliDescription: "Path to the file to pretend that stdin comes from."
  },
  insertPragma: {
    since: "1.8.0",
    category: CATEGORY_SPECIAL,
    type: "boolean",
    default: false,
    description: "Insert @format pragma into file's first docblock comment.",
    cliCategory: CATEGORY_OTHER
  },
  parser: {
    since: "0.0.10",
    category: CATEGORY_GLOBAL,
    type: "choice",
    default: [{
      since: "0.0.10",
      value: "babylon"
    }, {
      since: "1.13.0",
      value: undefined
    }],
    description: "Which parser to use.",
    exception: function exception(value) {
      return typeof value === "string" || typeof value === "function";
    },
    choices: [{
      value: "flow",
      description: "Flow"
    }, {
      value: "babylon",
      description: "JavaScript"
    }, {
      value: "typescript",
      since: "1.4.0",
      description: "TypeScript"
    }, {
      value: "css",
      since: "1.7.1",
      description: "CSS"
    }, {
      value: "postcss",
      since: "1.4.0",
      description: "CSS/Less/SCSS",
      deprecated: "1.7.1",
      redirect: "css"
    }, {
      value: "less",
      since: "1.7.1",
      description: "Less"
    }, {
      value: "scss",
      since: "1.7.1",
      description: "SCSS"
    }, {
      value: "json",
      since: "1.5.0",
      description: "JSON"
    }, {
      value: "json5",
      since: "1.13.0",
      description: "JSON5"
    }, {
      value: "json-stringify",
      since: "1.13.0",
      description: "JSON.stringify"
    }, {
      value: "graphql",
      since: "1.5.0",
      description: "GraphQL"
    }, {
      value: "markdown",
      since: "1.8.0",
      description: "Markdown"
    }, {
      value: "vue",
      since: "1.10.0",
      description: "Vue"
    }, {
      value: "yaml",
      since: "1.14.0",
      description: "YAML"
    }, {
      value: "glimmer",
      since: null,
      description: "Handlebars"
    }]
  },
  plugins: {
    since: "1.10.0",
    type: "path",
    array: true,
    default: [{
      value: []
    }],
    category: CATEGORY_GLOBAL,
    description: "Add a plugin. Multiple plugins can be passed as separate `--plugin`s.",
    exception: function exception(value) {
      return typeof value === "string" || _typeof(value) === "object";
    },
    cliName: "plugin",
    cliCategory: CATEGORY_CONFIG
  },
  pluginSearchDirs: {
    since: "1.13.0",
    type: "path",
    array: true,
    default: [{
      value: []
    }],
    category: CATEGORY_GLOBAL,
    description: dedent_1(_templateObject2()),
    exception: function exception(value) {
      return typeof value === "string" || _typeof(value) === "object";
    },
    cliName: "plugin-search-dir",
    cliCategory: CATEGORY_CONFIG
  },
  printWidth: {
    since: "0.0.0",
    category: CATEGORY_GLOBAL,
    type: "int",
    default: 80,
    description: "The line length where Prettier will try wrap.",
    range: {
      start: 0,
      end: Infinity,
      step: 1
    }
  },
  rangeEnd: {
    since: "1.4.0",
    category: CATEGORY_SPECIAL,
    type: "int",
    default: Infinity,
    range: {
      start: 0,
      end: Infinity,
      step: 1
    },
    description: dedent_1(_templateObject3()),
    cliCategory: CATEGORY_EDITOR
  },
  rangeStart: {
    since: "1.4.0",
    category: CATEGORY_SPECIAL,
    type: "int",
    default: 0,
    range: {
      start: 0,
      end: Infinity,
      step: 1
    },
    description: dedent_1(_templateObject4()),
    cliCategory: CATEGORY_EDITOR
  },
  requirePragma: {
    since: "1.7.0",
    category: CATEGORY_SPECIAL,
    type: "boolean",
    default: false,
    description: dedent_1(_templateObject5()),
    cliCategory: CATEGORY_OTHER
  },
  tabWidth: {
    type: "int",
    category: CATEGORY_GLOBAL,
    default: 2,
    description: "Number of spaces per indentation level.",
    range: {
      start: 0,
      end: Infinity,
      step: 1
    }
  },
  useFlowParser: {
    since: "0.0.0",
    category: CATEGORY_GLOBAL,
    type: "boolean",
    default: false,
    deprecated: "0.0.10",
    description: "Use flow parser.",
    redirect: {
      option: "parser",
      value: "flow"
    },
    cliName: "flow-parser"
  },
  useTabs: {
    since: "1.0.0",
    category: CATEGORY_GLOBAL,
    type: "boolean",
    default: false,
    description: "Indent with tabs instead of spaces."
  }
};
var coreOptions$1 = {
  CATEGORY_CONFIG: CATEGORY_CONFIG,
  CATEGORY_EDITOR: CATEGORY_EDITOR,
  CATEGORY_FORMAT: CATEGORY_FORMAT,
  CATEGORY_OTHER: CATEGORY_OTHER,
  CATEGORY_OUTPUT: CATEGORY_OUTPUT,
  CATEGORY_GLOBAL: CATEGORY_GLOBAL,
  CATEGORY_SPECIAL: CATEGORY_SPECIAL,
  options: options$2
};

var require$$0 = ( _package$1 && _package ) || _package$1;

var currentVersion = require$$0.version;
var coreOptions = coreOptions$1.options;

function getSupportInfo$2(version, opts) {
  opts = Object.assign({
    plugins: [],
    showUnreleased: false,
    showDeprecated: false,
    showInternal: false
  }, opts);

  if (!version) {
    // pre-release version is smaller than the normal version in semver,
    // we need to treat it as the normal one so as to test new features.
    version = currentVersion.split("-", 1)[0];
  }

  var plugins = opts.plugins;
  var options = arrayify(Object.assign(plugins.reduce(function (currentOptions, plugin) {
    return Object.assign(currentOptions, plugin.options);
  }, {}), coreOptions), "name").sort(function (a, b) {
    return a.name === b.name ? 0 : a.name < b.name ? -1 : 1;
  }).filter(filterSince).filter(filterDeprecated).map(mapDeprecated).map(mapInternal).map(function (option) {
    var newOption = Object.assign({}, option);

    if (Array.isArray(newOption.default)) {
      newOption.default = newOption.default.length === 1 ? newOption.default[0].value : newOption.default.filter(filterSince).sort(function (info1, info2) {
        return semver.compare(info2.since, info1.since);
      })[0].value;
    }

    if (Array.isArray(newOption.choices)) {
      newOption.choices = newOption.choices.filter(filterSince).filter(filterDeprecated).map(mapDeprecated);
    }

    return newOption;
  }).map(function (option) {
    var filteredPlugins = plugins.filter(function (plugin) {
      return plugin.defaultOptions && plugin.defaultOptions[option.name];
    });
    var pluginDefaults = filteredPlugins.reduce(function (reduced, plugin) {
      reduced[plugin.name] = plugin.defaultOptions[option.name];
      return reduced;
    }, {});
    return Object.assign(option, {
      pluginDefaults: pluginDefaults
    });
  });
  var usePostCssParser = semver.lt(version, "1.7.1");
  var languages = plugins.reduce(function (all, plugin) {
    return all.concat(plugin.languages || []);
  }, []).filter(filterSince).map(function (language) {
    // Prevent breaking changes
    if (language.name === "Markdown") {
      return Object.assign({}, language, {
        parsers: ["markdown"]
      });
    }

    if (language.name === "TypeScript") {
      return Object.assign({}, language, {
        parsers: ["typescript"]
      });
    }

    if (usePostCssParser && (language.name === "CSS" || language.group === "CSS")) {
      return Object.assign({}, language, {
        parsers: ["postcss"]
      });
    }

    return language;
  });
  return {
    languages: languages,
    options: options
  };

  function filterSince(object) {
    return opts.showUnreleased || !("since" in object) || object.since && semver.gte(version, object.since);
  }

  function filterDeprecated(object) {
    return opts.showDeprecated || !("deprecated" in object) || object.deprecated && semver.lt(version, object.deprecated);
  }

  function mapDeprecated(object) {
    if (!object.deprecated || opts.showDeprecated) {
      return object;
    }

    var newObject = Object.assign({}, object);
    delete newObject.deprecated;
    delete newObject.redirect;
    return newObject;
  }

  function mapInternal(object) {
    if (opts.showInternal) {
      return object;
    }

    var newObject = Object.assign({}, object);
    delete newObject.cliName;
    delete newObject.cliCategory;
    delete newObject.cliDescription;
    return newObject;
  }
}

var support = {
  getSupportInfo: getSupportInfo$2
};

/* eslint-disable no-nested-ternary */
var arr = [];
var charCodeCache = [];

var leven = function leven(a, b) {
  if (a === b) {
    return 0;
  }

  var swap = a; // Swapping the strings if `a` is longer than `b` so we know which one is the
  // shortest & which one is the longest

  if (a.length > b.length) {
    a = b;
    b = swap;
  }

  var aLen = a.length;
  var bLen = b.length;

  if (aLen === 0) {
    return bLen;
  }

  if (bLen === 0) {
    return aLen;
  } // Performing suffix trimming:
  // We can linearly drop suffix common to both strings since they
  // don't increase distance at all
  // Note: `~-` is the bitwise way to perform a `- 1` operation


  while (aLen > 0 && a.charCodeAt(~-aLen) === b.charCodeAt(~-bLen)) {
    aLen--;
    bLen--;
  }

  if (aLen === 0) {
    return bLen;
  } // Performing prefix trimming
  // We can linearly drop prefix common to both strings since they
  // don't increase distance at all


  var start = 0;

  while (start < aLen && a.charCodeAt(start) === b.charCodeAt(start)) {
    start++;
  }

  aLen -= start;
  bLen -= start;

  if (aLen === 0) {
    return bLen;
  }

  var bCharCode;
  var ret;
  var tmp;
  var tmp2;
  var i = 0;
  var j = 0;

  while (i < aLen) {
    charCodeCache[start + i] = a.charCodeAt(start + i);
    arr[i] = ++i;
  }

  while (j < bLen) {
    bCharCode = b.charCodeAt(start + j);
    tmp = j++;
    ret = j;

    for (i = 0; i < aLen; i++) {
      tmp2 = bCharCode === charCodeCache[start + i] ? tmp : tmp + 1;
      tmp = arr[i];
      ret = arr[i] = tmp > ret ? tmp2 > ret ? ret + 1 : tmp2 : tmp2 > tmp ? tmp + 1 : tmp2;
    }
  }

  return ret;
};

function apiDescriptor(name, value) {
  return arguments.length === 1 ? JSON.stringify(name) : "`{ ".concat(apiDescriptor(name), ": ").concat(JSON.stringify(value), " }`");
}

function cliDescriptor(name, value) {
  return value === false ? "`--no-".concat(name, "`") : value === true || arguments.length === 1 ? "`--".concat(name, "`") : value === "" ? "`--".concat(name, "` without an argument") : "`--".concat(name, "=").concat(value, "`");
}

var optionsDescriptor = {
  apiDescriptor: apiDescriptor,
  cliDescriptor: cliDescriptor
};

function validateOption(value, optionInfo, opts) {
  opts = opts || {};
  var descriptor = opts.descriptor || optionsDescriptor.apiDescriptor;

  if (typeof optionInfo.exception === "function" && optionInfo.exception(value)) {
    return;
  }

  try {
    validateOptionType(value, optionInfo);
  } catch (error) {
    throw new Error("Invalid `".concat(descriptor(optionInfo.name), "` value. ").concat(error.message, ", but received `").concat(JSON.stringify(value), "`."));
  }
}

function validateOptionType(value, optionInfo) {
  if (optionInfo.array) {
    if (!Array.isArray(value)) {
      throw new Error("Expected an array");
    }

    value.forEach(function (v) {
      return validateOptionType(v, Object.assign({}, optionInfo, {
        array: false
      }));
    });
  } else {
    switch (optionInfo.type) {
      case "int":
        validateIntOption(value);
        break;

      case "boolean":
        validateBooleanOption(value);
        break;

      case "choice":
        validateChoiceOption(value, optionInfo.choices);
        break;
    }
  }
}

function validateBooleanOption(value) {
  if (typeof value !== "boolean") {
    throw new Error("Expected a boolean");
  }
}

function validateIntOption(value) {
  if (!(typeof value === "number" && Math.floor(value) === value && value >= 0 && value !== Infinity)) {
    throw new Error("Expected an integer");
  }
}

function validateChoiceOption(value, choiceInfos) {
  if (!choiceInfos.some(function (choiceInfo) {
    return choiceInfo.value === value;
  })) {
    var choices = choiceInfos.filter(function (choiceInfo) {
      return !choiceInfo.deprecated;
    }).map(function (choiceInfo) {
      return JSON.stringify(choiceInfo.value);
    }).sort();
    var head = choices.slice(0, -2);
    var tail = choices.slice(-2);
    throw new Error("Expected ".concat(head.concat(tail.join(" or ")).join(", ")));
  }
}

var optionsValidator = {
  validateOption: validateOption
};

function normalizeOptions$1(options, optionInfos, opts) {
  opts = opts || {};
  var logger = opts.logger === false ? {
    warn: function warn() {}
  } : opts.logger !== undefined ? opts.logger : console;
  var descriptor = opts.descriptor || optionsDescriptor.apiDescriptor;
  var passThrough = opts.passThrough || [];
  var optionInfoMap = optionInfos.reduce(function (reduced, optionInfo) {
    return Object.assign(reduced, _defineProperty({}, optionInfo.name, optionInfo));
  }, {});
  var normalizedOptions = Object.keys(options).reduce(function (newOptions, key) {
    var optionInfo = optionInfoMap[key];
    var optionName = key;
    var optionValue = options[key];

    if (!optionInfo) {
      if (passThrough === true || passThrough.indexOf(optionName) !== -1) {
        newOptions[optionName] = optionValue;
      } else {
        logger.warn(createUnknownOptionMessage(optionName, optionValue, optionInfos, descriptor));
      }

      return newOptions;
    }

    if (!optionInfo.deprecated) {
      optionValue = normalizeOption(optionValue, optionInfo);
    } else if (typeof optionInfo.redirect === "string") {
      logger.warn(createRedirectOptionMessage(optionInfo, descriptor));
      optionName = optionInfo.redirect;
    } else if (optionValue) {
      logger.warn(createRedirectOptionMessage(optionInfo, descriptor));
      optionValue = optionInfo.redirect.value;
      optionName = optionInfo.redirect.option;
    }

    if (optionInfo.choices) {
      var choiceInfo = optionInfo.choices.find(function (choice) {
        return choice.value === optionValue;
      });

      if (choiceInfo && choiceInfo.deprecated) {
        logger.warn(createRedirectChoiceMessage(optionInfo, choiceInfo, descriptor));
        optionValue = choiceInfo.redirect;
      }
    }

    if (optionInfo.array && !Array.isArray(optionValue)) {
      optionValue = [optionValue];
    }

    if (optionValue !== optionInfo.default) {
      optionsValidator.validateOption(optionValue, optionInfoMap[optionName], {
        descriptor: descriptor
      });
    }

    newOptions[optionName] = optionValue;
    return newOptions;
  }, {});
  return normalizedOptions;
}

function normalizeOption(option, optionInfo) {
  return optionInfo.type === "int" ? Number(option) : option;
}

function createUnknownOptionMessage(key, value, optionInfos, descriptor) {
  var messages = ["Ignored unknown option ".concat(descriptor(key, value), ".")];
  var suggestedOptionInfo = optionInfos.find(function (optionInfo) {
    return leven(optionInfo.name, key) < 3;
  });

  if (suggestedOptionInfo) {
    messages.push("Did you mean ".concat(JSON.stringify(suggestedOptionInfo.name), "?"));
  }

  return messages.join(" ");
}

function createRedirectOptionMessage(optionInfo, descriptor) {
  return "".concat(descriptor(optionInfo.name), " is deprecated. Prettier now treats it as ").concat(typeof optionInfo.redirect === "string" ? descriptor(optionInfo.redirect) : descriptor(optionInfo.redirect.option, optionInfo.redirect.value), ".");
}

function createRedirectChoiceMessage(optionInfo, choiceInfo, descriptor) {
  return "".concat(descriptor(optionInfo.name, choiceInfo.value), " is deprecated. Prettier now treats it as ").concat(descriptor(optionInfo.name, choiceInfo.redirect), ".");
}

function normalizeApiOptions(options, optionInfos, opts) {
  return normalizeOptions$1(options, optionInfos, Object.assign({
    descriptor: optionsDescriptor.apiDescriptor
  }, opts));
}

function normalizeCliOptions(options, optionInfos, opts) {
  var args = options["_"] || [];
  var newOptions = normalizeOptions$1(Object.keys(options).reduce(function (reduced, key) {
    return Object.assign(reduced, key.length === 1 // omit alias
    ? null : _defineProperty({}, key, options[key]));
  }, {}), optionInfos, Object.assign({
    descriptor: optionsDescriptor.cliDescriptor
  }, opts));
  newOptions["_"] = args;
  return newOptions;
}

var optionsNormalizer = {
  normalizeApiOptions: normalizeApiOptions,
  normalizeCliOptions: normalizeCliOptions
};

var _shim_path = {};

var _shim_path$1 = Object.freeze({
	default: _shim_path
});

var getLast = function getLast(arr) {
  return arr.length > 0 ? arr[arr.length - 1] : null;
};

function locStart$1(node) {
  // Handle nodes with decorators. They should start at the first decorator
  if (node.declaration && node.declaration.decorators && node.declaration.decorators.length > 0) {
    return locStart$1(node.declaration.decorators[0]);
  }

  if (node.decorators && node.decorators.length > 0) {
    return locStart$1(node.decorators[0]);
  }

  if (node.__location) {
    return node.__location.startOffset;
  }

  if (node.range) {
    return node.range[0];
  }

  if (typeof node.start === "number") {
    return node.start;
  }

  if (node.loc) {
    return node.loc.start;
  }

  return null;
}

function locEnd$1(node) {
  var endNode = node.nodes && getLast(node.nodes);

  if (endNode && node.source && !node.source.end) {
    node = endNode;
  }

  if (node.__location) {
    return node.__location.endOffset;
  }

  var loc = node.range ? node.range[1] : typeof node.end === "number" ? node.end : null;

  if (node.typeAnnotation) {
    return Math.max(loc, locEnd$1(node.typeAnnotation));
  }

  if (node.loc && !loc) {
    return node.loc.end;
  }

  return loc;
}

var loc = {
  locStart: locStart$1,
  locEnd: locEnd$1
};

var jsTokens = createCommonjsModule(function (module, exports) {
  // Copyright 2014, 2015, 2016, 2017 Simon Lydell
  // License: MIT. (See LICENSE.)
  Object.defineProperty(exports, "__esModule", {
    value: true
  }); // This regex comes from regex.coffee, and is inserted here by generate-index.js
  // (run `npm run build`).

  exports.default = /((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)|(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)|(\/(?!\*)(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\]\\]).|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiyu]{1,5}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))|(0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?)|((?!\d)(?:(?!\s)[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+)|(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-\/%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2})=?|[?~.,:;[\](){}])|(\s+)|(^$|[\s\S])/g;

  exports.matchToToken = function (match) {
    var token = {
      type: "invalid",
      value: match[0]
    };
    if (match[1]) token.type = "string", token.closed = !!(match[3] || match[4]);else if (match[5]) token.type = "comment";else if (match[6]) token.type = "comment", token.closed = !!match[7];else if (match[8]) token.type = "regex";else if (match[9]) token.type = "number";else if (match[10]) token.type = "name";else if (match[11]) token.type = "punctuator";else if (match[12]) token.type = "whitespace";
    return token;
  };
});
unwrapExports(jsTokens);

var ast = createCommonjsModule(function (module) {
  /*
    Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>
  
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
  
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS'
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */
  (function () {
    'use strict';

    function isExpression(node) {
      if (node == null) {
        return false;
      }

      switch (node.type) {
        case 'ArrayExpression':
        case 'AssignmentExpression':
        case 'BinaryExpression':
        case 'CallExpression':
        case 'ConditionalExpression':
        case 'FunctionExpression':
        case 'Identifier':
        case 'Literal':
        case 'LogicalExpression':
        case 'MemberExpression':
        case 'NewExpression':
        case 'ObjectExpression':
        case 'SequenceExpression':
        case 'ThisExpression':
        case 'UnaryExpression':
        case 'UpdateExpression':
          return true;
      }

      return false;
    }

    function isIterationStatement(node) {
      if (node == null) {
        return false;
      }

      switch (node.type) {
        case 'DoWhileStatement':
        case 'ForInStatement':
        case 'ForStatement':
        case 'WhileStatement':
          return true;
      }

      return false;
    }

    function isStatement(node) {
      if (node == null) {
        return false;
      }

      switch (node.type) {
        case 'BlockStatement':
        case 'BreakStatement':
        case 'ContinueStatement':
        case 'DebuggerStatement':
        case 'DoWhileStatement':
        case 'EmptyStatement':
        case 'ExpressionStatement':
        case 'ForInStatement':
        case 'ForStatement':
        case 'IfStatement':
        case 'LabeledStatement':
        case 'ReturnStatement':
        case 'SwitchStatement':
        case 'ThrowStatement':
        case 'TryStatement':
        case 'VariableDeclaration':
        case 'WhileStatement':
        case 'WithStatement':
          return true;
      }

      return false;
    }

    function isSourceElement(node) {
      return isStatement(node) || node != null && node.type === 'FunctionDeclaration';
    }

    function trailingStatement(node) {
      switch (node.type) {
        case 'IfStatement':
          if (node.alternate != null) {
            return node.alternate;
          }

          return node.consequent;

        case 'LabeledStatement':
        case 'ForStatement':
        case 'ForInStatement':
        case 'WhileStatement':
        case 'WithStatement':
          return node.body;
      }

      return null;
    }

    function isProblematicIfStatement(node) {
      var current;

      if (node.type !== 'IfStatement') {
        return false;
      }

      if (node.alternate == null) {
        return false;
      }

      current = node.consequent;

      do {
        if (current.type === 'IfStatement') {
          if (current.alternate == null) {
            return true;
          }
        }

        current = trailingStatement(current);
      } while (current);

      return false;
    }

    module.exports = {
      isExpression: isExpression,
      isStatement: isStatement,
      isIterationStatement: isIterationStatement,
      isSourceElement: isSourceElement,
      isProblematicIfStatement: isProblematicIfStatement,
      trailingStatement: trailingStatement
    };
  })();
  /* vim: set sw=4 ts=4 et tw=80 : */

});

var code = createCommonjsModule(function (module) {
  /*
    Copyright (C) 2013-2014 Yusuke Suzuki <utatane.tea@gmail.com>
    Copyright (C) 2014 Ivan Nikulin <ifaaan@gmail.com>
  
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
  
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */
  (function () {
    'use strict';

    var ES6Regex, ES5Regex, NON_ASCII_WHITESPACES, IDENTIFIER_START, IDENTIFIER_PART, ch; // See `tools/generate-identifier-regex.js`.

    ES5Regex = {
      // ECMAScript 5.1/Unicode v7.0.0 NonAsciiIdentifierStart:
      NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
      // ECMAScript 5.1/Unicode v7.0.0 NonAsciiIdentifierPart:
      NonAsciiIdentifierPart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/
    };
    ES6Regex = {
      // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierStart:
      NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDE00-\uDE11\uDE13-\uDE2B\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDE00-\uDE2F\uDE44\uDE80-\uDEAA]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/,
      // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierPart:
      NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDD0-\uDDDA\uDE00-\uDE11\uDE13-\uDE37\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF01-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
    };

    function isDecimalDigit(ch) {
      return 0x30 <= ch && ch <= 0x39; // 0..9
    }

    function isHexDigit(ch) {
      return 0x30 <= ch && ch <= 0x39 || // 0..9
      0x61 <= ch && ch <= 0x66 || // a..f
      0x41 <= ch && ch <= 0x46; // A..F
    }

    function isOctalDigit(ch) {
      return ch >= 0x30 && ch <= 0x37; // 0..7
    } // 7.2 White Space


    NON_ASCII_WHITESPACES = [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF];

    function isWhiteSpace(ch) {
      return ch === 0x20 || ch === 0x09 || ch === 0x0B || ch === 0x0C || ch === 0xA0 || ch >= 0x1680 && NON_ASCII_WHITESPACES.indexOf(ch) >= 0;
    } // 7.3 Line Terminators


    function isLineTerminator(ch) {
      return ch === 0x0A || ch === 0x0D || ch === 0x2028 || ch === 0x2029;
    } // 7.6 Identifier Names and Identifiers


    function fromCodePoint(cp) {
      if (cp <= 0xFFFF) {
        return String.fromCharCode(cp);
      }

      var cu1 = String.fromCharCode(Math.floor((cp - 0x10000) / 0x400) + 0xD800);
      var cu2 = String.fromCharCode((cp - 0x10000) % 0x400 + 0xDC00);
      return cu1 + cu2;
    }

    IDENTIFIER_START = new Array(0x80);

    for (ch = 0; ch < 0x80; ++ch) {
      IDENTIFIER_START[ch] = ch >= 0x61 && ch <= 0x7A || // a..z
      ch >= 0x41 && ch <= 0x5A || // A..Z
      ch === 0x24 || ch === 0x5F; // $ (dollar) and _ (underscore)
    }

    IDENTIFIER_PART = new Array(0x80);

    for (ch = 0; ch < 0x80; ++ch) {
      IDENTIFIER_PART[ch] = ch >= 0x61 && ch <= 0x7A || // a..z
      ch >= 0x41 && ch <= 0x5A || // A..Z
      ch >= 0x30 && ch <= 0x39 || // 0..9
      ch === 0x24 || ch === 0x5F; // $ (dollar) and _ (underscore)
    }

    function isIdentifierStartES5(ch) {
      return ch < 0x80 ? IDENTIFIER_START[ch] : ES5Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
    }

    function isIdentifierPartES5(ch) {
      return ch < 0x80 ? IDENTIFIER_PART[ch] : ES5Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
    }

    function isIdentifierStartES6(ch) {
      return ch < 0x80 ? IDENTIFIER_START[ch] : ES6Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
    }

    function isIdentifierPartES6(ch) {
      return ch < 0x80 ? IDENTIFIER_PART[ch] : ES6Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
    }

    module.exports = {
      isDecimalDigit: isDecimalDigit,
      isHexDigit: isHexDigit,
      isOctalDigit: isOctalDigit,
      isWhiteSpace: isWhiteSpace,
      isLineTerminator: isLineTerminator,
      isIdentifierStartES5: isIdentifierStartES5,
      isIdentifierPartES5: isIdentifierPartES5,
      isIdentifierStartES6: isIdentifierStartES6,
      isIdentifierPartES6: isIdentifierPartES6
    };
  })();
  /* vim: set sw=4 ts=4 et tw=80 : */

});

var keyword = createCommonjsModule(function (module) {
  /*
    Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>
  
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
  
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */
  (function () {
    'use strict';

    var code$$1 = code;

    function isStrictModeReservedWordES6(id) {
      switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'let':
          return true;

        default:
          return false;
      }
    }

    function isKeywordES5(id, strict) {
      // yield should not be treated as keyword under non-strict mode.
      if (!strict && id === 'yield') {
        return false;
      }

      return isKeywordES6(id, strict);
    }

    function isKeywordES6(id, strict) {
      if (strict && isStrictModeReservedWordES6(id)) {
        return true;
      }

      switch (id.length) {
        case 2:
          return id === 'if' || id === 'in' || id === 'do';

        case 3:
          return id === 'var' || id === 'for' || id === 'new' || id === 'try';

        case 4:
          return id === 'this' || id === 'else' || id === 'case' || id === 'void' || id === 'with' || id === 'enum';

        case 5:
          return id === 'while' || id === 'break' || id === 'catch' || id === 'throw' || id === 'const' || id === 'yield' || id === 'class' || id === 'super';

        case 6:
          return id === 'return' || id === 'typeof' || id === 'delete' || id === 'switch' || id === 'export' || id === 'import';

        case 7:
          return id === 'default' || id === 'finally' || id === 'extends';

        case 8:
          return id === 'function' || id === 'continue' || id === 'debugger';

        case 10:
          return id === 'instanceof';

        default:
          return false;
      }
    }

    function isReservedWordES5(id, strict) {
      return id === 'null' || id === 'true' || id === 'false' || isKeywordES5(id, strict);
    }

    function isReservedWordES6(id, strict) {
      return id === 'null' || id === 'true' || id === 'false' || isKeywordES6(id, strict);
    }

    function isRestrictedWord(id) {
      return id === 'eval' || id === 'arguments';
    }

    function isIdentifierNameES5(id) {
      var i, iz, ch;

      if (id.length === 0) {
        return false;
      }

      ch = id.charCodeAt(0);

      if (!code$$1.isIdentifierStartES5(ch)) {
        return false;
      }

      for (i = 1, iz = id.length; i < iz; ++i) {
        ch = id.charCodeAt(i);

        if (!code$$1.isIdentifierPartES5(ch)) {
          return false;
        }
      }

      return true;
    }

    function decodeUtf16(lead, trail) {
      return (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
    }

    function isIdentifierNameES6(id) {
      var i, iz, ch, lowCh, check;

      if (id.length === 0) {
        return false;
      }

      check = code$$1.isIdentifierStartES6;

      for (i = 0, iz = id.length; i < iz; ++i) {
        ch = id.charCodeAt(i);

        if (0xD800 <= ch && ch <= 0xDBFF) {
          ++i;

          if (i >= iz) {
            return false;
          }

          lowCh = id.charCodeAt(i);

          if (!(0xDC00 <= lowCh && lowCh <= 0xDFFF)) {
            return false;
          }

          ch = decodeUtf16(ch, lowCh);
        }

        if (!check(ch)) {
          return false;
        }

        check = code$$1.isIdentifierPartES6;
      }

      return true;
    }

    function isIdentifierES5(id, strict) {
      return isIdentifierNameES5(id) && !isReservedWordES5(id, strict);
    }

    function isIdentifierES6(id, strict) {
      return isIdentifierNameES6(id) && !isReservedWordES6(id, strict);
    }

    module.exports = {
      isKeywordES5: isKeywordES5,
      isKeywordES6: isKeywordES6,
      isReservedWordES5: isReservedWordES5,
      isReservedWordES6: isReservedWordES6,
      isRestrictedWord: isRestrictedWord,
      isIdentifierNameES5: isIdentifierNameES5,
      isIdentifierNameES6: isIdentifierNameES6,
      isIdentifierES5: isIdentifierES5,
      isIdentifierES6: isIdentifierES6
    };
  })();
  /* vim: set sw=4 ts=4 et tw=80 : */

});

var utils = createCommonjsModule(function (module, exports) {
  /*
    Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>
  
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
  
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */
  (function () {
    'use strict';

    exports.ast = ast;
    exports.code = code;
    exports.keyword = keyword;
  })();
  /* vim: set sw=4 ts=4 et tw=80 : */

});

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

var escapeStringRegexp = function escapeStringRegexp(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  return str.replace(matchOperatorsRe, '\\$&');
};

var colorName = {
  "aliceblue": [240, 248, 255],
  "antiquewhite": [250, 235, 215],
  "aqua": [0, 255, 255],
  "aquamarine": [127, 255, 212],
  "azure": [240, 255, 255],
  "beige": [245, 245, 220],
  "bisque": [255, 228, 196],
  "black": [0, 0, 0],
  "blanchedalmond": [255, 235, 205],
  "blue": [0, 0, 255],
  "blueviolet": [138, 43, 226],
  "brown": [165, 42, 42],
  "burlywood": [222, 184, 135],
  "cadetblue": [95, 158, 160],
  "chartreuse": [127, 255, 0],
  "chocolate": [210, 105, 30],
  "coral": [255, 127, 80],
  "cornflowerblue": [100, 149, 237],
  "cornsilk": [255, 248, 220],
  "crimson": [220, 20, 60],
  "cyan": [0, 255, 255],
  "darkblue": [0, 0, 139],
  "darkcyan": [0, 139, 139],
  "darkgoldenrod": [184, 134, 11],
  "darkgray": [169, 169, 169],
  "darkgreen": [0, 100, 0],
  "darkgrey": [169, 169, 169],
  "darkkhaki": [189, 183, 107],
  "darkmagenta": [139, 0, 139],
  "darkolivegreen": [85, 107, 47],
  "darkorange": [255, 140, 0],
  "darkorchid": [153, 50, 204],
  "darkred": [139, 0, 0],
  "darksalmon": [233, 150, 122],
  "darkseagreen": [143, 188, 143],
  "darkslateblue": [72, 61, 139],
  "darkslategray": [47, 79, 79],
  "darkslategrey": [47, 79, 79],
  "darkturquoise": [0, 206, 209],
  "darkviolet": [148, 0, 211],
  "deeppink": [255, 20, 147],
  "deepskyblue": [0, 191, 255],
  "dimgray": [105, 105, 105],
  "dimgrey": [105, 105, 105],
  "dodgerblue": [30, 144, 255],
  "firebrick": [178, 34, 34],
  "floralwhite": [255, 250, 240],
  "forestgreen": [34, 139, 34],
  "fuchsia": [255, 0, 255],
  "gainsboro": [220, 220, 220],
  "ghostwhite": [248, 248, 255],
  "gold": [255, 215, 0],
  "goldenrod": [218, 165, 32],
  "gray": [128, 128, 128],
  "green": [0, 128, 0],
  "greenyellow": [173, 255, 47],
  "grey": [128, 128, 128],
  "honeydew": [240, 255, 240],
  "hotpink": [255, 105, 180],
  "indianred": [205, 92, 92],
  "indigo": [75, 0, 130],
  "ivory": [255, 255, 240],
  "khaki": [240, 230, 140],
  "lavender": [230, 230, 250],
  "lavenderblush": [255, 240, 245],
  "lawngreen": [124, 252, 0],
  "lemonchiffon": [255, 250, 205],
  "lightblue": [173, 216, 230],
  "lightcoral": [240, 128, 128],
  "lightcyan": [224, 255, 255],
  "lightgoldenrodyellow": [250, 250, 210],
  "lightgray": [211, 211, 211],
  "lightgreen": [144, 238, 144],
  "lightgrey": [211, 211, 211],
  "lightpink": [255, 182, 193],
  "lightsalmon": [255, 160, 122],
  "lightseagreen": [32, 178, 170],
  "lightskyblue": [135, 206, 250],
  "lightslategray": [119, 136, 153],
  "lightslategrey": [119, 136, 153],
  "lightsteelblue": [176, 196, 222],
  "lightyellow": [255, 255, 224],
  "lime": [0, 255, 0],
  "limegreen": [50, 205, 50],
  "linen": [250, 240, 230],
  "magenta": [255, 0, 255],
  "maroon": [128, 0, 0],
  "mediumaquamarine": [102, 205, 170],
  "mediumblue": [0, 0, 205],
  "mediumorchid": [186, 85, 211],
  "mediumpurple": [147, 112, 219],
  "mediumseagreen": [60, 179, 113],
  "mediumslateblue": [123, 104, 238],
  "mediumspringgreen": [0, 250, 154],
  "mediumturquoise": [72, 209, 204],
  "mediumvioletred": [199, 21, 133],
  "midnightblue": [25, 25, 112],
  "mintcream": [245, 255, 250],
  "mistyrose": [255, 228, 225],
  "moccasin": [255, 228, 181],
  "navajowhite": [255, 222, 173],
  "navy": [0, 0, 128],
  "oldlace": [253, 245, 230],
  "olive": [128, 128, 0],
  "olivedrab": [107, 142, 35],
  "orange": [255, 165, 0],
  "orangered": [255, 69, 0],
  "orchid": [218, 112, 214],
  "palegoldenrod": [238, 232, 170],
  "palegreen": [152, 251, 152],
  "paleturquoise": [175, 238, 238],
  "palevioletred": [219, 112, 147],
  "papayawhip": [255, 239, 213],
  "peachpuff": [255, 218, 185],
  "peru": [205, 133, 63],
  "pink": [255, 192, 203],
  "plum": [221, 160, 221],
  "powderblue": [176, 224, 230],
  "purple": [128, 0, 128],
  "rebeccapurple": [102, 51, 153],
  "red": [255, 0, 0],
  "rosybrown": [188, 143, 143],
  "royalblue": [65, 105, 225],
  "saddlebrown": [139, 69, 19],
  "salmon": [250, 128, 114],
  "sandybrown": [244, 164, 96],
  "seagreen": [46, 139, 87],
  "seashell": [255, 245, 238],
  "sienna": [160, 82, 45],
  "silver": [192, 192, 192],
  "skyblue": [135, 206, 235],
  "slateblue": [106, 90, 205],
  "slategray": [112, 128, 144],
  "slategrey": [112, 128, 144],
  "snow": [255, 250, 250],
  "springgreen": [0, 255, 127],
  "steelblue": [70, 130, 180],
  "tan": [210, 180, 140],
  "teal": [0, 128, 128],
  "thistle": [216, 191, 216],
  "tomato": [255, 99, 71],
  "turquoise": [64, 224, 208],
  "violet": [238, 130, 238],
  "wheat": [245, 222, 179],
  "white": [255, 255, 255],
  "whitesmoke": [245, 245, 245],
  "yellow": [255, 255, 0],
  "yellowgreen": [154, 205, 50]
};

var conversions = createCommonjsModule(function (module) {
  /* MIT license */
  // NOTE: conversions should only return primitive values (i.e. arrays, or
  //       values that give correct `typeof` results).
  //       do not use box values types (i.e. Number(), String(), etc.)
  var reverseKeywords = {};

  for (var key in colorName) {
    if (colorName.hasOwnProperty(key)) {
      reverseKeywords[colorName[key]] = key;
    }
  }

  var convert = module.exports = {
    rgb: {
      channels: 3,
      labels: 'rgb'
    },
    hsl: {
      channels: 3,
      labels: 'hsl'
    },
    hsv: {
      channels: 3,
      labels: 'hsv'
    },
    hwb: {
      channels: 3,
      labels: 'hwb'
    },
    cmyk: {
      channels: 4,
      labels: 'cmyk'
    },
    xyz: {
      channels: 3,
      labels: 'xyz'
    },
    lab: {
      channels: 3,
      labels: 'lab'
    },
    lch: {
      channels: 3,
      labels: 'lch'
    },
    hex: {
      channels: 1,
      labels: ['hex']
    },
    keyword: {
      channels: 1,
      labels: ['keyword']
    },
    ansi16: {
      channels: 1,
      labels: ['ansi16']
    },
    ansi256: {
      channels: 1,
      labels: ['ansi256']
    },
    hcg: {
      channels: 3,
      labels: ['h', 'c', 'g']
    },
    apple: {
      channels: 3,
      labels: ['r16', 'g16', 'b16']
    },
    gray: {
      channels: 1,
      labels: ['gray']
    }
  }; // hide .channels and .labels properties

  for (var model in convert) {
    if (convert.hasOwnProperty(model)) {
      if (!('channels' in convert[model])) {
        throw new Error('missing channels property: ' + model);
      }

      if (!('labels' in convert[model])) {
        throw new Error('missing channel labels property: ' + model);
      }

      if (convert[model].labels.length !== convert[model].channels) {
        throw new Error('channel and label counts mismatch: ' + model);
      }

      var channels = convert[model].channels;
      var labels = convert[model].labels;
      delete convert[model].channels;
      delete convert[model].labels;
      Object.defineProperty(convert[model], 'channels', {
        value: channels
      });
      Object.defineProperty(convert[model], 'labels', {
        value: labels
      });
    }
  }

  convert.rgb.hsl = function (rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h;
    var s;
    var l;

    if (max === min) {
      h = 0;
    } else if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else if (b === max) {
      h = 4 + (r - g) / delta;
    }

    h = Math.min(h * 60, 360);

    if (h < 0) {
      h += 360;
    }

    l = (min + max) / 2;

    if (max === min) {
      s = 0;
    } else if (l <= 0.5) {
      s = delta / (max + min);
    } else {
      s = delta / (2 - max - min);
    }

    return [h, s * 100, l * 100];
  };

  convert.rgb.hsv = function (rgb) {
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h;
    var s;
    var v;

    if (max === 0) {
      s = 0;
    } else {
      s = delta / max * 1000 / 10;
    }

    if (max === min) {
      h = 0;
    } else if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else if (b === max) {
      h = 4 + (r - g) / delta;
    }

    h = Math.min(h * 60, 360);

    if (h < 0) {
      h += 360;
    }

    v = max / 255 * 1000 / 10;
    return [h, s, v];
  };

  convert.rgb.hwb = function (rgb) {
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];
    var h = convert.rgb.hsl(rgb)[0];
    var w = 1 / 255 * Math.min(r, Math.min(g, b));
    b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
    return [h, w * 100, b * 100];
  };

  convert.rgb.cmyk = function (rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var c;
    var m;
    var y;
    var k;
    k = Math.min(1 - r, 1 - g, 1 - b);
    c = (1 - r - k) / (1 - k) || 0;
    m = (1 - g - k) / (1 - k) || 0;
    y = (1 - b - k) / (1 - k) || 0;
    return [c * 100, m * 100, y * 100, k * 100];
  };
  /**
   * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
   * */


  function comparativeDistance(x, y) {
    return Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2);
  }

  convert.rgb.keyword = function (rgb) {
    var reversed = reverseKeywords[rgb];

    if (reversed) {
      return reversed;
    }

    var currentClosestDistance = Infinity;
    var currentClosestKeyword;

    for (var keyword in colorName) {
      if (colorName.hasOwnProperty(keyword)) {
        var value = colorName[keyword]; // Compute comparative distance

        var distance = comparativeDistance(rgb, value); // Check if its less, if so set as closest

        if (distance < currentClosestDistance) {
          currentClosestDistance = distance;
          currentClosestKeyword = keyword;
        }
      }
    }

    return currentClosestKeyword;
  };

  convert.keyword.rgb = function (keyword) {
    return colorName[keyword];
  };

  convert.rgb.xyz = function (rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255; // assume sRGB

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    var x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    var z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    return [x * 100, y * 100, z * 100];
  };

  convert.rgb.lab = function (rgb) {
    var xyz = convert.rgb.xyz(rgb);
    var x = xyz[0];
    var y = xyz[1];
    var z = xyz[2];
    var l;
    var a;
    var b;
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
    l = 116 * y - 16;
    a = 500 * (x - y);
    b = 200 * (y - z);
    return [l, a, b];
  };

  convert.hsl.rgb = function (hsl) {
    var h = hsl[0] / 360;
    var s = hsl[1] / 100;
    var l = hsl[2] / 100;
    var t1;
    var t2;
    var t3;
    var rgb;
    var val;

    if (s === 0) {
      val = l * 255;
      return [val, val, val];
    }

    if (l < 0.5) {
      t2 = l * (1 + s);
    } else {
      t2 = l + s - l * s;
    }

    t1 = 2 * l - t2;
    rgb = [0, 0, 0];

    for (var i = 0; i < 3; i++) {
      t3 = h + 1 / 3 * -(i - 1);

      if (t3 < 0) {
        t3++;
      }

      if (t3 > 1) {
        t3--;
      }

      if (6 * t3 < 1) {
        val = t1 + (t2 - t1) * 6 * t3;
      } else if (2 * t3 < 1) {
        val = t2;
      } else if (3 * t3 < 2) {
        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
      } else {
        val = t1;
      }

      rgb[i] = val * 255;
    }

    return rgb;
  };

  convert.hsl.hsv = function (hsl) {
    var h = hsl[0];
    var s = hsl[1] / 100;
    var l = hsl[2] / 100;
    var smin = s;
    var lmin = Math.max(l, 0.01);
    var sv;
    var v;
    l *= 2;
    s *= l <= 1 ? l : 2 - l;
    smin *= lmin <= 1 ? lmin : 2 - lmin;
    v = (l + s) / 2;
    sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
    return [h, sv * 100, v * 100];
  };

  convert.hsv.rgb = function (hsv) {
    var h = hsv[0] / 60;
    var s = hsv[1] / 100;
    var v = hsv[2] / 100;
    var hi = Math.floor(h) % 6;
    var f = h - Math.floor(h);
    var p = 255 * v * (1 - s);
    var q = 255 * v * (1 - s * f);
    var t = 255 * v * (1 - s * (1 - f));
    v *= 255;

    switch (hi) {
      case 0:
        return [v, t, p];

      case 1:
        return [q, v, p];

      case 2:
        return [p, v, t];

      case 3:
        return [p, q, v];

      case 4:
        return [t, p, v];

      case 5:
        return [v, p, q];
    }
  };

  convert.hsv.hsl = function (hsv) {
    var h = hsv[0];
    var s = hsv[1] / 100;
    var v = hsv[2] / 100;
    var vmin = Math.max(v, 0.01);
    var lmin;
    var sl;
    var l;
    l = (2 - s) * v;
    lmin = (2 - s) * vmin;
    sl = s * vmin;
    sl /= lmin <= 1 ? lmin : 2 - lmin;
    sl = sl || 0;
    l /= 2;
    return [h, sl * 100, l * 100];
  }; // http://dev.w3.org/csswg/css-color/#hwb-to-rgb


  convert.hwb.rgb = function (hwb) {
    var h = hwb[0] / 360;
    var wh = hwb[1] / 100;
    var bl = hwb[2] / 100;
    var ratio = wh + bl;
    var i;
    var v;
    var f;
    var n; // wh + bl cant be > 1

    if (ratio > 1) {
      wh /= ratio;
      bl /= ratio;
    }

    i = Math.floor(6 * h);
    v = 1 - bl;
    f = 6 * h - i;

    if ((i & 0x01) !== 0) {
      f = 1 - f;
    }

    n = wh + f * (v - wh); // linear interpolation

    var r;
    var g;
    var b;

    switch (i) {
      default:
      case 6:
      case 0:
        r = v;
        g = n;
        b = wh;
        break;

      case 1:
        r = n;
        g = v;
        b = wh;
        break;

      case 2:
        r = wh;
        g = v;
        b = n;
        break;

      case 3:
        r = wh;
        g = n;
        b = v;
        break;

      case 4:
        r = n;
        g = wh;
        b = v;
        break;

      case 5:
        r = v;
        g = wh;
        b = n;
        break;
    }

    return [r * 255, g * 255, b * 255];
  };

  convert.cmyk.rgb = function (cmyk) {
    var c = cmyk[0] / 100;
    var m = cmyk[1] / 100;
    var y = cmyk[2] / 100;
    var k = cmyk[3] / 100;
    var r;
    var g;
    var b;
    r = 1 - Math.min(1, c * (1 - k) + k);
    g = 1 - Math.min(1, m * (1 - k) + k);
    b = 1 - Math.min(1, y * (1 - k) + k);
    return [r * 255, g * 255, b * 255];
  };

  convert.xyz.rgb = function (xyz) {
    var x = xyz[0] / 100;
    var y = xyz[1] / 100;
    var z = xyz[2] / 100;
    var r;
    var g;
    var b;
    r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    b = x * 0.0557 + y * -0.2040 + z * 1.0570; // assume sRGB

    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1.0 / 2.4) - 0.055 : r * 12.92;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1.0 / 2.4) - 0.055 : g * 12.92;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1.0 / 2.4) - 0.055 : b * 12.92;
    r = Math.min(Math.max(0, r), 1);
    g = Math.min(Math.max(0, g), 1);
    b = Math.min(Math.max(0, b), 1);
    return [r * 255, g * 255, b * 255];
  };

  convert.xyz.lab = function (xyz) {
    var x = xyz[0];
    var y = xyz[1];
    var z = xyz[2];
    var l;
    var a;
    var b;
    x /= 95.047;
    y /= 100;
    z /= 108.883;
    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
    l = 116 * y - 16;
    a = 500 * (x - y);
    b = 200 * (y - z);
    return [l, a, b];
  };

  convert.lab.xyz = function (lab) {
    var l = lab[0];
    var a = lab[1];
    var b = lab[2];
    var x;
    var y;
    var z;
    y = (l + 16) / 116;
    x = a / 500 + y;
    z = y - b / 200;
    var y2 = Math.pow(y, 3);
    var x2 = Math.pow(x, 3);
    var z2 = Math.pow(z, 3);
    y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
    x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
    z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;
    x *= 95.047;
    y *= 100;
    z *= 108.883;
    return [x, y, z];
  };

  convert.lab.lch = function (lab) {
    var l = lab[0];
    var a = lab[1];
    var b = lab[2];
    var hr;
    var h;
    var c;
    hr = Math.atan2(b, a);
    h = hr * 360 / 2 / Math.PI;

    if (h < 0) {
      h += 360;
    }

    c = Math.sqrt(a * a + b * b);
    return [l, c, h];
  };

  convert.lch.lab = function (lch) {
    var l = lch[0];
    var c = lch[1];
    var h = lch[2];
    var a;
    var b;
    var hr;
    hr = h / 360 * 2 * Math.PI;
    a = c * Math.cos(hr);
    b = c * Math.sin(hr);
    return [l, a, b];
  };

  convert.rgb.ansi16 = function (args) {
    var r = args[0];
    var g = args[1];
    var b = args[2];
    var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

    value = Math.round(value / 50);

    if (value === 0) {
      return 30;
    }

    var ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));

    if (value === 2) {
      ansi += 60;
    }

    return ansi;
  };

  convert.hsv.ansi16 = function (args) {
    // optimization here; we already know the value and don't need to get
    // it converted for us.
    return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
  };

  convert.rgb.ansi256 = function (args) {
    var r = args[0];
    var g = args[1];
    var b = args[2]; // we use the extended greyscale palette here, with the exception of
    // black and white. normal palette only has 4 greyscale shades.

    if (r === g && g === b) {
      if (r < 8) {
        return 16;
      }

      if (r > 248) {
        return 231;
      }

      return Math.round((r - 8) / 247 * 24) + 232;
    }

    var ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
    return ansi;
  };

  convert.ansi16.rgb = function (args) {
    var color = args % 10; // handle greyscale

    if (color === 0 || color === 7) {
      if (args > 50) {
        color += 3.5;
      }

      color = color / 10.5 * 255;
      return [color, color, color];
    }

    var mult = (~~(args > 50) + 1) * 0.5;
    var r = (color & 1) * mult * 255;
    var g = (color >> 1 & 1) * mult * 255;
    var b = (color >> 2 & 1) * mult * 255;
    return [r, g, b];
  };

  convert.ansi256.rgb = function (args) {
    // handle greyscale
    if (args >= 232) {
      var c = (args - 232) * 10 + 8;
      return [c, c, c];
    }

    args -= 16;
    var rem;
    var r = Math.floor(args / 36) / 5 * 255;
    var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
    var b = rem % 6 / 5 * 255;
    return [r, g, b];
  };

  convert.rgb.hex = function (args) {
    var integer = ((Math.round(args[0]) & 0xFF) << 16) + ((Math.round(args[1]) & 0xFF) << 8) + (Math.round(args[2]) & 0xFF);
    var string = integer.toString(16).toUpperCase();
    return '000000'.substring(string.length) + string;
  };

  convert.hex.rgb = function (args) {
    var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);

    if (!match) {
      return [0, 0, 0];
    }

    var colorString = match[0];

    if (match[0].length === 3) {
      colorString = colorString.split('').map(function (char) {
        return char + char;
      }).join('');
    }

    var integer = parseInt(colorString, 16);
    var r = integer >> 16 & 0xFF;
    var g = integer >> 8 & 0xFF;
    var b = integer & 0xFF;
    return [r, g, b];
  };

  convert.rgb.hcg = function (rgb) {
    var r = rgb[0] / 255;
    var g = rgb[1] / 255;
    var b = rgb[2] / 255;
    var max = Math.max(Math.max(r, g), b);
    var min = Math.min(Math.min(r, g), b);
    var chroma = max - min;
    var grayscale;
    var hue;

    if (chroma < 1) {
      grayscale = min / (1 - chroma);
    } else {
      grayscale = 0;
    }

    if (chroma <= 0) {
      hue = 0;
    } else if (max === r) {
      hue = (g - b) / chroma % 6;
    } else if (max === g) {
      hue = 2 + (b - r) / chroma;
    } else {
      hue = 4 + (r - g) / chroma + 4;
    }

    hue /= 6;
    hue %= 1;
    return [hue * 360, chroma * 100, grayscale * 100];
  };

  convert.hsl.hcg = function (hsl) {
    var s = hsl[1] / 100;
    var l = hsl[2] / 100;
    var c = 1;
    var f = 0;

    if (l < 0.5) {
      c = 2.0 * s * l;
    } else {
      c = 2.0 * s * (1.0 - l);
    }

    if (c < 1.0) {
      f = (l - 0.5 * c) / (1.0 - c);
    }

    return [hsl[0], c * 100, f * 100];
  };

  convert.hsv.hcg = function (hsv) {
    var s = hsv[1] / 100;
    var v = hsv[2] / 100;
    var c = s * v;
    var f = 0;

    if (c < 1.0) {
      f = (v - c) / (1 - c);
    }

    return [hsv[0], c * 100, f * 100];
  };

  convert.hcg.rgb = function (hcg) {
    var h = hcg[0] / 360;
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;

    if (c === 0.0) {
      return [g * 255, g * 255, g * 255];
    }

    var pure = [0, 0, 0];
    var hi = h % 1 * 6;
    var v = hi % 1;
    var w = 1 - v;
    var mg = 0;

    switch (Math.floor(hi)) {
      case 0:
        pure[0] = 1;
        pure[1] = v;
        pure[2] = 0;
        break;

      case 1:
        pure[0] = w;
        pure[1] = 1;
        pure[2] = 0;
        break;

      case 2:
        pure[0] = 0;
        pure[1] = 1;
        pure[2] = v;
        break;

      case 3:
        pure[0] = 0;
        pure[1] = w;
        pure[2] = 1;
        break;

      case 4:
        pure[0] = v;
        pure[1] = 0;
        pure[2] = 1;
        break;

      default:
        pure[0] = 1;
        pure[1] = 0;
        pure[2] = w;
    }

    mg = (1.0 - c) * g;
    return [(c * pure[0] + mg) * 255, (c * pure[1] + mg) * 255, (c * pure[2] + mg) * 255];
  };

  convert.hcg.hsv = function (hcg) {
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;
    var v = c + g * (1.0 - c);
    var f = 0;

    if (v > 0.0) {
      f = c / v;
    }

    return [hcg[0], f * 100, v * 100];
  };

  convert.hcg.hsl = function (hcg) {
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;
    var l = g * (1.0 - c) + 0.5 * c;
    var s = 0;

    if (l > 0.0 && l < 0.5) {
      s = c / (2 * l);
    } else if (l >= 0.5 && l < 1.0) {
      s = c / (2 * (1 - l));
    }

    return [hcg[0], s * 100, l * 100];
  };

  convert.hcg.hwb = function (hcg) {
    var c = hcg[1] / 100;
    var g = hcg[2] / 100;
    var v = c + g * (1.0 - c);
    return [hcg[0], (v - c) * 100, (1 - v) * 100];
  };

  convert.hwb.hcg = function (hwb) {
    var w = hwb[1] / 100;
    var b = hwb[2] / 100;
    var v = 1 - b;
    var c = v - w;
    var g = 0;

    if (c < 1) {
      g = (v - c) / (1 - c);
    }

    return [hwb[0], c * 100, g * 100];
  };

  convert.apple.rgb = function (apple) {
    return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
  };

  convert.rgb.apple = function (rgb) {
    return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
  };

  convert.gray.rgb = function (args) {
    return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
  };

  convert.gray.hsl = convert.gray.hsv = function (args) {
    return [0, 0, args[0]];
  };

  convert.gray.hwb = function (gray) {
    return [0, 100, gray[0]];
  };

  convert.gray.cmyk = function (gray) {
    return [0, 0, 0, gray[0]];
  };

  convert.gray.lab = function (gray) {
    return [gray[0], 0, 0];
  };

  convert.gray.hex = function (gray) {
    var val = Math.round(gray[0] / 100 * 255) & 0xFF;
    var integer = (val << 16) + (val << 8) + val;
    var string = integer.toString(16).toUpperCase();
    return '000000'.substring(string.length) + string;
  };

  convert.rgb.gray = function (rgb) {
    var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
    return [val / 255 * 100];
  };
});

/*
	this function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/
// https://jsperf.com/object-keys-vs-for-in-with-closure/3

var models$1 = Object.keys(conversions);

function buildGraph() {
  var graph = {};

  for (var len = models$1.length, i = 0; i < len; i++) {
    graph[models$1[i]] = {
      // http://jsperf.com/1-vs-infinity
      // micro-opt, but this is simple.
      distance: -1,
      parent: null
    };
  }

  return graph;
} // https://en.wikipedia.org/wiki/Breadth-first_search


function deriveBFS(fromModel) {
  var graph = buildGraph();
  var queue = [fromModel]; // unshift -> queue -> pop

  graph[fromModel].distance = 0;

  while (queue.length) {
    var current = queue.pop();
    var adjacents = Object.keys(conversions[current]);

    for (var len = adjacents.length, i = 0; i < len; i++) {
      var adjacent = adjacents[i];
      var node = graph[adjacent];

      if (node.distance === -1) {
        node.distance = graph[current].distance + 1;
        node.parent = current;
        queue.unshift(adjacent);
      }
    }
  }

  return graph;
}

function link(from, to) {
  return function (args) {
    return to(from(args));
  };
}

function wrapConversion(toModel, graph) {
  var path = [graph[toModel].parent, toModel];
  var fn = conversions[graph[toModel].parent][toModel];
  var cur = graph[toModel].parent;

  while (graph[cur].parent) {
    path.unshift(graph[cur].parent);
    fn = link(conversions[graph[cur].parent][cur], fn);
    cur = graph[cur].parent;
  }

  fn.conversion = path;
  return fn;
}

var route = function route(fromModel) {
  var graph = deriveBFS(fromModel);
  var conversion = {};
  var models = Object.keys(graph);

  for (var len = models.length, i = 0; i < len; i++) {
    var toModel = models[i];
    var node = graph[toModel];

    if (node.parent === null) {
      // no possible conversion, or this node is the source model.
      continue;
    }

    conversion[toModel] = wrapConversion(toModel, graph);
  }

  return conversion;
};

var convert = {};
var models = Object.keys(conversions);

function wrapRaw(fn) {
  var wrappedFn = function wrappedFn(args) {
    if (args === undefined || args === null) {
      return args;
    }

    if (arguments.length > 1) {
      args = Array.prototype.slice.call(arguments);
    }

    return fn(args);
  }; // preserve .conversion property if there is one


  if ('conversion' in fn) {
    wrappedFn.conversion = fn.conversion;
  }

  return wrappedFn;
}

function wrapRounded(fn) {
  var wrappedFn = function wrappedFn(args) {
    if (args === undefined || args === null) {
      return args;
    }

    if (arguments.length > 1) {
      args = Array.prototype.slice.call(arguments);
    }

    var result = fn(args); // we're assuming the result is an array here.
    // see notice in conversions.js; don't use box types
    // in conversion functions.

    if (_typeof(result) === 'object') {
      for (var len = result.length, i = 0; i < len; i++) {
        result[i] = Math.round(result[i]);
      }
    }

    return result;
  }; // preserve .conversion property if there is one


  if ('conversion' in fn) {
    wrappedFn.conversion = fn.conversion;
  }

  return wrappedFn;
}

models.forEach(function (fromModel) {
  convert[fromModel] = {};
  Object.defineProperty(convert[fromModel], 'channels', {
    value: conversions[fromModel].channels
  });
  Object.defineProperty(convert[fromModel], 'labels', {
    value: conversions[fromModel].labels
  });
  var routes = route(fromModel);
  var routeModels = Object.keys(routes);
  routeModels.forEach(function (toModel) {
    var fn = routes[toModel];
    convert[fromModel][toModel] = wrapRounded(fn);
    convert[fromModel][toModel].raw = wrapRaw(fn);
  });
});
var colorConvert = convert;

var ansiStyles = createCommonjsModule(function (module) {
  'use strict';

  var wrapAnsi16 = function wrapAnsi16(fn, offset) {
    return function () {
      var code = fn.apply(colorConvert, arguments);
      return "\x1B[".concat(code + offset, "m");
    };
  };

  var wrapAnsi256 = function wrapAnsi256(fn, offset) {
    return function () {
      var code = fn.apply(colorConvert, arguments);
      return "\x1B[".concat(38 + offset, ";5;").concat(code, "m");
    };
  };

  var wrapAnsi16m = function wrapAnsi16m(fn, offset) {
    return function () {
      var rgb = fn.apply(colorConvert, arguments);
      return "\x1B[".concat(38 + offset, ";2;").concat(rgb[0], ";").concat(rgb[1], ";").concat(rgb[2], "m");
    };
  };

  function assembleStyles() {
    var codes = new Map();
    var styles = {
      modifier: {
        reset: [0, 0],
        // 21 isn't widely supported and 22 does the same thing
        bold: [1, 22],
        dim: [2, 22],
        italic: [3, 23],
        underline: [4, 24],
        inverse: [7, 27],
        hidden: [8, 28],
        strikethrough: [9, 29]
      },
      color: {
        black: [30, 39],
        red: [31, 39],
        green: [32, 39],
        yellow: [33, 39],
        blue: [34, 39],
        magenta: [35, 39],
        cyan: [36, 39],
        white: [37, 39],
        gray: [90, 39],
        // Bright color
        redBright: [91, 39],
        greenBright: [92, 39],
        yellowBright: [93, 39],
        blueBright: [94, 39],
        magentaBright: [95, 39],
        cyanBright: [96, 39],
        whiteBright: [97, 39]
      },
      bgColor: {
        bgBlack: [40, 49],
        bgRed: [41, 49],
        bgGreen: [42, 49],
        bgYellow: [43, 49],
        bgBlue: [44, 49],
        bgMagenta: [45, 49],
        bgCyan: [46, 49],
        bgWhite: [47, 49],
        // Bright color
        bgBlackBright: [100, 49],
        bgRedBright: [101, 49],
        bgGreenBright: [102, 49],
        bgYellowBright: [103, 49],
        bgBlueBright: [104, 49],
        bgMagentaBright: [105, 49],
        bgCyanBright: [106, 49],
        bgWhiteBright: [107, 49]
      }
    }; // Fix humans

    styles.color.grey = styles.color.gray;

    var _arr = Object.keys(styles);

    for (var _i = 0; _i < _arr.length; _i++) {
      var groupName = _arr[_i];
      var group = styles[groupName];

      var _arr3 = Object.keys(group);

      for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
        var styleName = _arr3[_i3];
        var style = group[styleName];
        styles[styleName] = {
          open: "\x1B[".concat(style[0], "m"),
          close: "\x1B[".concat(style[1], "m")
        };
        group[styleName] = styles[styleName];
        codes.set(style[0], style[1]);
      }

      Object.defineProperty(styles, groupName, {
        value: group,
        enumerable: false
      });
      Object.defineProperty(styles, 'codes', {
        value: codes,
        enumerable: false
      });
    }

    var ansi2ansi = function ansi2ansi(n) {
      return n;
    };

    var rgb2rgb = function rgb2rgb(r, g, b) {
      return [r, g, b];
    };

    styles.color.close = "\x1B[39m";
    styles.bgColor.close = "\x1B[49m";
    styles.color.ansi = {
      ansi: wrapAnsi16(ansi2ansi, 0)
    };
    styles.color.ansi256 = {
      ansi256: wrapAnsi256(ansi2ansi, 0)
    };
    styles.color.ansi16m = {
      rgb: wrapAnsi16m(rgb2rgb, 0)
    };
    styles.bgColor.ansi = {
      ansi: wrapAnsi16(ansi2ansi, 10)
    };
    styles.bgColor.ansi256 = {
      ansi256: wrapAnsi256(ansi2ansi, 10)
    };
    styles.bgColor.ansi16m = {
      rgb: wrapAnsi16m(rgb2rgb, 10)
    };

    var _arr2 = Object.keys(colorConvert);

    for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
      var key = _arr2[_i2];

      if (_typeof(colorConvert[key]) !== 'object') {
        continue;
      }

      var suite = colorConvert[key];

      if (key === 'ansi16') {
        key = 'ansi';
      }

      if ('ansi16' in suite) {
        styles.color.ansi[key] = wrapAnsi16(suite.ansi16, 0);
        styles.bgColor.ansi[key] = wrapAnsi16(suite.ansi16, 10);
      }

      if ('ansi256' in suite) {
        styles.color.ansi256[key] = wrapAnsi256(suite.ansi256, 0);
        styles.bgColor.ansi256[key] = wrapAnsi256(suite.ansi256, 10);
      }

      if ('rgb' in suite) {
        styles.color.ansi16m[key] = wrapAnsi16m(suite.rgb, 0);
        styles.bgColor.ansi16m[key] = wrapAnsi16m(suite.rgb, 10);
      }
    }

    return styles;
  } // Make the export immutable


  Object.defineProperty(module, 'exports', {
    enumerable: true,
    get: assembleStyles
  });
});

var os = {
  EOL: "\n"
};

var os$1 = Object.freeze({
	default: os
});

var hasFlag = createCommonjsModule(function (module) {
  'use strict';

  module.exports = function (flag, argv$$1) {
    argv$$1 = argv$$1 || process.argv;
    var prefix = flag.startsWith('-') ? '' : flag.length === 1 ? '-' : '--';
    var pos = argv$$1.indexOf(prefix + flag);
    var terminatorPos = argv$$1.indexOf('--');
    return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
  };
});

var require$$1$1 = ( os$1 && os ) || os$1;

var env$1 = process.env;
var forceColor;

if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false')) {
  forceColor = false;
} else if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true') || hasFlag('color=always')) {
  forceColor = true;
}

if ('FORCE_COLOR' in env$1) {
  forceColor = env$1.FORCE_COLOR.length === 0 || parseInt(env$1.FORCE_COLOR, 10) !== 0;
}

function translateLevel(level) {
  if (level === 0) {
    return false;
  }

  return {
    level: level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3
  };
}

function supportsColor(stream) {
  if (forceColor === false) {
    return 0;
  }

  if (hasFlag('color=16m') || hasFlag('color=full') || hasFlag('color=truecolor')) {
    return 3;
  }

  if (hasFlag('color=256')) {
    return 2;
  }

  if (stream && !stream.isTTY && forceColor !== true) {
    return 0;
  }

  var min = forceColor ? 1 : 0;

  if (process.platform === 'win32') {
    // Node.js 7.5.0 is the first version of Node.js to include a patch to
    // libuv that enables 256 color output on Windows. Anything earlier and it
    // won't work. However, here we target Node.js 8 at minimum as it is an LTS
    // release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
    // release that supports 256 colors. Windows 10 build 14931 is the first release
    // that supports 16m/TrueColor.
    var osRelease = require$$1$1.release().split('.');

    if (Number(process.versions.node.split('.')[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }

    return 1;
  }

  if ('CI' in env$1) {
    if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(function (sign) {
      return sign in env$1;
    }) || env$1.CI_NAME === 'codeship') {
      return 1;
    }

    return min;
  }

  if ('TEAMCITY_VERSION' in env$1) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env$1.TEAMCITY_VERSION) ? 1 : 0;
  }

  if (env$1.COLORTERM === 'truecolor') {
    return 3;
  }

  if ('TERM_PROGRAM' in env$1) {
    var version = parseInt((env$1.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

    switch (env$1.TERM_PROGRAM) {
      case 'iTerm.app':
        return version >= 3 ? 3 : 2;

      case 'Apple_Terminal':
        return 2;
      // No default
    }
  }

  if (/-256(color)?$/i.test(env$1.TERM)) {
    return 2;
  }

  if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env$1.TERM)) {
    return 1;
  }

  if ('COLORTERM' in env$1) {
    return 1;
  }

  if (env$1.TERM === 'dumb') {
    return min;
  }

  return min;
}

function getSupportLevel(stream) {
  var level = supportsColor(stream);
  return translateLevel(level);
}

var supportsColor_1 = {
  supportsColor: getSupportLevel,
  stdout: getSupportLevel(process.stdout),
  stderr: getSupportLevel(process.stderr)
};

var templates = createCommonjsModule(function (module) {
  'use strict';

  var TEMPLATE_REGEX = /(?:\\(u[a-f\d]{4}|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
  var STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
  var STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
  var ESCAPE_REGEX = /\\(u[a-f\d]{4}|x[a-f\d]{2}|.)|([^\\])/gi;
  var ESCAPES = new Map([['n', '\n'], ['r', '\r'], ['t', '\t'], ['b', '\b'], ['f', '\f'], ['v', '\v'], ['0', '\0'], ['\\', '\\'], ['e', "\x1B"], ['a', "\x07"]]);

  function unescape(c) {
    if (c[0] === 'u' && c.length === 5 || c[0] === 'x' && c.length === 3) {
      return String.fromCharCode(parseInt(c.slice(1), 16));
    }

    return ESCAPES.get(c) || c;
  }

  function parseArguments(name, args) {
    var results = [];
    var chunks = args.trim().split(/\s*,\s*/g);
    var matches;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = chunks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var chunk = _step.value;

        if (!isNaN(chunk)) {
          results.push(Number(chunk));
        } else if (matches = chunk.match(STRING_REGEX)) {
          results.push(matches[2].replace(ESCAPE_REGEX, function (m, escape, chr) {
            return escape ? unescape(escape) : chr;
          }));
        } else {
          throw new Error("Invalid Chalk template style argument: ".concat(chunk, " (in style '").concat(name, "')"));
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return results;
  }

  function parseStyle(style) {
    STYLE_REGEX.lastIndex = 0;
    var results = [];
    var matches;

    while ((matches = STYLE_REGEX.exec(style)) !== null) {
      var name = matches[1];

      if (matches[2]) {
        var args = parseArguments(name, matches[2]);
        results.push([name].concat(args));
      } else {
        results.push([name]);
      }
    }

    return results;
  }

  function buildStyle(chalk, styles) {
    var enabled = {};
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = styles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var layer = _step2.value;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = layer.styles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var style = _step3.value;
            enabled[style[0]] = layer.inverse ? null : style.slice(1);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    var current = chalk;

    var _arr = Object.keys(enabled);

    for (var _i = 0; _i < _arr.length; _i++) {
      var styleName = _arr[_i];

      if (Array.isArray(enabled[styleName])) {
        if (!(styleName in current)) {
          throw new Error("Unknown Chalk style: ".concat(styleName));
        }

        if (enabled[styleName].length > 0) {
          current = current[styleName].apply(current, enabled[styleName]);
        } else {
          current = current[styleName];
        }
      }
    }

    return current;
  }

  module.exports = function (chalk, tmp) {
    var styles = [];
    var chunks = [];
    var chunk = []; // eslint-disable-next-line max-params

    tmp.replace(TEMPLATE_REGEX, function (m, escapeChar, inverse, style, close, chr) {
      if (escapeChar) {
        chunk.push(unescape(escapeChar));
      } else if (style) {
        var str = chunk.join('');
        chunk = [];
        chunks.push(styles.length === 0 ? str : buildStyle(chalk, styles)(str));
        styles.push({
          inverse: inverse,
          styles: parseStyle(style)
        });
      } else if (close) {
        if (styles.length === 0) {
          throw new Error('Found extraneous } in Chalk template literal');
        }

        chunks.push(buildStyle(chalk, styles)(chunk.join('')));
        chunk = [];
        styles.pop();
      } else {
        chunk.push(chr);
      }
    });
    chunks.push(chunk.join(''));

    if (styles.length > 0) {
      var errMsg = "Chalk template literal is missing ".concat(styles.length, " closing bracket").concat(styles.length === 1 ? '' : 's', " (`}`)");
      throw new Error(errMsg);
    }

    return chunks.join('');
  };
});

var chalk = createCommonjsModule(function (module) {
  'use strict';

  var stdoutColor = supportsColor_1.stdout;
  var isSimpleWindowsTerm = process.platform === 'win32' && !(process.env.TERM || '').toLowerCase().startsWith('xterm'); // `supportsColor.level` → `ansiStyles.color[name]` mapping

  var levelMapping = ['ansi', 'ansi', 'ansi256', 'ansi16m']; // `color-convert` models to exclude from the Chalk API due to conflicts and such

  var skipModels = new Set(['gray']);
  var styles = Object.create(null);

  function applyOptions(obj, options) {
    options = options || {}; // Detect level if not set manually

    var scLevel = stdoutColor ? stdoutColor.level : 0;
    obj.level = options.level === undefined ? scLevel : options.level;
    obj.enabled = 'enabled' in options ? options.enabled : obj.level > 0;
  }

  function Chalk(options) {
    // We check for this.template here since calling `chalk.constructor()`
    // by itself will have a `this` of a previously constructed chalk object
    if (!this || !(this instanceof Chalk) || this.template) {
      var _chalk = {};
      applyOptions(_chalk, options);

      _chalk.template = function () {
        var args = [].slice.call(arguments);
        return chalkTag.apply(null, [_chalk.template].concat(args));
      };

      Object.setPrototypeOf(_chalk, Chalk.prototype);
      Object.setPrototypeOf(_chalk.template, _chalk);
      _chalk.template.constructor = Chalk;
      return _chalk.template;
    }

    applyOptions(this, options);
  } // Use bright blue on Windows as the normal blue color is illegible


  if (isSimpleWindowsTerm) {
    ansiStyles.blue.open = "\x1B[94m";
  }

  var _arr = Object.keys(ansiStyles);

  var _loop = function _loop() {
    var key = _arr[_i];
    ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');
    styles[key] = {
      get: function get() {
        var codes = ansiStyles[key];
        return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, key);
      }
    };
  };

  for (var _i = 0; _i < _arr.length; _i++) {
    _loop();
  }

  styles.visible = {
    get: function get() {
      return build.call(this, this._styles || [], true, 'visible');
    }
  };
  ansiStyles.color.closeRe = new RegExp(escapeStringRegexp(ansiStyles.color.close), 'g');

  var _arr2 = Object.keys(ansiStyles.color.ansi);

  var _loop2 = function _loop2() {
    var model = _arr2[_i2];

    if (skipModels.has(model)) {
      return "continue";
    }

    styles[model] = {
      get: function get() {
        var level = this.level;
        return function () {
          var open = ansiStyles.color[levelMapping[level]][model].apply(null, arguments);
          var codes = {
            open: open,
            close: ansiStyles.color.close,
            closeRe: ansiStyles.color.closeRe
          };
          return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, model);
        };
      }
    };
  };

  for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
    var _ret = _loop2();

    if (_ret === "continue") continue;
  }

  ansiStyles.bgColor.closeRe = new RegExp(escapeStringRegexp(ansiStyles.bgColor.close), 'g');

  var _arr3 = Object.keys(ansiStyles.bgColor.ansi);

  var _loop3 = function _loop3() {
    var model = _arr3[_i3];

    if (skipModels.has(model)) {
      return "continue";
    }

    var bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
    styles[bgModel] = {
      get: function get() {
        var level = this.level;
        return function () {
          var open = ansiStyles.bgColor[levelMapping[level]][model].apply(null, arguments);
          var codes = {
            open: open,
            close: ansiStyles.bgColor.close,
            closeRe: ansiStyles.bgColor.closeRe
          };
          return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, model);
        };
      }
    };
  };

  for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
    var _ret2 = _loop3();

    if (_ret2 === "continue") continue;
  }

  var proto = Object.defineProperties(function () {}, styles);

  function build(_styles, _empty, key) {
    var builder = function builder() {
      return applyStyle.apply(builder, arguments);
    };

    builder._styles = _styles;
    builder._empty = _empty;
    var self = this;
    Object.defineProperty(builder, 'level', {
      enumerable: true,
      get: function get() {
        return self.level;
      },
      set: function set(level) {
        self.level = level;
      }
    });
    Object.defineProperty(builder, 'enabled', {
      enumerable: true,
      get: function get() {
        return self.enabled;
      },
      set: function set(enabled) {
        self.enabled = enabled;
      }
    }); // See below for fix regarding invisible grey/dim combination on Windows

    builder.hasGrey = this.hasGrey || key === 'gray' || key === 'grey'; // `__proto__` is used because we must return a function, but there is
    // no way to create a function with a different prototype

    builder.__proto__ = proto; // eslint-disable-line no-proto

    return builder;
  }

  function applyStyle() {
    // Support varags, but simply cast to string in case there's only one arg
    var args = arguments;
    var argsLen = args.length;
    var str = String(arguments[0]);

    if (argsLen === 0) {
      return '';
    }

    if (argsLen > 1) {
      // Don't slice `arguments`, it prevents V8 optimizations
      for (var a = 1; a < argsLen; a++) {
        str += ' ' + args[a];
      }
    }

    if (!this.enabled || this.level <= 0 || !str) {
      return this._empty ? '' : str;
    } // Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
    // see https://github.com/chalk/chalk/issues/58
    // If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.


    var originalDim = ansiStyles.dim.open;

    if (isSimpleWindowsTerm && this.hasGrey) {
      ansiStyles.dim.open = '';
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this._styles.slice().reverse()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var code = _step.value;
        // Replace any instances already present with a re-opening code
        // otherwise only the part of the string until said closing code
        // will be colored, and the rest will simply be 'plain'.
        str = code.open + str.replace(code.closeRe, code.open) + code.close; // Close the styling before a linebreak and reopen
        // after next line to fix a bleed issue on macOS
        // https://github.com/chalk/chalk/pull/92

        str = str.replace(/\r?\n/g, "".concat(code.close, "$&").concat(code.open));
      } // Reset the original `dim` if we changed it to work around the Windows dimmed gray issue

    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    ansiStyles.dim.open = originalDim;
    return str;
  }

  function chalkTag(chalk, strings) {
    if (!Array.isArray(strings)) {
      // If chalk() was called by itself or with a string,
      // return the string itself as a string.
      return [].slice.call(arguments, 1).join(' ');
    }

    var args = [].slice.call(arguments, 2);
    var parts = [strings.raw[0]];

    for (var i = 1; i < strings.length; i++) {
      parts.push(String(args[i - 1]).replace(/[{}\\]/g, '\\$&'));
      parts.push(String(strings.raw[i]));
    }

    return templates(chalk, parts.join(''));
  }

  Object.defineProperties(Chalk.prototype, styles);
  module.exports = Chalk(); // eslint-disable-line new-cap

  module.exports.supportsColor = stdoutColor;
  module.exports.default = module.exports; // For TypeScript
});

var lib$2 = createCommonjsModule(function (module, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.shouldHighlight = shouldHighlight;
  exports.getChalk = getChalk;
  exports.default = highlight;

  function _jsTokens() {
    var data = _interopRequireWildcard(jsTokens);

    _jsTokens = function _jsTokens() {
      return data;
    };

    return data;
  }

  function _esutils() {
    var data = _interopRequireDefault(utils);

    _esutils = function _esutils() {
      return data;
    };

    return data;
  }

  function _chalk() {
    var data = _interopRequireDefault(chalk);

    _chalk = function _chalk() {
      return data;
    };

    return data;
  }

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};

            if (desc.get || desc.set) {
              Object.defineProperty(newObj, key, desc);
            } else {
              newObj[key] = obj[key];
            }
          }
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  function getDefs(chalk$$1) {
    return {
      keyword: chalk$$1.cyan,
      capitalized: chalk$$1.yellow,
      jsx_tag: chalk$$1.yellow,
      punctuator: chalk$$1.yellow,
      number: chalk$$1.magenta,
      string: chalk$$1.green,
      regex: chalk$$1.magenta,
      comment: chalk$$1.grey,
      invalid: chalk$$1.white.bgRed.bold
    };
  }

  var NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
  var JSX_TAG = /^[a-z][\w-]*$/i;
  var BRACKET = /^[()[\]{}]$/;

  function getTokenType(match) {
    var _match$slice = match.slice(-2),
        offset = _match$slice[0],
        text = _match$slice[1];

    var token = (0, _jsTokens().matchToToken)(match);

    if (token.type === "name") {
      if (_esutils().default.keyword.isReservedWordES6(token.value)) {
        return "keyword";
      }

      if (JSX_TAG.test(token.value) && (text[offset - 1] === "<" || text.substr(offset - 2, 2) == "</")) {
        return "jsx_tag";
      }

      if (token.value[0] !== token.value[0].toLowerCase()) {
        return "capitalized";
      }
    }

    if (token.type === "punctuator" && BRACKET.test(token.value)) {
      return "bracket";
    }

    if (token.type === "invalid" && (token.value === "@" || token.value === "#")) {
      return "punctuator";
    }

    return token.type;
  }

  function highlightTokens(defs, text) {
    return text.replace(_jsTokens().default, function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var type = getTokenType(args);
      var colorize = defs[type];

      if (colorize) {
        return args[0].split(NEWLINE).map(function (str) {
          return colorize(str);
        }).join("\n");
      } else {
        return args[0];
      }
    });
  }

  function shouldHighlight(options) {
    return _chalk().default.supportsColor || options.forceColor;
  }

  function getChalk(options) {
    var chalk$$1 = _chalk().default;

    if (options.forceColor) {
      chalk$$1 = new (_chalk().default.constructor)({
        enabled: true,
        level: 1
      });
    }

    return chalk$$1;
  }

  function highlight(code, options) {
    if (options === void 0) {
      options = {};
    }

    if (shouldHighlight(options)) {
      var chalk$$1 = getChalk(options);
      var defs = getDefs(chalk$$1);
      return highlightTokens(defs, code);
    } else {
      return code;
    }
  }
});
unwrapExports(lib$2);

var lib$1 = createCommonjsModule(function (module, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.codeFrameColumns = codeFrameColumns;
  exports.default = _default;

  function _highlight() {
    var data = _interopRequireWildcard(lib$2);

    _highlight = function _highlight() {
      return data;
    };

    return data;
  }

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};

            if (desc.get || desc.set) {
              Object.defineProperty(newObj, key, desc);
            } else {
              newObj[key] = obj[key];
            }
          }
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  var deprecationWarningShown = false;

  function getDefs(chalk) {
    return {
      gutter: chalk.grey,
      marker: chalk.red.bold,
      message: chalk.red.bold
    };
  }

  var NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

  function getMarkerLines(loc, source, opts) {
    var startLoc = Object.assign({}, {
      column: 0,
      line: -1
    }, loc.start);
    var endLoc = Object.assign({}, startLoc, loc.end);

    var _ref = opts || {},
        _ref$linesAbove = _ref.linesAbove,
        linesAbove = _ref$linesAbove === void 0 ? 2 : _ref$linesAbove,
        _ref$linesBelow = _ref.linesBelow,
        linesBelow = _ref$linesBelow === void 0 ? 3 : _ref$linesBelow;

    var startLine = startLoc.line;
    var startColumn = startLoc.column;
    var endLine = endLoc.line;
    var endColumn = endLoc.column;
    var start = Math.max(startLine - (linesAbove + 1), 0);
    var end = Math.min(source.length, endLine + linesBelow);

    if (startLine === -1) {
      start = 0;
    }

    if (endLine === -1) {
      end = source.length;
    }

    var lineDiff = endLine - startLine;
    var markerLines = {};

    if (lineDiff) {
      for (var i = 0; i <= lineDiff; i++) {
        var lineNumber = i + startLine;

        if (!startColumn) {
          markerLines[lineNumber] = true;
        } else if (i === 0) {
          var sourceLength = source[lineNumber - 1].length;
          markerLines[lineNumber] = [startColumn, sourceLength - startColumn];
        } else if (i === lineDiff) {
          markerLines[lineNumber] = [0, endColumn];
        } else {
          var _sourceLength = source[lineNumber - i].length;
          markerLines[lineNumber] = [0, _sourceLength];
        }
      }
    } else {
      if (startColumn === endColumn) {
        if (startColumn) {
          markerLines[startLine] = [startColumn, 0];
        } else {
          markerLines[startLine] = true;
        }
      } else {
        markerLines[startLine] = [startColumn, endColumn - startColumn];
      }
    }

    return {
      start: start,
      end: end,
      markerLines: markerLines
    };
  }

  function codeFrameColumns(rawLines, loc, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var highlighted = (opts.highlightCode || opts.forceColor) && (0, _highlight().shouldHighlight)(opts);
    var chalk = (0, _highlight().getChalk)(opts);
    var defs = getDefs(chalk);

    var maybeHighlight = function maybeHighlight(chalkFn, string) {
      return highlighted ? chalkFn(string) : string;
    };

    if (highlighted) rawLines = (0, _highlight().default)(rawLines, opts);
    var lines = rawLines.split(NEWLINE);

    var _getMarkerLines = getMarkerLines(loc, lines, opts),
        start = _getMarkerLines.start,
        end = _getMarkerLines.end,
        markerLines = _getMarkerLines.markerLines;

    var hasColumns = loc.start && typeof loc.start.column === "number";
    var numberMaxWidth = String(end).length;
    var frame = lines.slice(start, end).map(function (line, index) {
      var number = start + 1 + index;
      var paddedNumber = (" " + number).slice(-numberMaxWidth);
      var gutter = " " + paddedNumber + " | ";
      var hasMarker = markerLines[number];
      var lastMarkerLine = !markerLines[number + 1];

      if (hasMarker) {
        var markerLine = "";

        if (Array.isArray(hasMarker)) {
          var markerSpacing = line.slice(0, Math.max(hasMarker[0] - 1, 0)).replace(/[^\t]/g, " ");
          var numberOfMarkers = hasMarker[1] || 1;
          markerLine = ["\n ", maybeHighlight(defs.gutter, gutter.replace(/\d/g, " ")), markerSpacing, maybeHighlight(defs.marker, "^").repeat(numberOfMarkers)].join("");

          if (lastMarkerLine && opts.message) {
            markerLine += " " + maybeHighlight(defs.message, opts.message);
          }
        }

        return [maybeHighlight(defs.marker, ">"), maybeHighlight(defs.gutter, gutter), line, markerLine].join("");
      } else {
        return " " + maybeHighlight(defs.gutter, gutter) + line;
      }
    }).join("\n");

    if (opts.message && !hasColumns) {
      frame = "" + " ".repeat(numberMaxWidth + 1) + opts.message + "\n" + frame;
    }

    if (highlighted) {
      return chalk.reset(frame);
    } else {
      return frame;
    }
  }

  function _default(rawLines, lineNumber, colNumber, opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (!deprecationWarningShown) {
      deprecationWarningShown = true;
      var message = "Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.";

      if (process.emitWarning) {
        process.emitWarning(message, "DeprecationWarning");
      } else {
        var deprecationError = new Error(message);
        deprecationError.name = "DeprecationWarning";
        console.warn(new Error(message));
      }
    }

    colNumber = Math.max(colNumber, 0);
    var location = {
      start: {
        column: colNumber,
        line: lineNumber
      }
    };
    return codeFrameColumns(rawLines, location, opts);
  }
});
unwrapExports(lib$1);

var path = ( _shim_path$1 && _shim_path ) || _shim_path$1;

var ConfigError$1 = errors.ConfigError;
var locStart = loc.locStart;
var locEnd = loc.locEnd; // Use defineProperties()/getOwnPropertyDescriptor() to prevent
// triggering the parsers getters.

var ownNames = Object.getOwnPropertyNames;
var ownDescriptor = Object.getOwnPropertyDescriptor;

function getParsers(options) {
  var parsers = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = options.plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var plugin = _step.value;

      if (!plugin.parsers) {
        continue;
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = ownNames(plugin.parsers)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var name = _step2.value;
          Object.defineProperty(parsers, name, ownDescriptor(plugin.parsers, name));
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return parsers;
}

function resolveParser$1(opts, parsers) {
  parsers = parsers || getParsers(opts);

  if (typeof opts.parser === "function") {
    // Custom parser API always works with JavaScript.
    return {
      parse: opts.parser,
      astFormat: "estree",
      locStart: locStart,
      locEnd: locEnd
    };
  }

  if (typeof opts.parser === "string") {
    if (parsers.hasOwnProperty(opts.parser)) {
      return parsers[opts.parser];
    }

    try {
      return {
        parse: require(path.resolve(process.cwd(), opts.parser)),
        astFormat: "estree",
        locStart: locStart,
        locEnd: locEnd
      };
    } catch (err) {
      /* istanbul ignore next */
      throw new ConfigError$1("Couldn't resolve parser \"".concat(opts.parser, "\""));
    }
  }
}

function parse$2(text, opts) {
  var parsers = getParsers(opts); // Create a new object {parserName: parseFn}. Uses defineProperty() to only call
  // the parsers getters when actually calling the parser `parse` function.

  var parsersForCustomParserApi = Object.keys(parsers).reduce(function (object, parserName) {
    return Object.defineProperty(object, parserName, {
      enumerable: true,
      get: function get() {
        return parsers[parserName].parse;
      }
    });
  }, {});
  var parser = resolveParser$1(opts, parsers);

  try {
    if (parser.preprocess) {
      text = parser.preprocess(text, opts);
    }

    return {
      text: text,
      ast: parser.parse(text, parsersForCustomParserApi, opts)
    };
  } catch (error) {
    var loc$$1 = error.loc;

    if (loc$$1) {
      var codeFrame = lib$1;
      error.codeFrame = codeFrame.codeFrameColumns(text, loc$$1, {
        highlightCode: true
      });
      error.message += "\n" + error.codeFrame;
      throw error;
    }
    /* istanbul ignore next */


    throw error.stack;
  }
}

var parser = {
  parse: parse$2,
  resolveParser: resolveParser$1
};

var UndefinedParserError = errors.UndefinedParserError;
var getSupportInfo$1 = support.getSupportInfo;
var resolveParser = parser.resolveParser;
var hiddenDefaults = {
  astFormat: "estree",
  printer: {},
  originalText: undefined,
  locStart: null,
  locEnd: null
}; // Copy options and fill in default values.

function normalize(options, opts) {
  opts = opts || {};
  var rawOptions = Object.assign({}, options);
  var supportOptions = getSupportInfo$1(null, {
    plugins: options.plugins,
    showUnreleased: true,
    showDeprecated: true
  }).options;
  var defaults = supportOptions.reduce(function (reduced, optionInfo) {
    return Object.assign(reduced, _defineProperty({}, optionInfo.name, optionInfo.default));
  }, Object.assign({}, hiddenDefaults));

  if (!rawOptions.parser) {
    if (!rawOptions.filepath) {
      var logger = opts.logger || console;
      logger.warn("No parser and no filepath given, using 'babylon' the parser now " + "but this will throw an error in the future. " + "Please specify a parser or a filepath so one can be inferred.");
      rawOptions.parser = "babylon";
    } else {
      rawOptions.parser = inferParser(rawOptions.filepath, rawOptions.plugins);

      if (!rawOptions.parser) {
        throw new UndefinedParserError("No parser could be inferred for file: ".concat(rawOptions.filepath));
      }
    }
  }

  var parser$$1 = resolveParser(optionsNormalizer.normalizeApiOptions(rawOptions, [supportOptions.find(function (x) {
    return x.name === "parser";
  })], {
    passThrough: true,
    logger: false
  }));
  rawOptions.astFormat = parser$$1.astFormat;
  rawOptions.locEnd = parser$$1.locEnd;
  rawOptions.locStart = parser$$1.locStart;
  var plugin = getPlugin(rawOptions);
  rawOptions.printer = plugin.printers[rawOptions.astFormat];
  var pluginDefaults = supportOptions.filter(function (optionInfo) {
    return optionInfo.pluginDefaults && optionInfo.pluginDefaults[plugin.name];
  }).reduce(function (reduced, optionInfo) {
    return Object.assign(reduced, _defineProperty({}, optionInfo.name, optionInfo.pluginDefaults[plugin.name]));
  }, {});
  var mixedDefaults = Object.assign({}, defaults, pluginDefaults);
  Object.keys(mixedDefaults).forEach(function (k) {
    if (rawOptions[k] == null) {
      rawOptions[k] = mixedDefaults[k];
    }
  });

  if (rawOptions.parser === "json") {
    rawOptions.trailingComma = "none";
  }

  return optionsNormalizer.normalizeApiOptions(rawOptions, supportOptions, Object.assign({
    passThrough: Object.keys(hiddenDefaults)
  }, opts));
}

function getPlugin(options) {
  var astFormat = options.astFormat;

  if (!astFormat) {
    throw new Error("getPlugin() requires astFormat to be set");
  }

  var printerPlugin = options.plugins.find(function (plugin) {
    return plugin.printers && plugin.printers[astFormat];
  });

  if (!printerPlugin) {
    throw new Error("Couldn't find plugin for AST format \"".concat(astFormat, "\""));
  }

  return printerPlugin;
}

function inferParser(filepath, plugins) {
  var filepathParts = normalizePath(filepath).split("/");
  var filename = filepathParts[filepathParts.length - 1].toLowerCase();
  var language = getSupportInfo$1(null, {
    plugins: plugins
  }).languages.find(function (language) {
    return language.since !== null && (language.extensions && language.extensions.some(function (extension) {
      return filename.endsWith(extension);
    }) || language.filenames && language.filenames.find(function (name) {
      return name.toLowerCase() === filename;
    }));
  });
  return language && language.parsers[0];
}

var options = {
  normalize: normalize,
  hiddenDefaults: hiddenDefaults,
  inferParser: inferParser
};

function massageAST(ast, options, parent) {
  if (Array.isArray(ast)) {
    return ast.map(function (e) {
      return massageAST(e, options, parent);
    }).filter(function (e) {
      return e;
    });
  }

  if (!ast || _typeof(ast) !== "object") {
    return ast;
  }

  var newObj = {};

  var _arr = Object.keys(ast);

  for (var _i = 0; _i < _arr.length; _i++) {
    var key = _arr[_i];

    if (typeof ast[key] !== "function") {
      newObj[key] = massageAST(ast[key], options, ast);
    }
  }

  if (options.printer.massageAstNode) {
    var result = options.printer.massageAstNode(ast, newObj, parent);

    if (result === null) {
      return undefined;
    }

    if (result) {
      return result;
    }
  }

  return newObj;
}

var massageAst = massageAST;

function assert() {}

assert.ok = function () {};

assert.strictEqual = function () {};



var assert$2 = Object.freeze({
	default: assert
});

function concat$1(parts) {
  return {
    type: "concat",
    parts: parts
  };
}

function indent$1(contents) {
  return {
    type: "indent",
    contents: contents
  };
}

function align(n, contents) {
  return {
    type: "align",
    contents: contents,
    n: n
  };
}

function group(contents, opts) {
  opts = opts || {};

  return {
    type: "group",
    id: opts.id,
    contents: contents,
    break: !!opts.shouldBreak,
    expandedStates: opts.expandedStates
  };
}

function dedentToRoot(contents) {
  return align(-Infinity, contents);
}

function markAsRoot(contents) {
  return align({
    type: "root"
  }, contents);
}

function dedent$1(contents) {
  return align(-1, contents);
}

function conditionalGroup(states, opts) {
  return group(states[0], Object.assign(opts || {}, {
    expandedStates: states
  }));
}

function fill(parts) {
  return {
    type: "fill",
    parts: parts
  };
}

function ifBreak(breakContents, flatContents, opts) {
  opts = opts || {};

  return {
    type: "if-break",
    breakContents: breakContents,
    flatContents: flatContents,
    groupId: opts.groupId
  };
}

function lineSuffix$1(contents) {
  return {
    type: "line-suffix",
    contents: contents
  };
}

var lineSuffixBoundary = {
  type: "line-suffix-boundary"
};
var breakParent$1 = {
  type: "break-parent"
};
var line$2 = {
  type: "line"
};
var softline = {
  type: "line",
  soft: true
};
var hardline$1 = concat$1([{
  type: "line",
  hard: true
}, breakParent$1]);
var literalline = concat$1([{
  type: "line",
  hard: true,
  literal: true
}, breakParent$1]);
var cursor$1 = {
  type: "cursor",
  placeholder: Symbol("cursor")
};

function join$1(sep, arr) {
  var res = [];

  for (var i = 0; i < arr.length; i++) {
    if (i !== 0) {
      res.push(sep);
    }

    res.push(arr[i]);
  }

  return concat$1(res);
}

function addAlignmentToDoc(doc, size, tabWidth) {
  var aligned = doc;

  if (size > 0) {
    // Use indent to add tabs for all the levels of tabs we need
    for (var i = 0; i < Math.floor(size / tabWidth); ++i) {
      aligned = indent$1(aligned);
    } // Use align for all the spaces that are needed


    aligned = align(size % tabWidth, aligned); // size is absolute from 0 and not relative to the current
    // indentation, so we use -Infinity to reset the indentation to 0

    aligned = align(-Infinity, aligned);
  }

  return aligned;
}

var docBuilders = {
  concat: concat$1,
  join: join$1,
  line: line$2,
  softline: softline,
  hardline: hardline$1,
  literalline: literalline,
  group: group,
  conditionalGroup: conditionalGroup,
  fill: fill,
  lineSuffix: lineSuffix$1,
  lineSuffixBoundary: lineSuffixBoundary,
  cursor: cursor$1,
  breakParent: breakParent$1,
  ifBreak: ifBreak,
  indent: indent$1,
  align: align,
  addAlignmentToDoc: addAlignmentToDoc,
  markAsRoot: markAsRoot,
  dedentToRoot: dedentToRoot,
  dedent: dedent$1
};

var ansiRegex = createCommonjsModule(function (module) {
  'use strict';

  module.exports = function () {
    var pattern = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)", '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'].join('|');
    return new RegExp(pattern, 'g');
  };
});

var stripAnsi = function stripAnsi(input) {
  return typeof input === 'string' ? input.replace(ansiRegex(), '') : input;
};

var isFullwidthCodePoint = createCommonjsModule(function (module) {
  'use strict';
  /* eslint-disable yoda */

  module.exports = function (x) {
    if (Number.isNaN(x)) {
      return false;
    } // code points are derived from:
    // http://www.unix.org/Public/UNIDATA/EastAsianWidth.txt


    if (x >= 0x1100 && (x <= 0x115f || // Hangul Jamo
    x === 0x2329 || // LEFT-POINTING ANGLE BRACKET
    x === 0x232a || // RIGHT-POINTING ANGLE BRACKET
    // CJK Radicals Supplement .. Enclosed CJK Letters and Months
    0x2e80 <= x && x <= 0x3247 && x !== 0x303f || // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
    0x3250 <= x && x <= 0x4dbf || // CJK Unified Ideographs .. Yi Radicals
    0x4e00 <= x && x <= 0xa4c6 || // Hangul Jamo Extended-A
    0xa960 <= x && x <= 0xa97c || // Hangul Syllables
    0xac00 <= x && x <= 0xd7a3 || // CJK Compatibility Ideographs
    0xf900 <= x && x <= 0xfaff || // Vertical Forms
    0xfe10 <= x && x <= 0xfe19 || // CJK Compatibility Forms .. Small Form Variants
    0xfe30 <= x && x <= 0xfe6b || // Halfwidth and Fullwidth Forms
    0xff01 <= x && x <= 0xff60 || 0xffe0 <= x && x <= 0xffe6 || // Kana Supplement
    0x1b000 <= x && x <= 0x1b001 || // Enclosed Ideographic Supplement
    0x1f200 <= x && x <= 0x1f251 || // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
    0x20000 <= x && x <= 0x3fffd)) {
      return true;
    }

    return false;
  };
});

var stringWidth = createCommonjsModule(function (module) {
  'use strict';

  module.exports = function (str) {
    if (typeof str !== 'string' || str.length === 0) {
      return 0;
    }

    str = stripAnsi(str);
    var width = 0;

    for (var i = 0; i < str.length; i++) {
      var code = str.codePointAt(i); // Ignore control characters

      if (code <= 0x1F || code >= 0x7F && code <= 0x9F) {
        continue;
      } // Ignore combining characters


      if (code >= 0x300 && code <= 0x36F) {
        continue;
      } // Surrogates


      if (code > 0xFFFF) {
        i++;
      }

      width += isFullwidthCodePoint(code) ? 2 : 1;
    }

    return width;
  };
});

var emojiRegex$1 = function emojiRegex() {
  // https://mathiasbynens.be/notes/es-unicode-property-escapes#emoji
  return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74)\uDB40\uDC7F|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]\uFE0F|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]))|\uD83D\uDC69\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83D\uDC69\u200D[\u2695\u2696\u2708])\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC68(?:\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])\uFE0F/g;
};

var punctuation_ranges = [// http://www.unicode.org/charts/PDF/U3000.pdf CJK Symbols and Punctuation
[0x3000, 0x303f], // http://www.unicode.org/charts/PDF/UAC00.pdf Hangul Syllables
[0xac00, 0xd7af], // http://www.unicode.org/charts/PDF/UFE10.pdf Vertical Forms
[0xfe10, 0xfe1f], // http://www.unicode.org/charts/PDF/UFE30.pdf CJK Compatibility Forms
// http://www.unicode.org/charts/PDF/UFE50.pdf Small Form Variants
[0xfe30, 0xfe6f], // http://www.unicode.org/charts/PDF/UFF00.pdf Halfwidth and Fullwidth Forms
[0xff00, 0xff60], [0xffe0, 0xffef]];
var character_ranges = [// http://www.unicode.org/charts/PDF/U1100.pdf Hangul Jamo
[0x1100, 0x11ff], // http://www.unicode.org/charts/PDF/U2E80.pdf CJK Radicals Supplement
// http://www.unicode.org/charts/PDF/U2F00.pdf Kangxi Radicals
[0x2e80, 0x2fdf], // http://www.unicode.org/charts/PDF/U3040.pdf Hiragana
// http://www.unicode.org/charts/PDF/U30A0.pdf Katakana
// http://www.unicode.org/charts/PDF/U3100.pdf Bopomofo
// http://www.unicode.org/charts/PDF/U3130.pdf Hangul Compatibility Jamo
[0x3040, 0x318f], // http://www.unicode.org/charts/PDF/U3200.pdf Enclosed CJK Letters and Months
// http://www.unicode.org/charts/PDF/U3300.pdf CJK Compatibility
// http://www.unicode.org/charts/PDF/U3400.pdf CJK Unified Ideographs Extension A
[0x3200, 0x4dbf], // http://www.unicode.org/charts/PDF/U4E00.pdf CJK Unified Ideographs (Han)
[0x4e00, 0x9fff], // http://www.unicode.org/charts/PDF/UA960.pdf Hangul Jamo Extended-A
[0xa960, 0xa97f], // http://www.unicode.org/charts/PDF/UF900.pdf CJK Compatibility Ideographs
[0xf900, 0xfaff]];

function get_regex() {
  return create_regex(character_ranges.concat(punctuation_ranges));
} // istanbul ignore next
// tslint:disable-next-line:no-namespace


(function (get_regex) {
  function punctuations() {
    return create_regex(punctuation_ranges);
  }

  get_regex.punctuations = punctuations;

  function characters() {
    return create_regex(character_ranges);
  }

  get_regex.characters = characters;
})(get_regex || (get_regex = {}));

function create_regex(ranges) {
  return new RegExp("[" + ranges.map(get_bracket_content).reduce(function (a, b) {
    return a + b;
  }) + "]", 'g');
}

function get_bracket_content(range) {
  return get_escaped_unicode(range[0]) + "-" + get_escaped_unicode(range[1]);
}

function get_escaped_unicode(num) {
  return "\\u" + num.toString(16);
}

var lib$3 = get_regex;

var data_generated = createCommonjsModule(function (module, exports) {
  "use strict";

  exports.__esModule = true;

  exports.get_data = function () {
    return {
      "Pc": [[95, 95], [8255, 8256], [8276, 8276], [65075, 65076], [65101, 65103], [65343, 65343]],
      "Pe": [[41, 41], [93, 93], [125, 125], [3899, 3899], [3901, 3901], [5788, 5788], [8262, 8262], [8318, 8318], [8334, 8334], [8969, 8969], [8971, 8971], [9002, 9002], [10089, 10089], [10091, 10091], [10093, 10093], [10095, 10095], [10097, 10097], [10099, 10099], [10101, 10101], [10182, 10182], [10215, 10215], [10217, 10217], [10219, 10219], [10221, 10221], [10223, 10223], [10628, 10628], [10630, 10630], [10632, 10632], [10634, 10634], [10636, 10636], [10638, 10638], [10640, 10640], [10642, 10642], [10644, 10644], [10646, 10646], [10648, 10648], [10713, 10713], [10715, 10715], [10749, 10749], [11811, 11811], [11813, 11813], [11815, 11815], [11817, 11817], [12297, 12297], [12299, 12299], [12301, 12301], [12303, 12303], [12305, 12305], [12309, 12309], [12311, 12311], [12313, 12313], [12315, 12315], [12318, 12319], [64830, 64830], [65048, 65048], [65078, 65078], [65080, 65080], [65082, 65082], [65084, 65084], [65086, 65086], [65088, 65088], [65090, 65090], [65092, 65092], [65096, 65096], [65114, 65114], [65116, 65116], [65118, 65118], [65289, 65289], [65341, 65341], [65373, 65373], [65376, 65376], [65379, 65379]],
      "Ps": [[40, 40], [91, 91], [123, 123], [3898, 3898], [3900, 3900], [5787, 5787], [8218, 8218], [8222, 8222], [8261, 8261], [8317, 8317], [8333, 8333], [8968, 8968], [8970, 8970], [9001, 9001], [10088, 10088], [10090, 10090], [10092, 10092], [10094, 10094], [10096, 10096], [10098, 10098], [10100, 10100], [10181, 10181], [10214, 10214], [10216, 10216], [10218, 10218], [10220, 10220], [10222, 10222], [10627, 10627], [10629, 10629], [10631, 10631], [10633, 10633], [10635, 10635], [10637, 10637], [10639, 10639], [10641, 10641], [10643, 10643], [10645, 10645], [10647, 10647], [10712, 10712], [10714, 10714], [10748, 10748], [11810, 11810], [11812, 11812], [11814, 11814], [11816, 11816], [11842, 11842], [12296, 12296], [12298, 12298], [12300, 12300], [12302, 12302], [12304, 12304], [12308, 12308], [12310, 12310], [12312, 12312], [12314, 12314], [12317, 12317], [64831, 64831], [65047, 65047], [65077, 65077], [65079, 65079], [65081, 65081], [65083, 65083], [65085, 65085], [65087, 65087], [65089, 65089], [65091, 65091], [65095, 65095], [65113, 65113], [65115, 65115], [65117, 65117], [65288, 65288], [65339, 65339], [65371, 65371], [65375, 65375], [65378, 65378]],
      "Lm": [[688, 705], [710, 721], [736, 740], [748, 748], [750, 750], [884, 884], [890, 890], [1369, 1369], [1600, 1600], [1765, 1766], [2036, 2037], [2042, 2042], [2074, 2074], [2084, 2084], [2088, 2088], [2417, 2417], [3654, 3654], [3782, 3782], [4348, 4348], [6103, 6103], [6211, 6211], [6823, 6823], [7288, 7293], [7468, 7530], [7544, 7544], [7579, 7615], [8305, 8305], [8319, 8319], [8336, 8348], [11388, 11389], [11631, 11631], [11823, 11823], [12293, 12293], [12337, 12341], [12347, 12347], [12445, 12446], [12540, 12542], [40981, 40981], [42232, 42237], [42508, 42508], [42623, 42623], [42652, 42653], [42775, 42783], [42864, 42864], [42888, 42888], [43000, 43001], [43471, 43471], [43494, 43494], [43632, 43632], [43741, 43741], [43763, 43764], [43868, 43871], [65392, 65392], [65438, 65439]],
      "Mc": [[2307, 2307], [2363, 2363], [2366, 2368], [2377, 2380], [2382, 2383], [2434, 2435], [2494, 2496], [2503, 2504], [2507, 2508], [2519, 2519], [2563, 2563], [2622, 2624], [2691, 2691], [2750, 2752], [2761, 2761], [2763, 2764], [2818, 2819], [2878, 2878], [2880, 2880], [2887, 2888], [2891, 2892], [2903, 2903], [3006, 3007], [3009, 3010], [3014, 3016], [3018, 3020], [3031, 3031], [3073, 3075], [3137, 3140], [3202, 3203], [3262, 3262], [3264, 3268], [3271, 3272], [3274, 3275], [3285, 3286], [3330, 3331], [3390, 3392], [3398, 3400], [3402, 3404], [3415, 3415], [3458, 3459], [3535, 3537], [3544, 3551], [3570, 3571], [3902, 3903], [3967, 3967], [4139, 4140], [4145, 4145], [4152, 4152], [4155, 4156], [4182, 4183], [4194, 4196], [4199, 4205], [4227, 4228], [4231, 4236], [4239, 4239], [4250, 4252], [6070, 6070], [6078, 6085], [6087, 6088], [6435, 6438], [6441, 6443], [6448, 6449], [6451, 6456], [6681, 6682], [6741, 6741], [6743, 6743], [6753, 6753], [6755, 6756], [6765, 6770], [6916, 6916], [6965, 6965], [6971, 6971], [6973, 6977], [6979, 6980], [7042, 7042], [7073, 7073], [7078, 7079], [7082, 7082], [7143, 7143], [7146, 7148], [7150, 7150], [7154, 7155], [7204, 7211], [7220, 7221], [7393, 7393], [7410, 7411], [7415, 7415], [12334, 12335], [43043, 43044], [43047, 43047], [43136, 43137], [43188, 43203], [43346, 43347], [43395, 43395], [43444, 43445], [43450, 43451], [43453, 43456], [43567, 43568], [43571, 43572], [43597, 43597], [43643, 43643], [43645, 43645], [43755, 43755], [43758, 43759], [43765, 43765], [44003, 44004], [44006, 44007], [44009, 44010], [44012, 44012]],
      "Zp": [[8233, 8233]],
      "Sc": [[36, 36], [162, 165], [1423, 1423], [1547, 1547], [2546, 2547], [2555, 2555], [2801, 2801], [3065, 3065], [3647, 3647], [6107, 6107], [8352, 8383], [43064, 43064], [65020, 65020], [65129, 65129], [65284, 65284], [65504, 65505], [65509, 65510]],
      "Me": [[1160, 1161], [6846, 6846], [8413, 8416], [8418, 8420], [42608, 42610]],
      "Sk": [[94, 94], [96, 96], [168, 168], [175, 175], [180, 180], [184, 184], [706, 709], [722, 735], [741, 747], [749, 749], [751, 767], [885, 885], [900, 901], [8125, 8125], [8127, 8129], [8141, 8143], [8157, 8159], [8173, 8175], [8189, 8190], [12443, 12444], [42752, 42774], [42784, 42785], [42889, 42890], [43867, 43867], [64434, 64449], [65342, 65342], [65344, 65344], [65507, 65507]],
      "Cs": [[55296, 55296], [56191, 56192], [56319, 56320], [57343, 57343]],
      "Nl": [[5870, 5872], [8544, 8578], [8581, 8584], [12295, 12295], [12321, 12329], [12344, 12346], [42726, 42735]],
      "So": [[166, 166], [169, 169], [174, 174], [176, 176], [1154, 1154], [1421, 1422], [1550, 1551], [1758, 1758], [1769, 1769], [1789, 1790], [2038, 2038], [2554, 2554], [2928, 2928], [3059, 3064], [3066, 3066], [3199, 3199], [3407, 3407], [3449, 3449], [3841, 3843], [3859, 3859], [3861, 3863], [3866, 3871], [3892, 3892], [3894, 3894], [3896, 3896], [4030, 4037], [4039, 4044], [4046, 4047], [4053, 4056], [4254, 4255], [5008, 5017], [6464, 6464], [6622, 6655], [7009, 7018], [7028, 7036], [8448, 8449], [8451, 8454], [8456, 8457], [8468, 8468], [8470, 8471], [8478, 8483], [8485, 8485], [8487, 8487], [8489, 8489], [8494, 8494], [8506, 8507], [8522, 8522], [8524, 8525], [8527, 8527], [8586, 8587], [8597, 8601], [8604, 8607], [8609, 8610], [8612, 8613], [8615, 8621], [8623, 8653], [8656, 8657], [8659, 8659], [8661, 8691], [8960, 8967], [8972, 8991], [8994, 9000], [9003, 9083], [9085, 9114], [9140, 9179], [9186, 9254], [9280, 9290], [9372, 9449], [9472, 9654], [9656, 9664], [9666, 9719], [9728, 9838], [9840, 10087], [10132, 10175], [10240, 10495], [11008, 11055], [11077, 11078], [11085, 11123], [11126, 11157], [11160, 11193], [11197, 11208], [11210, 11218], [11244, 11247], [11493, 11498], [11904, 11929], [11931, 12019], [12032, 12245], [12272, 12283], [12292, 12292], [12306, 12307], [12320, 12320], [12342, 12343], [12350, 12351], [12688, 12689], [12694, 12703], [12736, 12771], [12800, 12830], [12842, 12871], [12880, 12880], [12896, 12927], [12938, 12976], [12992, 13054], [13056, 13311], [19904, 19967], [42128, 42182], [43048, 43051], [43062, 43063], [43065, 43065], [43639, 43641], [65021, 65021], [65508, 65508], [65512, 65512], [65517, 65518], [65532, 65533]],
      "Lt": [[453, 453], [456, 456], [459, 459], [498, 498], [8072, 8079], [8088, 8095], [8104, 8111], [8124, 8124], [8140, 8140], [8188, 8188]],
      "Zl": [[8232, 8232]],
      "Lo": [[170, 170], [186, 186], [443, 443], [448, 451], [660, 660], [1488, 1514], [1520, 1522], [1568, 1599], [1601, 1610], [1646, 1647], [1649, 1747], [1749, 1749], [1774, 1775], [1786, 1788], [1791, 1791], [1808, 1808], [1810, 1839], [1869, 1957], [1969, 1969], [1994, 2026], [2048, 2069], [2112, 2136], [2144, 2154], [2208, 2228], [2230, 2237], [2308, 2361], [2365, 2365], [2384, 2384], [2392, 2401], [2418, 2432], [2437, 2444], [2447, 2448], [2451, 2472], [2474, 2480], [2482, 2482], [2486, 2489], [2493, 2493], [2510, 2510], [2524, 2525], [2527, 2529], [2544, 2545], [2556, 2556], [2565, 2570], [2575, 2576], [2579, 2600], [2602, 2608], [2610, 2611], [2613, 2614], [2616, 2617], [2649, 2652], [2654, 2654], [2674, 2676], [2693, 2701], [2703, 2705], [2707, 2728], [2730, 2736], [2738, 2739], [2741, 2745], [2749, 2749], [2768, 2768], [2784, 2785], [2809, 2809], [2821, 2828], [2831, 2832], [2835, 2856], [2858, 2864], [2866, 2867], [2869, 2873], [2877, 2877], [2908, 2909], [2911, 2913], [2929, 2929], [2947, 2947], [2949, 2954], [2958, 2960], [2962, 2965], [2969, 2970], [2972, 2972], [2974, 2975], [2979, 2980], [2984, 2986], [2990, 3001], [3024, 3024], [3077, 3084], [3086, 3088], [3090, 3112], [3114, 3129], [3133, 3133], [3160, 3162], [3168, 3169], [3200, 3200], [3205, 3212], [3214, 3216], [3218, 3240], [3242, 3251], [3253, 3257], [3261, 3261], [3294, 3294], [3296, 3297], [3313, 3314], [3333, 3340], [3342, 3344], [3346, 3386], [3389, 3389], [3406, 3406], [3412, 3414], [3423, 3425], [3450, 3455], [3461, 3478], [3482, 3505], [3507, 3515], [3517, 3517], [3520, 3526], [3585, 3632], [3634, 3635], [3648, 3653], [3713, 3714], [3716, 3716], [3719, 3720], [3722, 3722], [3725, 3725], [3732, 3735], [3737, 3743], [3745, 3747], [3749, 3749], [3751, 3751], [3754, 3755], [3757, 3760], [3762, 3763], [3773, 3773], [3776, 3780], [3804, 3807], [3840, 3840], [3904, 3911], [3913, 3948], [3976, 3980], [4096, 4138], [4159, 4159], [4176, 4181], [4186, 4189], [4193, 4193], [4197, 4198], [4206, 4208], [4213, 4225], [4238, 4238], [4304, 4346], [4349, 4680], [4682, 4685], [4688, 4694], [4696, 4696], [4698, 4701], [4704, 4744], [4746, 4749], [4752, 4784], [4786, 4789], [4792, 4798], [4800, 4800], [4802, 4805], [4808, 4822], [4824, 4880], [4882, 4885], [4888, 4954], [4992, 5007], [5121, 5740], [5743, 5759], [5761, 5786], [5792, 5866], [5873, 5880], [5888, 5900], [5902, 5905], [5920, 5937], [5952, 5969], [5984, 5996], [5998, 6000], [6016, 6067], [6108, 6108], [6176, 6210], [6212, 6263], [6272, 6276], [6279, 6312], [6314, 6314], [6320, 6389], [6400, 6430], [6480, 6509], [6512, 6516], [6528, 6571], [6576, 6601], [6656, 6678], [6688, 6740], [6917, 6963], [6981, 6987], [7043, 7072], [7086, 7087], [7098, 7141], [7168, 7203], [7245, 7247], [7258, 7287], [7401, 7404], [7406, 7409], [7413, 7414], [8501, 8504], [11568, 11623], [11648, 11670], [11680, 11686], [11688, 11694], [11696, 11702], [11704, 11710], [11712, 11718], [11720, 11726], [11728, 11734], [11736, 11742], [12294, 12294], [12348, 12348], [12353, 12438], [12447, 12447], [12449, 12538], [12543, 12543], [12549, 12590], [12593, 12686], [12704, 12730], [12784, 12799], [13312, 13312], [19893, 19893], [19968, 19968], [40938, 40938], [40960, 40980], [40982, 42124], [42192, 42231], [42240, 42507], [42512, 42527], [42538, 42539], [42606, 42606], [42656, 42725], [42895, 42895], [42999, 42999], [43003, 43009], [43011, 43013], [43015, 43018], [43020, 43042], [43072, 43123], [43138, 43187], [43250, 43255], [43259, 43259], [43261, 43261], [43274, 43301], [43312, 43334], [43360, 43388], [43396, 43442], [43488, 43492], [43495, 43503], [43514, 43518], [43520, 43560], [43584, 43586], [43588, 43595], [43616, 43631], [43633, 43638], [43642, 43642], [43646, 43695], [43697, 43697], [43701, 43702], [43705, 43709], [43712, 43712], [43714, 43714], [43739, 43740], [43744, 43754], [43762, 43762], [43777, 43782], [43785, 43790], [43793, 43798], [43808, 43814], [43816, 43822], [43968, 44002], [44032, 44032], [55203, 55203], [55216, 55238], [55243, 55291], [63744, 64109], [64112, 64217], [64285, 64285], [64287, 64296], [64298, 64310], [64312, 64316], [64318, 64318], [64320, 64321], [64323, 64324], [64326, 64433], [64467, 64829], [64848, 64911], [64914, 64967], [65008, 65019], [65136, 65140], [65142, 65276], [65382, 65391], [65393, 65437], [65440, 65470], [65474, 65479], [65482, 65487], [65490, 65495], [65498, 65500]],
      "Mn": [[768, 879], [1155, 1159], [1425, 1469], [1471, 1471], [1473, 1474], [1476, 1477], [1479, 1479], [1552, 1562], [1611, 1631], [1648, 1648], [1750, 1756], [1759, 1764], [1767, 1768], [1770, 1773], [1809, 1809], [1840, 1866], [1958, 1968], [2027, 2035], [2070, 2073], [2075, 2083], [2085, 2087], [2089, 2093], [2137, 2139], [2260, 2273], [2275, 2306], [2362, 2362], [2364, 2364], [2369, 2376], [2381, 2381], [2385, 2391], [2402, 2403], [2433, 2433], [2492, 2492], [2497, 2500], [2509, 2509], [2530, 2531], [2561, 2562], [2620, 2620], [2625, 2626], [2631, 2632], [2635, 2637], [2641, 2641], [2672, 2673], [2677, 2677], [2689, 2690], [2748, 2748], [2753, 2757], [2759, 2760], [2765, 2765], [2786, 2787], [2810, 2815], [2817, 2817], [2876, 2876], [2879, 2879], [2881, 2884], [2893, 2893], [2902, 2902], [2914, 2915], [2946, 2946], [3008, 3008], [3021, 3021], [3072, 3072], [3134, 3136], [3142, 3144], [3146, 3149], [3157, 3158], [3170, 3171], [3201, 3201], [3260, 3260], [3263, 3263], [3270, 3270], [3276, 3277], [3298, 3299], [3328, 3329], [3387, 3388], [3393, 3396], [3405, 3405], [3426, 3427], [3530, 3530], [3538, 3540], [3542, 3542], [3633, 3633], [3636, 3642], [3655, 3662], [3761, 3761], [3764, 3769], [3771, 3772], [3784, 3789], [3864, 3865], [3893, 3893], [3895, 3895], [3897, 3897], [3953, 3966], [3968, 3972], [3974, 3975], [3981, 3991], [3993, 4028], [4038, 4038], [4141, 4144], [4146, 4151], [4153, 4154], [4157, 4158], [4184, 4185], [4190, 4192], [4209, 4212], [4226, 4226], [4229, 4230], [4237, 4237], [4253, 4253], [4957, 4959], [5906, 5908], [5938, 5940], [5970, 5971], [6002, 6003], [6068, 6069], [6071, 6077], [6086, 6086], [6089, 6099], [6109, 6109], [6155, 6157], [6277, 6278], [6313, 6313], [6432, 6434], [6439, 6440], [6450, 6450], [6457, 6459], [6679, 6680], [6683, 6683], [6742, 6742], [6744, 6750], [6752, 6752], [6754, 6754], [6757, 6764], [6771, 6780], [6783, 6783], [6832, 6845], [6912, 6915], [6964, 6964], [6966, 6970], [6972, 6972], [6978, 6978], [7019, 7027], [7040, 7041], [7074, 7077], [7080, 7081], [7083, 7085], [7142, 7142], [7144, 7145], [7149, 7149], [7151, 7153], [7212, 7219], [7222, 7223], [7376, 7378], [7380, 7392], [7394, 7400], [7405, 7405], [7412, 7412], [7416, 7417], [7616, 7673], [7675, 7679], [8400, 8412], [8417, 8417], [8421, 8432], [11503, 11505], [11647, 11647], [11744, 11775], [12330, 12333], [12441, 12442], [42607, 42607], [42612, 42621], [42654, 42655], [42736, 42737], [43010, 43010], [43014, 43014], [43019, 43019], [43045, 43046], [43204, 43205], [43232, 43249], [43302, 43309], [43335, 43345], [43392, 43394], [43443, 43443], [43446, 43449], [43452, 43452], [43493, 43493], [43561, 43566], [43569, 43570], [43573, 43574], [43587, 43587], [43596, 43596], [43644, 43644], [43696, 43696], [43698, 43700], [43703, 43704], [43710, 43711], [43713, 43713], [43756, 43757], [43766, 43766], [44005, 44005], [44008, 44008], [44013, 44013], [64286, 64286], [65024, 65039], [65056, 65071]],
      "Po": [[33, 35], [37, 39], [42, 42], [44, 44], [46, 47], [58, 59], [63, 64], [92, 92], [161, 161], [167, 167], [182, 183], [191, 191], [894, 894], [903, 903], [1370, 1375], [1417, 1417], [1472, 1472], [1475, 1475], [1478, 1478], [1523, 1524], [1545, 1546], [1548, 1549], [1563, 1563], [1566, 1567], [1642, 1645], [1748, 1748], [1792, 1805], [2039, 2041], [2096, 2110], [2142, 2142], [2404, 2405], [2416, 2416], [2557, 2557], [2800, 2800], [3572, 3572], [3663, 3663], [3674, 3675], [3844, 3858], [3860, 3860], [3973, 3973], [4048, 4052], [4057, 4058], [4170, 4175], [4347, 4347], [4960, 4968], [5741, 5742], [5867, 5869], [5941, 5942], [6100, 6102], [6104, 6106], [6144, 6149], [6151, 6154], [6468, 6469], [6686, 6687], [6816, 6822], [6824, 6829], [7002, 7008], [7164, 7167], [7227, 7231], [7294, 7295], [7360, 7367], [7379, 7379], [8214, 8215], [8224, 8231], [8240, 8248], [8251, 8254], [8257, 8259], [8263, 8273], [8275, 8275], [8277, 8286], [11513, 11516], [11518, 11519], [11632, 11632], [11776, 11777], [11782, 11784], [11787, 11787], [11790, 11798], [11800, 11801], [11803, 11803], [11806, 11807], [11818, 11822], [11824, 11833], [11836, 11839], [11841, 11841], [11843, 11849], [12289, 12291], [12349, 12349], [12539, 12539], [42238, 42239], [42509, 42511], [42611, 42611], [42622, 42622], [42738, 42743], [43124, 43127], [43214, 43215], [43256, 43258], [43260, 43260], [43310, 43311], [43359, 43359], [43457, 43469], [43486, 43487], [43612, 43615], [43742, 43743], [43760, 43761], [44011, 44011], [65040, 65046], [65049, 65049], [65072, 65072], [65093, 65094], [65097, 65100], [65104, 65106], [65108, 65111], [65119, 65121], [65128, 65128], [65130, 65131], [65281, 65283], [65285, 65287], [65290, 65290], [65292, 65292], [65294, 65295], [65306, 65307], [65311, 65312], [65340, 65340], [65377, 65377], [65380, 65381]],
      "Co": [[57344, 57344], [63743, 63743]],
      "Sm": [[43, 43], [60, 62], [124, 124], [126, 126], [172, 172], [177, 177], [215, 215], [247, 247], [1014, 1014], [1542, 1544], [8260, 8260], [8274, 8274], [8314, 8316], [8330, 8332], [8472, 8472], [8512, 8516], [8523, 8523], [8592, 8596], [8602, 8603], [8608, 8608], [8611, 8611], [8614, 8614], [8622, 8622], [8654, 8655], [8658, 8658], [8660, 8660], [8692, 8959], [8992, 8993], [9084, 9084], [9115, 9139], [9180, 9185], [9655, 9655], [9665, 9665], [9720, 9727], [9839, 9839], [10176, 10180], [10183, 10213], [10224, 10239], [10496, 10626], [10649, 10711], [10716, 10747], [10750, 11007], [11056, 11076], [11079, 11084], [64297, 64297], [65122, 65122], [65124, 65126], [65291, 65291], [65308, 65310], [65372, 65372], [65374, 65374], [65506, 65506], [65513, 65516]],
      "Pf": [[187, 187], [8217, 8217], [8221, 8221], [8250, 8250], [11779, 11779], [11781, 11781], [11786, 11786], [11789, 11789], [11805, 11805], [11809, 11809]],
      "Cc": [[0, 31], [127, 159]],
      "Pi": [[171, 171], [8216, 8216], [8219, 8220], [8223, 8223], [8249, 8249], [11778, 11778], [11780, 11780], [11785, 11785], [11788, 11788], [11804, 11804], [11808, 11808]],
      "Lu": [[65, 90], [192, 214], [216, 222], [256, 256], [258, 258], [260, 260], [262, 262], [264, 264], [266, 266], [268, 268], [270, 270], [272, 272], [274, 274], [276, 276], [278, 278], [280, 280], [282, 282], [284, 284], [286, 286], [288, 288], [290, 290], [292, 292], [294, 294], [296, 296], [298, 298], [300, 300], [302, 302], [304, 304], [306, 306], [308, 308], [310, 310], [313, 313], [315, 315], [317, 317], [319, 319], [321, 321], [323, 323], [325, 325], [327, 327], [330, 330], [332, 332], [334, 334], [336, 336], [338, 338], [340, 340], [342, 342], [344, 344], [346, 346], [348, 348], [350, 350], [352, 352], [354, 354], [356, 356], [358, 358], [360, 360], [362, 362], [364, 364], [366, 366], [368, 368], [370, 370], [372, 372], [374, 374], [376, 377], [379, 379], [381, 381], [385, 386], [388, 388], [390, 391], [393, 395], [398, 401], [403, 404], [406, 408], [412, 413], [415, 416], [418, 418], [420, 420], [422, 423], [425, 425], [428, 428], [430, 431], [433, 435], [437, 437], [439, 440], [444, 444], [452, 452], [455, 455], [458, 458], [461, 461], [463, 463], [465, 465], [467, 467], [469, 469], [471, 471], [473, 473], [475, 475], [478, 478], [480, 480], [482, 482], [484, 484], [486, 486], [488, 488], [490, 490], [492, 492], [494, 494], [497, 497], [500, 500], [502, 504], [506, 506], [508, 508], [510, 510], [512, 512], [514, 514], [516, 516], [518, 518], [520, 520], [522, 522], [524, 524], [526, 526], [528, 528], [530, 530], [532, 532], [534, 534], [536, 536], [538, 538], [540, 540], [542, 542], [544, 544], [546, 546], [548, 548], [550, 550], [552, 552], [554, 554], [556, 556], [558, 558], [560, 560], [562, 562], [570, 571], [573, 574], [577, 577], [579, 582], [584, 584], [586, 586], [588, 588], [590, 590], [880, 880], [882, 882], [886, 886], [895, 895], [902, 902], [904, 906], [908, 908], [910, 911], [913, 929], [931, 939], [975, 975], [978, 980], [984, 984], [986, 986], [988, 988], [990, 990], [992, 992], [994, 994], [996, 996], [998, 998], [1000, 1000], [1002, 1002], [1004, 1004], [1006, 1006], [1012, 1012], [1015, 1015], [1017, 1018], [1021, 1071], [1120, 1120], [1122, 1122], [1124, 1124], [1126, 1126], [1128, 1128], [1130, 1130], [1132, 1132], [1134, 1134], [1136, 1136], [1138, 1138], [1140, 1140], [1142, 1142], [1144, 1144], [1146, 1146], [1148, 1148], [1150, 1150], [1152, 1152], [1162, 1162], [1164, 1164], [1166, 1166], [1168, 1168], [1170, 1170], [1172, 1172], [1174, 1174], [1176, 1176], [1178, 1178], [1180, 1180], [1182, 1182], [1184, 1184], [1186, 1186], [1188, 1188], [1190, 1190], [1192, 1192], [1194, 1194], [1196, 1196], [1198, 1198], [1200, 1200], [1202, 1202], [1204, 1204], [1206, 1206], [1208, 1208], [1210, 1210], [1212, 1212], [1214, 1214], [1216, 1217], [1219, 1219], [1221, 1221], [1223, 1223], [1225, 1225], [1227, 1227], [1229, 1229], [1232, 1232], [1234, 1234], [1236, 1236], [1238, 1238], [1240, 1240], [1242, 1242], [1244, 1244], [1246, 1246], [1248, 1248], [1250, 1250], [1252, 1252], [1254, 1254], [1256, 1256], [1258, 1258], [1260, 1260], [1262, 1262], [1264, 1264], [1266, 1266], [1268, 1268], [1270, 1270], [1272, 1272], [1274, 1274], [1276, 1276], [1278, 1278], [1280, 1280], [1282, 1282], [1284, 1284], [1286, 1286], [1288, 1288], [1290, 1290], [1292, 1292], [1294, 1294], [1296, 1296], [1298, 1298], [1300, 1300], [1302, 1302], [1304, 1304], [1306, 1306], [1308, 1308], [1310, 1310], [1312, 1312], [1314, 1314], [1316, 1316], [1318, 1318], [1320, 1320], [1322, 1322], [1324, 1324], [1326, 1326], [1329, 1366], [4256, 4293], [4295, 4295], [4301, 4301], [5024, 5109], [7680, 7680], [7682, 7682], [7684, 7684], [7686, 7686], [7688, 7688], [7690, 7690], [7692, 7692], [7694, 7694], [7696, 7696], [7698, 7698], [7700, 7700], [7702, 7702], [7704, 7704], [7706, 7706], [7708, 7708], [7710, 7710], [7712, 7712], [7714, 7714], [7716, 7716], [7718, 7718], [7720, 7720], [7722, 7722], [7724, 7724], [7726, 7726], [7728, 7728], [7730, 7730], [7732, 7732], [7734, 7734], [7736, 7736], [7738, 7738], [7740, 7740], [7742, 7742], [7744, 7744], [7746, 7746], [7748, 7748], [7750, 7750], [7752, 7752], [7754, 7754], [7756, 7756], [7758, 7758], [7760, 7760], [7762, 7762], [7764, 7764], [7766, 7766], [7768, 7768], [7770, 7770], [7772, 7772], [7774, 7774], [7776, 7776], [7778, 7778], [7780, 7780], [7782, 7782], [7784, 7784], [7786, 7786], [7788, 7788], [7790, 7790], [7792, 7792], [7794, 7794], [7796, 7796], [7798, 7798], [7800, 7800], [7802, 7802], [7804, 7804], [7806, 7806], [7808, 7808], [7810, 7810], [7812, 7812], [7814, 7814], [7816, 7816], [7818, 7818], [7820, 7820], [7822, 7822], [7824, 7824], [7826, 7826], [7828, 7828], [7838, 7838], [7840, 7840], [7842, 7842], [7844, 7844], [7846, 7846], [7848, 7848], [7850, 7850], [7852, 7852], [7854, 7854], [7856, 7856], [7858, 7858], [7860, 7860], [7862, 7862], [7864, 7864], [7866, 7866], [7868, 7868], [7870, 7870], [7872, 7872], [7874, 7874], [7876, 7876], [7878, 7878], [7880, 7880], [7882, 7882], [7884, 7884], [7886, 7886], [7888, 7888], [7890, 7890], [7892, 7892], [7894, 7894], [7896, 7896], [7898, 7898], [7900, 7900], [7902, 7902], [7904, 7904], [7906, 7906], [7908, 7908], [7910, 7910], [7912, 7912], [7914, 7914], [7916, 7916], [7918, 7918], [7920, 7920], [7922, 7922], [7924, 7924], [7926, 7926], [7928, 7928], [7930, 7930], [7932, 7932], [7934, 7934], [7944, 7951], [7960, 7965], [7976, 7983], [7992, 7999], [8008, 8013], [8025, 8025], [8027, 8027], [8029, 8029], [8031, 8031], [8040, 8047], [8120, 8123], [8136, 8139], [8152, 8155], [8168, 8172], [8184, 8187], [8450, 8450], [8455, 8455], [8459, 8461], [8464, 8466], [8469, 8469], [8473, 8477], [8484, 8484], [8486, 8486], [8488, 8488], [8490, 8493], [8496, 8499], [8510, 8511], [8517, 8517], [8579, 8579], [11264, 11310], [11360, 11360], [11362, 11364], [11367, 11367], [11369, 11369], [11371, 11371], [11373, 11376], [11378, 11378], [11381, 11381], [11390, 11392], [11394, 11394], [11396, 11396], [11398, 11398], [11400, 11400], [11402, 11402], [11404, 11404], [11406, 11406], [11408, 11408], [11410, 11410], [11412, 11412], [11414, 11414], [11416, 11416], [11418, 11418], [11420, 11420], [11422, 11422], [11424, 11424], [11426, 11426], [11428, 11428], [11430, 11430], [11432, 11432], [11434, 11434], [11436, 11436], [11438, 11438], [11440, 11440], [11442, 11442], [11444, 11444], [11446, 11446], [11448, 11448], [11450, 11450], [11452, 11452], [11454, 11454], [11456, 11456], [11458, 11458], [11460, 11460], [11462, 11462], [11464, 11464], [11466, 11466], [11468, 11468], [11470, 11470], [11472, 11472], [11474, 11474], [11476, 11476], [11478, 11478], [11480, 11480], [11482, 11482], [11484, 11484], [11486, 11486], [11488, 11488], [11490, 11490], [11499, 11499], [11501, 11501], [11506, 11506], [42560, 42560], [42562, 42562], [42564, 42564], [42566, 42566], [42568, 42568], [42570, 42570], [42572, 42572], [42574, 42574], [42576, 42576], [42578, 42578], [42580, 42580], [42582, 42582], [42584, 42584], [42586, 42586], [42588, 42588], [42590, 42590], [42592, 42592], [42594, 42594], [42596, 42596], [42598, 42598], [42600, 42600], [42602, 42602], [42604, 42604], [42624, 42624], [42626, 42626], [42628, 42628], [42630, 42630], [42632, 42632], [42634, 42634], [42636, 42636], [42638, 42638], [42640, 42640], [42642, 42642], [42644, 42644], [42646, 42646], [42648, 42648], [42650, 42650], [42786, 42786], [42788, 42788], [42790, 42790], [42792, 42792], [42794, 42794], [42796, 42796], [42798, 42798], [42802, 42802], [42804, 42804], [42806, 42806], [42808, 42808], [42810, 42810], [42812, 42812], [42814, 42814], [42816, 42816], [42818, 42818], [42820, 42820], [42822, 42822], [42824, 42824], [42826, 42826], [42828, 42828], [42830, 42830], [42832, 42832], [42834, 42834], [42836, 42836], [42838, 42838], [42840, 42840], [42842, 42842], [42844, 42844], [42846, 42846], [42848, 42848], [42850, 42850], [42852, 42852], [42854, 42854], [42856, 42856], [42858, 42858], [42860, 42860], [42862, 42862], [42873, 42873], [42875, 42875], [42877, 42878], [42880, 42880], [42882, 42882], [42884, 42884], [42886, 42886], [42891, 42891], [42893, 42893], [42896, 42896], [42898, 42898], [42902, 42902], [42904, 42904], [42906, 42906], [42908, 42908], [42910, 42910], [42912, 42912], [42914, 42914], [42916, 42916], [42918, 42918], [42920, 42920], [42922, 42926], [42928, 42932], [42934, 42934], [65313, 65338]],
      "Pd": [[45, 45], [1418, 1418], [1470, 1470], [5120, 5120], [6150, 6150], [8208, 8213], [11799, 11799], [11802, 11802], [11834, 11835], [11840, 11840], [12316, 12316], [12336, 12336], [12448, 12448], [65073, 65074], [65112, 65112], [65123, 65123], [65293, 65293]],
      "Cf": [[173, 173], [1536, 1541], [1564, 1564], [1757, 1757], [1807, 1807], [2274, 2274], [6158, 6158], [8203, 8207], [8234, 8238], [8288, 8292], [8294, 8303], [65279, 65279], [65529, 65531]],
      "Nd": [[48, 57], [1632, 1641], [1776, 1785], [1984, 1993], [2406, 2415], [2534, 2543], [2662, 2671], [2790, 2799], [2918, 2927], [3046, 3055], [3174, 3183], [3302, 3311], [3430, 3439], [3558, 3567], [3664, 3673], [3792, 3801], [3872, 3881], [4160, 4169], [4240, 4249], [6112, 6121], [6160, 6169], [6470, 6479], [6608, 6617], [6784, 6793], [6800, 6809], [6992, 7001], [7088, 7097], [7232, 7241], [7248, 7257], [42528, 42537], [43216, 43225], [43264, 43273], [43472, 43481], [43504, 43513], [43600, 43609], [44016, 44025], [65296, 65305]],
      "Ll": [[97, 122], [181, 181], [223, 246], [248, 255], [257, 257], [259, 259], [261, 261], [263, 263], [265, 265], [267, 267], [269, 269], [271, 271], [273, 273], [275, 275], [277, 277], [279, 279], [281, 281], [283, 283], [285, 285], [287, 287], [289, 289], [291, 291], [293, 293], [295, 295], [297, 297], [299, 299], [301, 301], [303, 303], [305, 305], [307, 307], [309, 309], [311, 312], [314, 314], [316, 316], [318, 318], [320, 320], [322, 322], [324, 324], [326, 326], [328, 329], [331, 331], [333, 333], [335, 335], [337, 337], [339, 339], [341, 341], [343, 343], [345, 345], [347, 347], [349, 349], [351, 351], [353, 353], [355, 355], [357, 357], [359, 359], [361, 361], [363, 363], [365, 365], [367, 367], [369, 369], [371, 371], [373, 373], [375, 375], [378, 378], [380, 380], [382, 384], [387, 387], [389, 389], [392, 392], [396, 397], [402, 402], [405, 405], [409, 411], [414, 414], [417, 417], [419, 419], [421, 421], [424, 424], [426, 427], [429, 429], [432, 432], [436, 436], [438, 438], [441, 442], [445, 447], [454, 454], [457, 457], [460, 460], [462, 462], [464, 464], [466, 466], [468, 468], [470, 470], [472, 472], [474, 474], [476, 477], [479, 479], [481, 481], [483, 483], [485, 485], [487, 487], [489, 489], [491, 491], [493, 493], [495, 496], [499, 499], [501, 501], [505, 505], [507, 507], [509, 509], [511, 511], [513, 513], [515, 515], [517, 517], [519, 519], [521, 521], [523, 523], [525, 525], [527, 527], [529, 529], [531, 531], [533, 533], [535, 535], [537, 537], [539, 539], [541, 541], [543, 543], [545, 545], [547, 547], [549, 549], [551, 551], [553, 553], [555, 555], [557, 557], [559, 559], [561, 561], [563, 569], [572, 572], [575, 576], [578, 578], [583, 583], [585, 585], [587, 587], [589, 589], [591, 659], [661, 687], [881, 881], [883, 883], [887, 887], [891, 893], [912, 912], [940, 974], [976, 977], [981, 983], [985, 985], [987, 987], [989, 989], [991, 991], [993, 993], [995, 995], [997, 997], [999, 999], [1001, 1001], [1003, 1003], [1005, 1005], [1007, 1011], [1013, 1013], [1016, 1016], [1019, 1020], [1072, 1119], [1121, 1121], [1123, 1123], [1125, 1125], [1127, 1127], [1129, 1129], [1131, 1131], [1133, 1133], [1135, 1135], [1137, 1137], [1139, 1139], [1141, 1141], [1143, 1143], [1145, 1145], [1147, 1147], [1149, 1149], [1151, 1151], [1153, 1153], [1163, 1163], [1165, 1165], [1167, 1167], [1169, 1169], [1171, 1171], [1173, 1173], [1175, 1175], [1177, 1177], [1179, 1179], [1181, 1181], [1183, 1183], [1185, 1185], [1187, 1187], [1189, 1189], [1191, 1191], [1193, 1193], [1195, 1195], [1197, 1197], [1199, 1199], [1201, 1201], [1203, 1203], [1205, 1205], [1207, 1207], [1209, 1209], [1211, 1211], [1213, 1213], [1215, 1215], [1218, 1218], [1220, 1220], [1222, 1222], [1224, 1224], [1226, 1226], [1228, 1228], [1230, 1231], [1233, 1233], [1235, 1235], [1237, 1237], [1239, 1239], [1241, 1241], [1243, 1243], [1245, 1245], [1247, 1247], [1249, 1249], [1251, 1251], [1253, 1253], [1255, 1255], [1257, 1257], [1259, 1259], [1261, 1261], [1263, 1263], [1265, 1265], [1267, 1267], [1269, 1269], [1271, 1271], [1273, 1273], [1275, 1275], [1277, 1277], [1279, 1279], [1281, 1281], [1283, 1283], [1285, 1285], [1287, 1287], [1289, 1289], [1291, 1291], [1293, 1293], [1295, 1295], [1297, 1297], [1299, 1299], [1301, 1301], [1303, 1303], [1305, 1305], [1307, 1307], [1309, 1309], [1311, 1311], [1313, 1313], [1315, 1315], [1317, 1317], [1319, 1319], [1321, 1321], [1323, 1323], [1325, 1325], [1327, 1327], [1377, 1415], [5112, 5117], [7296, 7304], [7424, 7467], [7531, 7543], [7545, 7578], [7681, 7681], [7683, 7683], [7685, 7685], [7687, 7687], [7689, 7689], [7691, 7691], [7693, 7693], [7695, 7695], [7697, 7697], [7699, 7699], [7701, 7701], [7703, 7703], [7705, 7705], [7707, 7707], [7709, 7709], [7711, 7711], [7713, 7713], [7715, 7715], [7717, 7717], [7719, 7719], [7721, 7721], [7723, 7723], [7725, 7725], [7727, 7727], [7729, 7729], [7731, 7731], [7733, 7733], [7735, 7735], [7737, 7737], [7739, 7739], [7741, 7741], [7743, 7743], [7745, 7745], [7747, 7747], [7749, 7749], [7751, 7751], [7753, 7753], [7755, 7755], [7757, 7757], [7759, 7759], [7761, 7761], [7763, 7763], [7765, 7765], [7767, 7767], [7769, 7769], [7771, 7771], [7773, 7773], [7775, 7775], [7777, 7777], [7779, 7779], [7781, 7781], [7783, 7783], [7785, 7785], [7787, 7787], [7789, 7789], [7791, 7791], [7793, 7793], [7795, 7795], [7797, 7797], [7799, 7799], [7801, 7801], [7803, 7803], [7805, 7805], [7807, 7807], [7809, 7809], [7811, 7811], [7813, 7813], [7815, 7815], [7817, 7817], [7819, 7819], [7821, 7821], [7823, 7823], [7825, 7825], [7827, 7827], [7829, 7837], [7839, 7839], [7841, 7841], [7843, 7843], [7845, 7845], [7847, 7847], [7849, 7849], [7851, 7851], [7853, 7853], [7855, 7855], [7857, 7857], [7859, 7859], [7861, 7861], [7863, 7863], [7865, 7865], [7867, 7867], [7869, 7869], [7871, 7871], [7873, 7873], [7875, 7875], [7877, 7877], [7879, 7879], [7881, 7881], [7883, 7883], [7885, 7885], [7887, 7887], [7889, 7889], [7891, 7891], [7893, 7893], [7895, 7895], [7897, 7897], [7899, 7899], [7901, 7901], [7903, 7903], [7905, 7905], [7907, 7907], [7909, 7909], [7911, 7911], [7913, 7913], [7915, 7915], [7917, 7917], [7919, 7919], [7921, 7921], [7923, 7923], [7925, 7925], [7927, 7927], [7929, 7929], [7931, 7931], [7933, 7933], [7935, 7943], [7952, 7957], [7968, 7975], [7984, 7991], [8000, 8005], [8016, 8023], [8032, 8039], [8048, 8061], [8064, 8071], [8080, 8087], [8096, 8103], [8112, 8116], [8118, 8119], [8126, 8126], [8130, 8132], [8134, 8135], [8144, 8147], [8150, 8151], [8160, 8167], [8178, 8180], [8182, 8183], [8458, 8458], [8462, 8463], [8467, 8467], [8495, 8495], [8500, 8500], [8505, 8505], [8508, 8509], [8518, 8521], [8526, 8526], [8580, 8580], [11312, 11358], [11361, 11361], [11365, 11366], [11368, 11368], [11370, 11370], [11372, 11372], [11377, 11377], [11379, 11380], [11382, 11387], [11393, 11393], [11395, 11395], [11397, 11397], [11399, 11399], [11401, 11401], [11403, 11403], [11405, 11405], [11407, 11407], [11409, 11409], [11411, 11411], [11413, 11413], [11415, 11415], [11417, 11417], [11419, 11419], [11421, 11421], [11423, 11423], [11425, 11425], [11427, 11427], [11429, 11429], [11431, 11431], [11433, 11433], [11435, 11435], [11437, 11437], [11439, 11439], [11441, 11441], [11443, 11443], [11445, 11445], [11447, 11447], [11449, 11449], [11451, 11451], [11453, 11453], [11455, 11455], [11457, 11457], [11459, 11459], [11461, 11461], [11463, 11463], [11465, 11465], [11467, 11467], [11469, 11469], [11471, 11471], [11473, 11473], [11475, 11475], [11477, 11477], [11479, 11479], [11481, 11481], [11483, 11483], [11485, 11485], [11487, 11487], [11489, 11489], [11491, 11492], [11500, 11500], [11502, 11502], [11507, 11507], [11520, 11557], [11559, 11559], [11565, 11565], [42561, 42561], [42563, 42563], [42565, 42565], [42567, 42567], [42569, 42569], [42571, 42571], [42573, 42573], [42575, 42575], [42577, 42577], [42579, 42579], [42581, 42581], [42583, 42583], [42585, 42585], [42587, 42587], [42589, 42589], [42591, 42591], [42593, 42593], [42595, 42595], [42597, 42597], [42599, 42599], [42601, 42601], [42603, 42603], [42605, 42605], [42625, 42625], [42627, 42627], [42629, 42629], [42631, 42631], [42633, 42633], [42635, 42635], [42637, 42637], [42639, 42639], [42641, 42641], [42643, 42643], [42645, 42645], [42647, 42647], [42649, 42649], [42651, 42651], [42787, 42787], [42789, 42789], [42791, 42791], [42793, 42793], [42795, 42795], [42797, 42797], [42799, 42801], [42803, 42803], [42805, 42805], [42807, 42807], [42809, 42809], [42811, 42811], [42813, 42813], [42815, 42815], [42817, 42817], [42819, 42819], [42821, 42821], [42823, 42823], [42825, 42825], [42827, 42827], [42829, 42829], [42831, 42831], [42833, 42833], [42835, 42835], [42837, 42837], [42839, 42839], [42841, 42841], [42843, 42843], [42845, 42845], [42847, 42847], [42849, 42849], [42851, 42851], [42853, 42853], [42855, 42855], [42857, 42857], [42859, 42859], [42861, 42861], [42863, 42863], [42865, 42872], [42874, 42874], [42876, 42876], [42879, 42879], [42881, 42881], [42883, 42883], [42885, 42885], [42887, 42887], [42892, 42892], [42894, 42894], [42897, 42897], [42899, 42901], [42903, 42903], [42905, 42905], [42907, 42907], [42909, 42909], [42911, 42911], [42913, 42913], [42915, 42915], [42917, 42917], [42919, 42919], [42921, 42921], [42933, 42933], [42935, 42935], [43002, 43002], [43824, 43866], [43872, 43877], [43888, 43967], [64256, 64262], [64275, 64279], [65345, 65370]],
      "No": [[178, 179], [185, 185], [188, 190], [2548, 2553], [2930, 2935], [3056, 3058], [3192, 3198], [3416, 3422], [3440, 3448], [3882, 3891], [4969, 4988], [6128, 6137], [6618, 6618], [8304, 8304], [8308, 8313], [8320, 8329], [8528, 8543], [8585, 8585], [9312, 9371], [9450, 9471], [10102, 10131], [11517, 11517], [12690, 12693], [12832, 12841], [12872, 12879], [12881, 12895], [12928, 12937], [12977, 12991], [43056, 43061]],
      "Zs": [[32, 32], [160, 160], [5760, 5760], [8192, 8202], [8239, 8239], [8287, 8287], [12288, 12288]]
    };
  };
});
unwrapExports(data_generated);

var utils$2 = createCommonjsModule(function (module, exports) {
  "use strict";

  exports.__esModule = true;

  function normalize_ranges(ranges) {
    return ranges.sort(function (_a, _b) {
      var start1 = _a[0];
      var start2 = _b[0];
      return start1 - start2;
    }).reduce(function (current, tuple, index) {
      if (index === 0) {
        return [tuple];
      }

      var _a = current[current.length - 1],
          last_start = _a[0],
          last_end = _a[1];
      var start = tuple[0],
          end = tuple[1];
      return last_end + 1 === start ? current.slice(0, -1).concat([[last_start, end]]) : current.concat([tuple]);
    }, []);
  }

  exports.normalize_ranges = normalize_ranges;

  function build_regex(ranges, flag) {
    var pattern = ranges.map(function (_a) {
      var start = _a[0],
          end = _a[1];
      return start === end ? "\\u" + get_hex(start) : "\\u" + get_hex(start) + "-\\u" + get_hex(end);
    }).join('');
    return new RegExp("[" + pattern + "]", flag);
  }

  exports.build_regex = build_regex;

  function get_hex(char_code) {
    var hex = char_code.toString(16);

    while (hex.length < 4) {
      hex = "0" + hex;
    }

    return hex;
  }
});
unwrapExports(utils$2);

var lib$5 = function lib(categories, flag) {
  var data = data_generated.get_data();
  var ranges = categories.reduce(function (current, category) {
    return current.concat(data[category]);
  }, []);
  return utils$2.build_regex(utils$2.normalize_ranges(ranges), flag);
};

var emojiRegex = emojiRegex$1(); // eslint-disable-next-line no-control-regex

var notAsciiRegex = /[^\x20-\x7F]/;
var cjkPattern = lib$3().source; // http://spec.commonmark.org/0.25/#ascii-punctuation-character

var asciiPunctuationCharRange = escapeStringRegexp("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"); // http://spec.commonmark.org/0.25/#punctuation-character

var punctuationCharRange = "".concat(asciiPunctuationCharRange).concat(lib$5(["Pc", "Pd", "Pe", "Pf", "Pi", "Po", "Ps"]).source.slice(1, -1)); // remove bracket expression `[` and `]`

var punctuationRegex = new RegExp("[".concat(punctuationCharRange, "]"));

function isExportDeclaration(node) {
  if (node) {
    switch (node.type) {
      case "ExportDefaultDeclaration":
      case "ExportDefaultSpecifier":
      case "DeclareExportDeclaration":
      case "ExportNamedDeclaration":
      case "ExportAllDeclaration":
        return true;
    }
  }

  return false;
}

function getParentExportDeclaration(path) {
  var parentNode = path.getParentNode();

  if (path.getName() === "declaration" && isExportDeclaration(parentNode)) {
    return parentNode;
  }

  return null;
}

function getPenultimate(arr) {
  if (arr.length > 1) {
    return arr[arr.length - 2];
  }

  return null;
}

function getLast$3(arr) {
  if (arr.length > 0) {
    return arr[arr.length - 1];
  }

  return null;
}

function skip(chars) {
  return function (text, index, opts) {
    var backwards = opts && opts.backwards; // Allow `skip` functions to be threaded together without having
    // to check for failures (did someone say monads?).

    if (index === false) {
      return false;
    }

    var length = text.length;
    var cursor = index;

    while (cursor >= 0 && cursor < length) {
      var c = text.charAt(cursor);

      if (chars instanceof RegExp) {
        if (!chars.test(c)) {
          return cursor;
        }
      } else if (chars.indexOf(c) === -1) {
        return cursor;
      }

      backwards ? cursor-- : cursor++;
    }

    if (cursor === -1 || cursor === length) {
      // If we reached the beginning or end of the file, return the
      // out-of-bounds cursor. It's up to the caller to handle this
      // correctly. We don't want to indicate `false` though if it
      // actually skipped valid characters.
      return cursor;
    }

    return false;
  };
}

var skipWhitespace = skip(/\s/);
var skipSpaces = skip(" \t");
var skipToLineEnd = skip(",; \t");
var skipEverythingButNewLine = skip(/[^\r\n]/);

function skipInlineComment(text, index) {
  if (index === false) {
    return false;
  }

  if (text.charAt(index) === "/" && text.charAt(index + 1) === "*") {
    for (var i = index + 2; i < text.length; ++i) {
      if (text.charAt(i) === "*" && text.charAt(i + 1) === "/") {
        return i + 2;
      }
    }
  }

  return index;
}

function skipTrailingComment(text, index) {
  if (index === false) {
    return false;
  }

  if (text.charAt(index) === "/" && text.charAt(index + 1) === "/") {
    return skipEverythingButNewLine(text, index);
  }

  return index;
} // This one doesn't use the above helper function because it wants to
// test \r\n in order and `skip` doesn't support ordering and we only
// want to skip one newline. It's simple to implement.


function skipNewline$1(text, index, opts) {
  var backwards = opts && opts.backwards;

  if (index === false) {
    return false;
  }

  var atIndex = text.charAt(index);

  if (backwards) {
    if (text.charAt(index - 1) === "\r" && atIndex === "\n") {
      return index - 2;
    }

    if (atIndex === "\n" || atIndex === "\r" || atIndex === "\u2028" || atIndex === "\u2029") {
      return index - 1;
    }
  } else {
    if (atIndex === "\r" && text.charAt(index + 1) === "\n") {
      return index + 2;
    }

    if (atIndex === "\n" || atIndex === "\r" || atIndex === "\u2028" || atIndex === "\u2029") {
      return index + 1;
    }
  }

  return index;
}

function hasNewline$1(text, index, opts) {
  opts = opts || {};
  var idx = skipSpaces(text, opts.backwards ? index - 1 : index, opts);
  var idx2 = skipNewline$1(text, idx, opts);
  return idx !== idx2;
}

function hasNewlineInRange(text, start, end) {
  for (var i = start; i < end; ++i) {
    if (text.charAt(i) === "\n") {
      return true;
    }
  }

  return false;
} // Note: this function doesn't ignore leading comments unlike isNextLineEmpty


function isPreviousLineEmpty$1(text, node, locStart) {
  var idx = locStart(node) - 1;
  idx = skipSpaces(text, idx, {
    backwards: true
  });
  idx = skipNewline$1(text, idx, {
    backwards: true
  });
  idx = skipSpaces(text, idx, {
    backwards: true
  });
  var idx2 = skipNewline$1(text, idx, {
    backwards: true
  });
  return idx !== idx2;
}

function isNextLineEmptyAfterIndex(text, index) {
  var oldIdx = null;
  var idx = index;

  while (idx !== oldIdx) {
    // We need to skip all the potential trailing inline comments
    oldIdx = idx;
    idx = skipToLineEnd(text, idx);
    idx = skipInlineComment(text, idx);
    idx = skipSpaces(text, idx);
  }

  idx = skipTrailingComment(text, idx);
  idx = skipNewline$1(text, idx);
  return hasNewline$1(text, idx);
}

function isNextLineEmpty(text, node, locEnd) {
  return isNextLineEmptyAfterIndex(text, locEnd(node));
}

function getNextNonSpaceNonCommentCharacterIndex(text, node, locEnd) {
  var oldIdx = null;
  var idx = locEnd(node);

  while (idx !== oldIdx) {
    oldIdx = idx;
    idx = skipSpaces(text, idx);
    idx = skipInlineComment(text, idx);
    idx = skipTrailingComment(text, idx);
    idx = skipNewline$1(text, idx);
  }

  return idx;
}

function getNextNonSpaceNonCommentCharacter(text, node, locEnd) {
  return text.charAt(getNextNonSpaceNonCommentCharacterIndex(text, node, locEnd));
}

function hasSpaces(text, index, opts) {
  opts = opts || {};
  var idx = skipSpaces(text, opts.backwards ? index - 1 : index, opts);
  return idx !== index;
}

function setLocStart(node, index) {
  if (node.range) {
    node.range[0] = index;
  } else {
    node.start = index;
  }
}

function setLocEnd(node, index) {
  if (node.range) {
    node.range[1] = index;
  } else {
    node.end = index;
  }
}

var PRECEDENCE = {};
[["|>"], ["||", "??"], ["&&"], ["|"], ["^"], ["&"], ["==", "===", "!=", "!=="], ["<", ">", "<=", ">=", "in", "instanceof"], [">>", "<<", ">>>"], ["+", "-"], ["*", "/", "%"], ["**"]].forEach(function (tier, i) {
  tier.forEach(function (op) {
    PRECEDENCE[op] = i;
  });
});

function getPrecedence(op) {
  return PRECEDENCE[op];
}

var equalityOperators = {
  "==": true,
  "!=": true,
  "===": true,
  "!==": true
};
var additiveOperators = {
  "+": true,
  "-": true
};
var multiplicativeOperators = {
  "*": true,
  "/": true,
  "%": true
};
var bitshiftOperators = {
  ">>": true,
  ">>>": true,
  "<<": true
};

function shouldFlatten(parentOp, nodeOp) {
  if (getPrecedence(nodeOp) !== getPrecedence(parentOp)) {
    // x + y % z --> (x + y) % z
    if (nodeOp === "%" && !additiveOperators[parentOp]) {
      return true;
    }

    return false;
  } // ** is right-associative
  // x ** y ** z --> x ** (y ** z)


  if (parentOp === "**") {
    return false;
  } // x == y == z --> (x == y) == z


  if (equalityOperators[parentOp] && equalityOperators[nodeOp]) {
    return false;
  } // x * y % z --> (x * y) % z


  if (nodeOp === "%" && multiplicativeOperators[parentOp] || parentOp === "%" && multiplicativeOperators[nodeOp]) {
    return false;
  } // x * y / z --> (x * y) / z
  // x / y * z --> (x / y) * z


  if (nodeOp !== parentOp && multiplicativeOperators[nodeOp] && multiplicativeOperators[parentOp]) {
    return false;
  } // x << y << z --> (x << y) << z


  if (bitshiftOperators[parentOp] && bitshiftOperators[nodeOp]) {
    return false;
  }

  return true;
}

function isBitwiseOperator(operator) {
  return !!bitshiftOperators[operator] || operator === "|" || operator === "^" || operator === "&";
} // Tests if an expression starts with `{`, or (if forbidFunctionClassAndDoExpr
// holds) `function`, `class`, or `do {}`. Will be overzealous if there's
// already necessary grouping parentheses.


function startsWithNoLookaheadToken(node, forbidFunctionClassAndDoExpr) {
  node = getLeftMost(node);

  switch (node.type) {
    // Hack. Remove after https://github.com/eslint/typescript-eslint-parser/issues/331
    case "ObjectPattern":
      return !forbidFunctionClassAndDoExpr;

    case "FunctionExpression":
    case "ClassExpression":
    case "DoExpression":
      return forbidFunctionClassAndDoExpr;

    case "ObjectExpression":
      return true;

    case "MemberExpression":
      return startsWithNoLookaheadToken(node.object, forbidFunctionClassAndDoExpr);

    case "TaggedTemplateExpression":
      if (node.tag.type === "FunctionExpression") {
        // IIFEs are always already parenthesized
        return false;
      }

      return startsWithNoLookaheadToken(node.tag, forbidFunctionClassAndDoExpr);

    case "CallExpression":
      if (node.callee.type === "FunctionExpression") {
        // IIFEs are always already parenthesized
        return false;
      }

      return startsWithNoLookaheadToken(node.callee, forbidFunctionClassAndDoExpr);

    case "ConditionalExpression":
      return startsWithNoLookaheadToken(node.test, forbidFunctionClassAndDoExpr);

    case "UpdateExpression":
      return !node.prefix && startsWithNoLookaheadToken(node.argument, forbidFunctionClassAndDoExpr);

    case "BindExpression":
      return node.object && startsWithNoLookaheadToken(node.object, forbidFunctionClassAndDoExpr);

    case "SequenceExpression":
      return startsWithNoLookaheadToken(node.expressions[0], forbidFunctionClassAndDoExpr);

    case "TSAsExpression":
      return startsWithNoLookaheadToken(node.expression, forbidFunctionClassAndDoExpr);

    default:
      return false;
  }
}

function getLeftMost(node) {
  if (node.left) {
    return getLeftMost(node.left);
  }

  return node;
}

function getAlignmentSize(value, tabWidth, startIndex) {
  startIndex = startIndex || 0;
  var size = 0;

  for (var i = startIndex; i < value.length; ++i) {
    if (value[i] === "\t") {
      // Tabs behave in a way that they are aligned to the nearest
      // multiple of tabWidth:
      // 0 -> 4, 1 -> 4, 2 -> 4, 3 -> 4
      // 4 -> 8, 5 -> 8, 6 -> 8, 7 -> 8 ...
      size = size + tabWidth - size % tabWidth;
    } else {
      size++;
    }
  }

  return size;
}

function getIndentSize(value, tabWidth) {
  var lastNewlineIndex = value.lastIndexOf("\n");

  if (lastNewlineIndex === -1) {
    return 0;
  }

  return getAlignmentSize( // All the leading whitespaces
  value.slice(lastNewlineIndex + 1).match(/^[ \t]*/)[0], tabWidth);
}

function printString(raw, options, isDirectiveLiteral) {
  // `rawContent` is the string exactly like it appeared in the input source
  // code, without its enclosing quotes.
  var rawContent = raw.slice(1, -1);
  var double = {
    quote: '"',
    regex: /"/g
  };
  var single = {
    quote: "'",
    regex: /'/g
  };
  var preferred = options.singleQuote ? single : double;
  var alternate = preferred === single ? double : single;
  var shouldUseAlternateQuote = false;
  var canChangeDirectiveQuotes = false; // If `rawContent` contains at least one of the quote preferred for enclosing
  // the string, we might want to enclose with the alternate quote instead, to
  // minimize the number of escaped quotes.
  // Also check for the alternate quote, to determine if we're allowed to swap
  // the quotes on a DirectiveLiteral.

  if (rawContent.includes(preferred.quote) || rawContent.includes(alternate.quote)) {
    var numPreferredQuotes = (rawContent.match(preferred.regex) || []).length;
    var numAlternateQuotes = (rawContent.match(alternate.regex) || []).length;
    shouldUseAlternateQuote = numPreferredQuotes > numAlternateQuotes;
  } else {
    canChangeDirectiveQuotes = true;
  }

  var enclosingQuote = options.parser === "json" ? double.quote : shouldUseAlternateQuote ? alternate.quote : preferred.quote; // Directives are exact code unit sequences, which means that you can't
  // change the escape sequences they use.
  // See https://github.com/prettier/prettier/issues/1555
  // and https://tc39.github.io/ecma262/#directive-prologue

  if (isDirectiveLiteral) {
    if (canChangeDirectiveQuotes) {
      return enclosingQuote + rawContent + enclosingQuote;
    }

    return raw;
  } // It might sound unnecessary to use `makeString` even if the string already
  // is enclosed with `enclosingQuote`, but it isn't. The string could contain
  // unnecessary escapes (such as in `"\'"`). Always using `makeString` makes
  // sure that we consistently output the minimum amount of escaped quotes.


  return makeString(rawContent, enclosingQuote, !(options.parser === "css" || options.parser === "less" || options.parser === "scss"));
}

function makeString(rawContent, enclosingQuote, unescapeUnnecessaryEscapes) {
  var otherQuote = enclosingQuote === '"' ? "'" : '"'; // Matches _any_ escape and unescaped quotes (both single and double).

  var regex = /\\([\s\S])|(['"])/g; // Escape and unescape single and double quotes as needed to be able to
  // enclose `rawContent` with `enclosingQuote`.

  var newContent = rawContent.replace(regex, function (match, escaped, quote) {
    // If we matched an escape, and the escaped character is a quote of the
    // other type than we intend to enclose the string with, there's no need for
    // it to be escaped, so return it _without_ the backslash.
    if (escaped === otherQuote) {
      return escaped;
    } // If we matched an unescaped quote and it is of the _same_ type as we
    // intend to enclose the string with, it must be escaped, so return it with
    // a backslash.


    if (quote === enclosingQuote) {
      return "\\" + quote;
    }

    if (quote) {
      return quote;
    } // Unescape any unnecessarily escaped character.
    // Adapted from https://github.com/eslint/eslint/blob/de0b4ad7bd820ade41b1f606008bea68683dc11a/lib/rules/no-useless-escape.js#L27


    return unescapeUnnecessaryEscapes && /^[^\\nrvtbfux\r\n\u2028\u2029"'0-7]$/.test(escaped) ? escaped : "\\" + escaped;
  });
  return enclosingQuote + newContent + enclosingQuote;
}

function printNumber(rawNumber) {
  return rawNumber.toLowerCase() // Remove unnecessary plus and zeroes from scientific notation.
  .replace(/^([+-]?[\d.]+e)(?:\+|(-))?0*(\d)/, "$1$2$3") // Remove unnecessary scientific notation (1e0).
  .replace(/^([+-]?[\d.]+)e[+-]?0+$/, "$1") // Make sure numbers always start with a digit.
  .replace(/^([+-])?\./, "$10.") // Remove extraneous trailing decimal zeroes.
  .replace(/(\.\d+?)0+(?=e|$)/, "$1") // Remove trailing dot.
  .replace(/\.(?=e|$)/, "");
}

function getMaxContinuousCount(str, target) {
  var results = str.match(new RegExp("(".concat(escapeStringRegexp(target), ")+"), "g"));

  if (results === null) {
    return 0;
  }

  return results.reduce(function (maxCount, result) {
    return Math.max(maxCount, result.length / target.length);
  }, 0);
}
/**
 * split text into whitespaces and words
 * @param {string} text
 * @return {Array<{ type: "whitespace", value: " " | "\n" | "" } | { type: "word", value: string }>}
 */


function splitText(text, options) {
  var KIND_NON_CJK = "non-cjk";
  var KIND_CJK_CHARACTER = "cjk-character";
  var KIND_CJK_PUNCTUATION = "cjk-punctuation";
  var nodes = [];
  (options.proseWrap === "preserve" ? text : text.replace(new RegExp("(".concat(cjkPattern, ")\n(").concat(cjkPattern, ")"), "g"), "$1$2")).split(/([ \t\n]+)/).forEach(function (token, index, tokens) {
    // whitespace
    if (index % 2 === 1) {
      nodes.push({
        type: "whitespace",
        value: /\n/.test(token) ? "\n" : " "
      });
      return;
    } // word separated by whitespace


    if ((index === 0 || index === tokens.length - 1) && token === "") {
      return;
    }

    token.split(new RegExp("(".concat(cjkPattern, ")"))).forEach(function (innerToken, innerIndex, innerTokens) {
      if ((innerIndex === 0 || innerIndex === innerTokens.length - 1) && innerToken === "") {
        return;
      } // non-CJK word


      if (innerIndex % 2 === 0) {
        if (innerToken !== "") {
          appendNode({
            type: "word",
            value: innerToken,
            kind: KIND_NON_CJK,
            hasLeadingPunctuation: punctuationRegex.test(innerToken[0]),
            hasTrailingPunctuation: punctuationRegex.test(getLast$3(innerToken))
          });
        }

        return;
      } // CJK character


      appendNode(punctuationRegex.test(innerToken) ? {
        type: "word",
        value: innerToken,
        kind: KIND_CJK_PUNCTUATION,
        hasLeadingPunctuation: true,
        hasTrailingPunctuation: true
      } : {
        type: "word",
        value: innerToken,
        kind: KIND_CJK_CHARACTER,
        hasLeadingPunctuation: false,
        hasTrailingPunctuation: false
      });
    });
  });
  return nodes;

  function appendNode(node) {
    var lastNode = getLast$3(nodes);

    if (lastNode && lastNode.type === "word") {
      if (lastNode.kind === KIND_NON_CJK && node.kind === KIND_CJK_CHARACTER && !lastNode.hasTrailingPunctuation || lastNode.kind === KIND_CJK_CHARACTER && node.kind === KIND_NON_CJK && !node.hasLeadingPunctuation) {
        nodes.push({
          type: "whitespace",
          value: " "
        });
      } else if (!isBetween(KIND_NON_CJK, KIND_CJK_PUNCTUATION) && // disallow leading/trailing full-width whitespace
      ![lastNode.value, node.value].some(function (value) {
        return /\u3000/.test(value);
      })) {
        nodes.push({
          type: "whitespace",
          value: ""
        });
      }
    }

    nodes.push(node);

    function isBetween(kind1, kind2) {
      return lastNode.kind === kind1 && node.kind === kind2 || lastNode.kind === kind2 && node.kind === kind1;
    }
  }
}

function getStringWidth$1(text) {
  if (!text) {
    return 0;
  } // shortcut to avoid needless string `RegExp`s, replacements, and allocations within `string-width`


  if (!notAsciiRegex.test(text)) {
    return text.length;
  } // emojis are considered 2-char width for consistency
  // see https://github.com/sindresorhus/string-width/issues/11
  // for the reason why not implemented in `string-width`


  return stringWidth(text.replace(emojiRegex, "  "));
}

function hasIgnoreComment(path) {
  var node = path.getValue();
  return hasNodeIgnoreComment(node);
}

function hasNodeIgnoreComment(node) {
  return node && node.comments && node.comments.length > 0 && node.comments.some(function (comment) {
    return comment.value.trim() === "prettier-ignore";
  });
}

function matchAncestorTypes(path, types, index) {
  index = index || 0;
  types = types.slice();

  while (types.length) {
    var parent = path.getParentNode(index);
    var type = types.shift();

    if (!parent || parent.type !== type) {
      return false;
    }

    index++;
  }

  return true;
}

function addCommentHelper(node, comment) {
  var comments = node.comments || (node.comments = []);
  comments.push(comment);
  comment.printed = false; // For some reason, TypeScript parses `// x` inside of JSXText as a comment
  // We already "print" it via the raw text, we don't need to re-print it as a
  // comment

  if (node.type === "JSXText") {
    comment.printed = true;
  }
}

function addLeadingComment$1(node, comment) {
  comment.leading = true;
  comment.trailing = false;
  addCommentHelper(node, comment);
}

function addDanglingComment$1(node, comment) {
  comment.leading = false;
  comment.trailing = false;
  addCommentHelper(node, comment);
}

function addTrailingComment$1(node, comment) {
  comment.leading = false;
  comment.trailing = true;
  addCommentHelper(node, comment);
}

function isWithinParentArrayProperty(path, propertyName) {
  var node = path.getValue();
  var parent = path.getParentNode();

  if (parent == null) {
    return false;
  }

  if (!Array.isArray(parent[propertyName])) {
    return false;
  }

  var key = path.getName();
  return parent[propertyName][key] === node;
}

var util = {
  punctuationRegex: punctuationRegex,
  punctuationCharRange: punctuationCharRange,
  getStringWidth: getStringWidth$1,
  splitText: splitText,
  getMaxContinuousCount: getMaxContinuousCount,
  getPrecedence: getPrecedence,
  shouldFlatten: shouldFlatten,
  isBitwiseOperator: isBitwiseOperator,
  isExportDeclaration: isExportDeclaration,
  getParentExportDeclaration: getParentExportDeclaration,
  getPenultimate: getPenultimate,
  getLast: getLast$3,
  getNextNonSpaceNonCommentCharacterIndex: getNextNonSpaceNonCommentCharacterIndex,
  getNextNonSpaceNonCommentCharacter: getNextNonSpaceNonCommentCharacter,
  skipWhitespace: skipWhitespace,
  skipSpaces: skipSpaces,
  skipNewline: skipNewline$1,
  isNextLineEmptyAfterIndex: isNextLineEmptyAfterIndex,
  isNextLineEmpty: isNextLineEmpty,
  isPreviousLineEmpty: isPreviousLineEmpty$1,
  hasNewline: hasNewline$1,
  hasNewlineInRange: hasNewlineInRange,
  hasSpaces: hasSpaces,
  setLocStart: setLocStart,
  setLocEnd: setLocEnd,
  startsWithNoLookaheadToken: startsWithNoLookaheadToken,
  getAlignmentSize: getAlignmentSize,
  getIndentSize: getIndentSize,
  printString: printString,
  printNumber: printNumber,
  hasIgnoreComment: hasIgnoreComment,
  hasNodeIgnoreComment: hasNodeIgnoreComment,
  makeString: makeString,
  matchAncestorTypes: matchAncestorTypes,
  addLeadingComment: addLeadingComment$1,
  addDanglingComment: addDanglingComment$1,
  addTrailingComment: addTrailingComment$1,
  isWithinParentArrayProperty: isWithinParentArrayProperty
};

var getStringWidth = util.getStringWidth;
var concat$2 = docBuilders.concat;
var fill$1 = docBuilders.fill;
var cursor$2 = docBuilders.cursor;
/** @type {{[groupId: PropertyKey]: MODE}} */

var groupModeMap;
var MODE_BREAK = 1;
var MODE_FLAT = 2;

function rootIndent() {
  return {
    value: "",
    length: 0,
    queue: []
  };
}

function makeIndent(ind, options) {
  return generateInd(ind, {
    type: "indent"
  }, options);
}

function makeAlign(ind, n, options) {
  return n === -Infinity ? ind.root || rootIndent() : n < 0 ? generateInd(ind, {
    type: "dedent"
  }, options) : !n ? ind : n.type === "root" ? Object.assign({}, ind, {
    root: ind
  }) : typeof n === "string" ? generateInd(ind, {
    type: "stringAlign",
    n: n
  }, options) : generateInd(ind, {
    type: "numberAlign",
    n: n
  }, options);
}

function generateInd(ind, newPart, options) {
  var queue = newPart.type === "dedent" ? ind.queue.slice(0, -1) : ind.queue.concat(newPart);
  var value = "";
  var length = 0;
  var lastTabs = 0;
  var lastSpaces = 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = queue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var part = _step.value;

      switch (part.type) {
        case "indent":
          flush();

          if (options.useTabs) {
            addTabs(1);
          } else {
            addSpaces(options.tabWidth);
          }

          break;

        case "stringAlign":
          flush();
          value += part.n;
          length += part.n.length;
          break;

        case "numberAlign":
          lastTabs += 1;
          lastSpaces += part.n;
          break;

        /* istanbul ignore next */

        default:
          throw new Error("Unexpected type '".concat(part.type, "'"));
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  flushSpaces();
  return Object.assign({}, ind, {
    value: value,
    length: length,
    queue: queue
  });

  function addTabs(count) {
    value += "\t".repeat(count);
    length += options.tabWidth * count;
  }

  function addSpaces(count) {
    value += " ".repeat(count);
    length += count;
  }

  function flush() {
    if (options.useTabs) {
      flushTabs();
    } else {
      flushSpaces();
    }
  }

  function flushTabs() {
    if (lastTabs > 0) {
      addTabs(lastTabs);
    }

    resetLast();
  }

  function flushSpaces() {
    if (lastSpaces > 0) {
      addSpaces(lastSpaces);
    }

    resetLast();
  }

  function resetLast() {
    lastTabs = 0;
    lastSpaces = 0;
  }
}

function fits(next, restCommands, width, options, mustBeFlat) {
  var restIdx = restCommands.length;
  var cmds = [next];

  while (width >= 0) {
    if (cmds.length === 0) {
      if (restIdx === 0) {
        return true;
      }

      cmds.push(restCommands[restIdx - 1]);
      restIdx--;
      continue;
    }

    var x = cmds.pop();
    var ind = x[0];
    var mode = x[1];
    var doc = x[2];

    if (typeof doc === "string") {
      width -= getStringWidth(doc);
    } else {
      switch (doc.type) {
        case "concat":
          for (var i = doc.parts.length - 1; i >= 0; i--) {
            cmds.push([ind, mode, doc.parts[i]]);
          }

          break;

        case "indent":
          cmds.push([makeIndent(ind, options), mode, doc.contents]);
          break;

        case "align":
          cmds.push([makeAlign(ind, doc.n, options), mode, doc.contents]);
          break;

        case "group":
          if (mustBeFlat && doc.break) {
            return false;
          }

          cmds.push([ind, doc.break ? MODE_BREAK : mode, doc.contents]);

          if (doc.id) {
            groupModeMap[doc.id] = cmds[cmds.length - 1][1];
          }

          break;

        case "fill":
          for (var _i = doc.parts.length - 1; _i >= 0; _i--) {
            cmds.push([ind, mode, doc.parts[_i]]);
          }

          break;

        case "if-break":
          {
            var groupMode = doc.groupId ? groupModeMap[doc.groupId] : mode;

            if (groupMode === MODE_BREAK) {
              if (doc.breakContents) {
                cmds.push([ind, mode, doc.breakContents]);
              }
            }

            if (groupMode === MODE_FLAT) {
              if (doc.flatContents) {
                cmds.push([ind, mode, doc.flatContents]);
              }
            }

            break;
          }

        case "line":
          switch (mode) {
            // fallthrough
            case MODE_FLAT:
              if (!doc.hard) {
                if (!doc.soft) {
                  width -= 1;
                }

                break;
              }

              return true;

            case MODE_BREAK:
              return true;
          }

          break;
      }
    }
  }

  return false;
}

function printDocToString(doc, options) {
  groupModeMap = {};
  var width = options.printWidth;
  var newLine = options.newLine || "\n";
  var pos = 0; // cmds is basically a stack. We've turned a recursive call into a
  // while loop which is much faster. The while loop below adds new
  // cmds to the array instead of recursively calling `print`.

  var cmds = [[rootIndent(), MODE_BREAK, doc]];
  var out = [];
  var shouldRemeasure = false;
  var lineSuffix = [];

  while (cmds.length !== 0) {
    var x = cmds.pop();
    var ind = x[0];
    var mode = x[1];
    var _doc = x[2];

    if (typeof _doc === "string") {
      out.push(_doc);
      pos += getStringWidth(_doc);
    } else {
      switch (_doc.type) {
        case "cursor":
          out.push(cursor$2.placeholder);
          break;

        case "concat":
          for (var i = _doc.parts.length - 1; i >= 0; i--) {
            cmds.push([ind, mode, _doc.parts[i]]);
          }

          break;

        case "indent":
          cmds.push([makeIndent(ind, options), mode, _doc.contents]);
          break;

        case "align":
          cmds.push([makeAlign(ind, _doc.n, options), mode, _doc.contents]);
          break;

        case "group":
          switch (mode) {
            case MODE_FLAT:
              if (!shouldRemeasure) {
                cmds.push([ind, _doc.break ? MODE_BREAK : MODE_FLAT, _doc.contents]);
                break;
              }

            // fallthrough

            case MODE_BREAK:
              {
                shouldRemeasure = false;
                var next = [ind, MODE_FLAT, _doc.contents];
                var rem = width - pos;

                if (!_doc.break && fits(next, cmds, rem, options)) {
                  cmds.push(next);
                } else {
                  // Expanded states are a rare case where a document
                  // can manually provide multiple representations of
                  // itself. It provides an array of documents
                  // going from the least expanded (most flattened)
                  // representation first to the most expanded. If a
                  // group has these, we need to manually go through
                  // these states and find the first one that fits.
                  if (_doc.expandedStates) {
                    var mostExpanded = _doc.expandedStates[_doc.expandedStates.length - 1];

                    if (_doc.break) {
                      cmds.push([ind, MODE_BREAK, mostExpanded]);
                      break;
                    } else {
                      for (var _i2 = 1; _i2 < _doc.expandedStates.length + 1; _i2++) {
                        if (_i2 >= _doc.expandedStates.length) {
                          cmds.push([ind, MODE_BREAK, mostExpanded]);
                          break;
                        } else {
                          var state = _doc.expandedStates[_i2];
                          var cmd = [ind, MODE_FLAT, state];

                          if (fits(cmd, cmds, rem, options)) {
                            cmds.push(cmd);
                            break;
                          }
                        }
                      }
                    }
                  } else {
                    cmds.push([ind, MODE_BREAK, _doc.contents]);
                  }
                }

                break;
              }
          }

          if (_doc.id) {
            groupModeMap[_doc.id] = cmds[cmds.length - 1][1];
          }

          break;
        // Fills each line with as much code as possible before moving to a new
        // line with the same indentation.
        //
        // Expects doc.parts to be an array of alternating content and
        // whitespace. The whitespace contains the linebreaks.
        //
        // For example:
        //   ["I", line, "love", line, "monkeys"]
        // or
        //   [{ type: group, ... }, softline, { type: group, ... }]
        //
        // It uses this parts structure to handle three main layout cases:
        // * The first two content items fit on the same line without
        //   breaking
        //   -> output the first content item and the whitespace "flat".
        // * Only the first content item fits on the line without breaking
        //   -> output the first content item "flat" and the whitespace with
        //   "break".
        // * Neither content item fits on the line without breaking
        //   -> output the first content item and the whitespace with "break".

        case "fill":
          {
            var _rem = width - pos;

            var parts = _doc.parts;

            if (parts.length === 0) {
              break;
            }

            var content = parts[0];
            var contentFlatCmd = [ind, MODE_FLAT, content];
            var contentBreakCmd = [ind, MODE_BREAK, content];
            var contentFits = fits(contentFlatCmd, [], _rem, options, true);

            if (parts.length === 1) {
              if (contentFits) {
                cmds.push(contentFlatCmd);
              } else {
                cmds.push(contentBreakCmd);
              }

              break;
            }

            var whitespace = parts[1];
            var whitespaceFlatCmd = [ind, MODE_FLAT, whitespace];
            var whitespaceBreakCmd = [ind, MODE_BREAK, whitespace];

            if (parts.length === 2) {
              if (contentFits) {
                cmds.push(whitespaceFlatCmd);
                cmds.push(contentFlatCmd);
              } else {
                cmds.push(whitespaceBreakCmd);
                cmds.push(contentBreakCmd);
              }

              break;
            } // At this point we've handled the first pair (context, separator)
            // and will create a new fill doc for the rest of the content.
            // Ideally we wouldn't mutate the array here but coping all the
            // elements to a new array would make this algorithm quadratic,
            // which is unusable for large arrays (e.g. large texts in JSX).


            parts.splice(0, 2);
            var remainingCmd = [ind, mode, fill$1(parts)];
            var secondContent = parts[0];
            var firstAndSecondContentFlatCmd = [ind, MODE_FLAT, concat$2([content, whitespace, secondContent])];
            var firstAndSecondContentFits = fits(firstAndSecondContentFlatCmd, [], _rem, options, true);

            if (firstAndSecondContentFits) {
              cmds.push(remainingCmd);
              cmds.push(whitespaceFlatCmd);
              cmds.push(contentFlatCmd);
            } else if (contentFits) {
              cmds.push(remainingCmd);
              cmds.push(whitespaceBreakCmd);
              cmds.push(contentFlatCmd);
            } else {
              cmds.push(remainingCmd);
              cmds.push(whitespaceBreakCmd);
              cmds.push(contentBreakCmd);
            }

            break;
          }

        case "if-break":
          {
            var groupMode = _doc.groupId ? groupModeMap[_doc.groupId] : mode;

            if (groupMode === MODE_BREAK) {
              if (_doc.breakContents) {
                cmds.push([ind, mode, _doc.breakContents]);
              }
            }

            if (groupMode === MODE_FLAT) {
              if (_doc.flatContents) {
                cmds.push([ind, mode, _doc.flatContents]);
              }
            }

            break;
          }

        case "line-suffix":
          lineSuffix.push([ind, mode, _doc.contents]);
          break;

        case "line-suffix-boundary":
          if (lineSuffix.length > 0) {
            cmds.push([ind, mode, {
              type: "line",
              hard: true
            }]);
          }

          break;

        case "line":
          switch (mode) {
            case MODE_FLAT:
              if (!_doc.hard) {
                if (!_doc.soft) {
                  out.push(" ");
                  pos += 1;
                }

                break;
              } else {
                // This line was forced into the output even if we
                // were in flattened mode, so we need to tell the next
                // group that no matter what, it needs to remeasure
                // because the previous measurement didn't accurately
                // capture the entire expression (this is necessary
                // for nested groups)
                shouldRemeasure = true;
              }

            // fallthrough

            case MODE_BREAK:
              if (lineSuffix.length) {
                cmds.push([ind, mode, _doc]);
                [].push.apply(cmds, lineSuffix.reverse());
                lineSuffix = [];
                break;
              }

              if (_doc.literal) {
                if (ind.root) {
                  out.push(newLine, ind.root.value);
                  pos = ind.root.length;
                } else {
                  out.push(newLine);
                  pos = 0;
                }
              } else {
                if (out.length > 0) {
                  // Trim whitespace at the end of line
                  while (out.length > 0 && typeof out[out.length - 1] === "string" && out[out.length - 1].match(/^[^\S\n]*$/)) {
                    out.pop();
                  }

                  if (out.length && typeof out[out.length - 1] === "string") {
                    out[out.length - 1] = out[out.length - 1].replace(/[^\S\n]*$/, "");
                  }
                }

                out.push(newLine + ind.value);
                pos = ind.length;
              }

              break;
          }

          break;

        default:
      }
    }
  }

  var cursorPlaceholderIndex = out.indexOf(cursor$2.placeholder);

  if (cursorPlaceholderIndex !== -1) {
    var otherCursorPlaceholderIndex = out.indexOf(cursor$2.placeholder, cursorPlaceholderIndex + 1);
    var beforeCursor = out.slice(0, cursorPlaceholderIndex).join("");
    var aroundCursor = out.slice(cursorPlaceholderIndex + 1, otherCursorPlaceholderIndex).join("");
    var afterCursor = out.slice(otherCursorPlaceholderIndex + 1).join("");
    return {
      formatted: beforeCursor + aroundCursor + afterCursor,
      cursorNodeStart: beforeCursor.length,
      cursorNodeText: aroundCursor
    };
  }

  return {
    formatted: out.join("")
  };
}

var docPrinter = {
  printDocToString: printDocToString
};

var traverseDocOnExitStackMarker = {};

function traverseDoc(doc, onEnter, onExit, shouldTraverseConditionalGroups) {
  var docsStack = [doc];

  while (docsStack.length !== 0) {
    var _doc = docsStack.pop();

    if (_doc === traverseDocOnExitStackMarker) {
      onExit(docsStack.pop());
      continue;
    }

    var shouldRecurse = true;

    if (onEnter) {
      if (onEnter(_doc) === false) {
        shouldRecurse = false;
      }
    }

    if (onExit) {
      docsStack.push(_doc);
      docsStack.push(traverseDocOnExitStackMarker);
    }

    if (shouldRecurse) {
      // When there are multiple parts to process,
      // the parts need to be pushed onto the stack in reverse order,
      // so that they are processed in the original order
      // when the stack is popped.
      if (_doc.type === "concat" || _doc.type === "fill") {
        for (var ic = _doc.parts.length, i = ic - 1; i >= 0; --i) {
          docsStack.push(_doc.parts[i]);
        }
      } else if (_doc.type === "if-break") {
        if (_doc.flatContents) {
          docsStack.push(_doc.flatContents);
        }

        if (_doc.breakContents) {
          docsStack.push(_doc.breakContents);
        }
      } else if (_doc.type === "group" && _doc.expandedStates) {
        if (shouldTraverseConditionalGroups) {
          for (var _ic = _doc.expandedStates.length, _i = _ic - 1; _i >= 0; --_i) {
            docsStack.push(_doc.expandedStates[_i]);
          }
        } else {
          docsStack.push(_doc.contents);
        }
      } else if (_doc.contents) {
        docsStack.push(_doc.contents);
      }
    }
  }
}

function mapDoc(doc, cb) {
  if (doc.type === "concat" || doc.type === "fill") {
    var parts = doc.parts.map(function (part) {
      return mapDoc(part, cb);
    });
    return cb(Object.assign({}, doc, {
      parts: parts
    }));
  } else if (doc.type === "if-break") {
    var breakContents = doc.breakContents && mapDoc(doc.breakContents, cb);
    var flatContents = doc.flatContents && mapDoc(doc.flatContents, cb);
    return cb(Object.assign({}, doc, {
      breakContents: breakContents,
      flatContents: flatContents
    }));
  } else if (doc.contents) {
    var contents = mapDoc(doc.contents, cb);
    return cb(Object.assign({}, doc, {
      contents: contents
    }));
  }

  return cb(doc);
}

function findInDoc(doc, fn, defaultValue) {
  var result = defaultValue;
  var hasStopped = false;

  function findInDocOnEnterFn(doc) {
    var maybeResult = fn(doc);

    if (maybeResult !== undefined) {
      hasStopped = true;
      result = maybeResult;
    }

    if (hasStopped) {
      return false;
    }
  }

  traverseDoc(doc, findInDocOnEnterFn);
  return result;
}

function isEmpty(n) {
  return typeof n === "string" && n.length === 0;
}

function isLineNextFn(doc) {
  if (typeof doc === "string") {
    return false;
  }

  if (doc.type === "line") {
    return true;
  }
}

function isLineNext(doc) {
  return findInDoc(doc, isLineNextFn, false);
}

function willBreakFn(doc) {
  if (doc.type === "group" && doc.break) {
    return true;
  }

  if (doc.type === "line" && doc.hard) {
    return true;
  }

  if (doc.type === "break-parent") {
    return true;
  }
}

function willBreak(doc) {
  return findInDoc(doc, willBreakFn, false);
}

function breakParentGroup(groupStack) {
  if (groupStack.length > 0) {
    var parentGroup = groupStack[groupStack.length - 1]; // Breaks are not propagated through conditional groups because
    // the user is expected to manually handle what breaks.

    if (!parentGroup.expandedStates) {
      parentGroup.break = true;
    }
  }

  return null;
}

function propagateBreaks(doc) {
  var alreadyVisitedSet = new Set();
  var groupStack = [];

  function propagateBreaksOnEnterFn(doc) {
    if (doc.type === "break-parent") {
      breakParentGroup(groupStack);
    }

    if (doc.type === "group") {
      groupStack.push(doc);

      if (alreadyVisitedSet.has(doc)) {
        return false;
      }

      alreadyVisitedSet.add(doc);
    }
  }

  function propagateBreaksOnExitFn(doc) {
    if (doc.type === "group") {
      var group = groupStack.pop();

      if (group.break) {
        breakParentGroup(groupStack);
      }
    }
  }

  traverseDoc(doc, propagateBreaksOnEnterFn, propagateBreaksOnExitFn,
  /* shouldTraverseConditionalGroups */
  true);
}

function removeLinesFn(doc) {
  // Force this doc into flat mode by statically converting all
  // lines into spaces (or soft lines into nothing). Hard lines
  // should still output because there's too great of a chance
  // of breaking existing assumptions otherwise.
  if (doc.type === "line" && !doc.hard) {
    return doc.soft ? "" : " ";
  } else if (doc.type === "if-break") {
    return doc.flatContents || "";
  }

  return doc;
}

function removeLines(doc) {
  return mapDoc(doc, removeLinesFn);
}

function stripTrailingHardline(doc) {
  // HACK remove ending hardline, original PR: #1984
  if (doc.type === "concat" && doc.parts.length === 2 && doc.parts[1].type === "concat" && doc.parts[1].parts.length === 2 && doc.parts[1].parts[0].hard && doc.parts[1].parts[1].type === "break-parent") {
    return doc.parts[0];
  }

  return doc;
}

var docUtils = {
  isEmpty: isEmpty,
  willBreak: willBreak,
  isLineNext: isLineNext,
  traverseDoc: traverseDoc,
  mapDoc: mapDoc,
  propagateBreaks: propagateBreaks,
  removeLines: removeLines,
  stripTrailingHardline: stripTrailingHardline
};

function flattenDoc(doc) {
  if (doc.type === "concat") {
    var res = [];

    for (var i = 0; i < doc.parts.length; ++i) {
      var doc2 = doc.parts[i];

      if (typeof doc2 !== "string" && doc2.type === "concat") {
        [].push.apply(res, flattenDoc(doc2).parts);
      } else {
        var flattened = flattenDoc(doc2);

        if (flattened !== "") {
          res.push(flattened);
        }
      }
    }

    return Object.assign({}, doc, {
      parts: res
    });
  } else if (doc.type === "if-break") {
    return Object.assign({}, doc, {
      breakContents: doc.breakContents != null ? flattenDoc(doc.breakContents) : null,
      flatContents: doc.flatContents != null ? flattenDoc(doc.flatContents) : null
    });
  } else if (doc.type === "group") {
    return Object.assign({}, doc, {
      contents: flattenDoc(doc.contents),
      expandedStates: doc.expandedStates ? doc.expandedStates.map(flattenDoc) : doc.expandedStates
    });
  } else if (doc.contents) {
    return Object.assign({}, doc, {
      contents: flattenDoc(doc.contents)
    });
  }

  return doc;
}

function printDoc(doc) {
  if (typeof doc === "string") {
    return JSON.stringify(doc);
  }

  if (doc.type === "line") {
    if (doc.literalline) {
      return "literalline";
    }

    if (doc.hard) {
      return "hardline";
    }

    if (doc.soft) {
      return "softline";
    }

    return "line";
  }

  if (doc.type === "break-parent") {
    return "breakParent";
  }

  if (doc.type === "concat") {
    return "[" + doc.parts.map(printDoc).join(", ") + "]";
  }

  if (doc.type === "indent") {
    return "indent(" + printDoc(doc.contents) + ")";
  }

  if (doc.type === "align") {
    return doc.n === -Infinity ? "dedentToRoot(" + printDoc(doc.contents) + ")" : doc.n < 0 ? "dedent(" + printDoc(doc.contents) + ")" : doc.n.type === "root" ? "markAsRoot(" + printDoc(doc.contents) + ")" : "align(" + JSON.stringify(doc.n) + ", " + printDoc(doc.contents) + ")";
  }

  if (doc.type === "if-break") {
    return "ifBreak(" + printDoc(doc.breakContents) + (doc.flatContents ? ", " + printDoc(doc.flatContents) : "") + ")";
  }

  if (doc.type === "group") {
    if (doc.expandedStates) {
      return "conditionalGroup(" + "[" + doc.expandedStates.map(printDoc).join(",") + "])";
    }

    return (doc.break ? "wrappedGroup" : "group") + "(" + printDoc(doc.contents) + ")";
  }

  if (doc.type === "fill") {
    return "fill" + "(" + doc.parts.map(printDoc).join(", ") + ")";
  }

  if (doc.type === "line-suffix") {
    return "lineSuffix(" + printDoc(doc.contents) + ")";
  }

  if (doc.type === "line-suffix-boundary") {
    return "lineSuffixBoundary";
  }

  throw new Error("Unknown doc type " + doc.type);
}

var docDebug = {
  printDocToDebug: function printDocToDebug(doc) {
    return printDoc(flattenDoc(doc));
  }
};

var doc = {
  builders: docBuilders,
  printer: docPrinter,
  utils: docUtils,
  debug: docDebug
};

var mapDoc$1 = doc.utils.mapDoc;

function isNextLineEmpty$1(text, node, options) {
  return util.isNextLineEmpty(text, node, options.locEnd);
}

function isPreviousLineEmpty$2(text, node, options) {
  return util.isPreviousLineEmpty(text, node, options.locStart);
}

function getNextNonSpaceNonCommentCharacterIndex$1(text, node, options) {
  return util.getNextNonSpaceNonCommentCharacterIndex(text, node, options.locEnd);
}

var utilShared = {
  isNextLineEmpty: isNextLineEmpty$1,
  isNextLineEmptyAfterIndex: util.isNextLineEmptyAfterIndex,
  isPreviousLineEmpty: isPreviousLineEmpty$2,
  getNextNonSpaceNonCommentCharacterIndex: getNextNonSpaceNonCommentCharacterIndex$1,
  mapDoc: mapDoc$1,
  // TODO: remove in 2.0, we already exposed it in docUtils
  makeString: util.makeString,
  addLeadingComment: util.addLeadingComment,
  addDanglingComment: util.addDanglingComment,
  addTrailingComment: util.addTrailingComment
};

var assert$3 = ( assert$2 && assert ) || assert$2;

var _require$$0$builders = doc.builders;
var concat = _require$$0$builders.concat;
var hardline = _require$$0$builders.hardline;
var breakParent = _require$$0$builders.breakParent;
var indent = _require$$0$builders.indent;
var lineSuffix = _require$$0$builders.lineSuffix;
var join = _require$$0$builders.join;
var cursor = _require$$0$builders.cursor;
var hasNewline = util.hasNewline;
var skipNewline = util.skipNewline;
var isPreviousLineEmpty = util.isPreviousLineEmpty;
var addLeadingComment = utilShared.addLeadingComment;
var addDanglingComment = utilShared.addDanglingComment;
var addTrailingComment = utilShared.addTrailingComment;
var childNodesCacheKey = Symbol("child-nodes");

function getSortedChildNodes(node, options, resultArray) {
  if (!node) {
    return;
  }

  var printer = options.printer,
      locStart = options.locStart,
      locEnd = options.locEnd;

  if (resultArray) {
    if (node && printer.canAttachComment && printer.canAttachComment(node)) {
      // This reverse insertion sort almost always takes constant
      // time because we almost always (maybe always?) append the
      // nodes in order anyway.
      var i;

      for (i = resultArray.length - 1; i >= 0; --i) {
        if (locStart(resultArray[i]) <= locStart(node) && locEnd(resultArray[i]) <= locEnd(node)) {
          break;
        }
      }

      resultArray.splice(i + 1, 0, node);
      return;
    }
  } else if (node[childNodesCacheKey]) {
    return node[childNodesCacheKey];
  }

  var childNodes;

  if (printer.getCommentChildNodes) {
    childNodes = printer.getCommentChildNodes(node);
  } else if (node && _typeof(node) === "object") {
    childNodes = Object.keys(node).filter(function (n) {
      return n !== "enclosingNode" && n !== "precedingNode" && n !== "followingNode";
    }).map(function (n) {
      return node[n];
    });
  }

  if (!childNodes) {
    return;
  }

  if (!resultArray) {
    Object.defineProperty(node, childNodesCacheKey, {
      value: resultArray = [],
      enumerable: false
    });
  }

  childNodes.forEach(function (childNode) {
    getSortedChildNodes(childNode, options, resultArray);
  });
  return resultArray;
} // As efficiently as possible, decorate the comment object with
// .precedingNode, .enclosingNode, and/or .followingNode properties, at
// least one of which is guaranteed to be defined.


function decorateComment(node, comment, options) {
  var locStart = options.locStart,
      locEnd = options.locEnd;
  var childNodes = getSortedChildNodes(node, options);
  var precedingNode;
  var followingNode; // Time to dust off the old binary search robes and wizard hat.

  var left = 0;
  var right = childNodes.length;

  while (left < right) {
    var middle = left + right >> 1;
    var child = childNodes[middle];

    if (locStart(child) - locStart(comment) <= 0 && locEnd(comment) - locEnd(child) <= 0) {
      // The comment is completely contained by this child node.
      comment.enclosingNode = child;
      decorateComment(child, comment, options);
      return; // Abandon the binary search at this level.
    }

    if (locEnd(child) - locStart(comment) <= 0) {
      // This child node falls completely before the comment.
      // Because we will never consider this node or any nodes
      // before it again, this node must be the closest preceding
      // node we have encountered so far.
      precedingNode = child;
      left = middle + 1;
      continue;
    }

    if (locEnd(comment) - locStart(child) <= 0) {
      // This child node falls completely after the comment.
      // Because we will never consider this node or any nodes after
      // it again, this node must be the closest following node we
      // have encountered so far.
      followingNode = child;
      right = middle;
      continue;
    }
    /* istanbul ignore next */


    throw new Error("Comment location overlaps with node location");
  } // We don't want comments inside of different expressions inside of the same
  // template literal to move to another expression.


  if (comment.enclosingNode && comment.enclosingNode.type === "TemplateLiteral") {
    var quasis = comment.enclosingNode.quasis;
    var commentIndex = findExpressionIndexForComment(quasis, comment, options);

    if (precedingNode && findExpressionIndexForComment(quasis, precedingNode, options) !== commentIndex) {
      precedingNode = null;
    }

    if (followingNode && findExpressionIndexForComment(quasis, followingNode, options) !== commentIndex) {
      followingNode = null;
    }
  }

  if (precedingNode) {
    comment.precedingNode = precedingNode;
  }

  if (followingNode) {
    comment.followingNode = followingNode;
  }
}

function attach(comments, ast, text, options) {
  if (!Array.isArray(comments)) {
    return;
  }

  var tiesToBreak = [];
  var locStart = options.locStart,
      locEnd = options.locEnd;
  comments.forEach(function (comment, i) {
    if ((options.parser === "json" || options.parser === "json5") && locStart(comment) - locStart(ast) <= 0) {
      addLeadingComment(ast, comment);
      return;
    }

    decorateComment(ast, comment, options);
    var precedingNode = comment.precedingNode,
        enclosingNode = comment.enclosingNode,
        followingNode = comment.followingNode;
    var pluginHandleOwnLineComment = options.printer.handleComments && options.printer.handleComments.ownLine ? options.printer.handleComments.ownLine : function () {
      return false;
    };
    var pluginHandleEndOfLineComment = options.printer.handleComments && options.printer.handleComments.endOfLine ? options.printer.handleComments.endOfLine : function () {
      return false;
    };
    var pluginHandleRemainingComment = options.printer.handleComments && options.printer.handleComments.remaining ? options.printer.handleComments.remaining : function () {
      return false;
    };
    var isLastComment = comments.length - 1 === i;

    if (hasNewline(text, locStart(comment), {
      backwards: true
    })) {
      // If a comment exists on its own line, prefer a leading comment.
      // We also need to check if it's the first line of the file.
      if (pluginHandleOwnLineComment(comment, text, options, ast, isLastComment)) {// We're good
      } else if (followingNode) {
        // Always a leading comment.
        addLeadingComment(followingNode, comment);
      } else if (precedingNode) {
        addTrailingComment(precedingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      } else {
        // There are no nodes, let's attach it to the root of the ast

        /* istanbul ignore next */
        addDanglingComment(ast, comment);
      }
    } else if (hasNewline(text, locEnd(comment))) {
      if (pluginHandleEndOfLineComment(comment, text, options, ast, isLastComment)) {// We're good
      } else if (precedingNode) {
        // There is content before this comment on the same line, but
        // none after it, so prefer a trailing comment of the previous node.
        addTrailingComment(precedingNode, comment);
      } else if (followingNode) {
        addLeadingComment(followingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      } else {
        // There are no nodes, let's attach it to the root of the ast

        /* istanbul ignore next */
        addDanglingComment(ast, comment);
      }
    } else {
      if (pluginHandleRemainingComment(comment, text, options, ast, isLastComment)) {// We're good
      } else if (precedingNode && followingNode) {
        // Otherwise, text exists both before and after the comment on
        // the same line. If there is both a preceding and following
        // node, use a tie-breaking algorithm to determine if it should
        // be attached to the next or previous node. In the last case,
        // simply attach the right node;
        var tieCount = tiesToBreak.length;

        if (tieCount > 0) {
          var lastTie = tiesToBreak[tieCount - 1];

          if (lastTie.followingNode !== comment.followingNode) {
            breakTies(tiesToBreak, text, options);
          }
        }

        tiesToBreak.push(comment);
      } else if (precedingNode) {
        addTrailingComment(precedingNode, comment);
      } else if (followingNode) {
        addLeadingComment(followingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      } else {
        // There are no nodes, let's attach it to the root of the ast

        /* istanbul ignore next */
        addDanglingComment(ast, comment);
      }
    }
  });
  breakTies(tiesToBreak, text, options);
  comments.forEach(function (comment) {
    // These node references were useful for breaking ties, but we
    // don't need them anymore, and they create cycles in the AST that
    // may lead to infinite recursion if we don't delete them here.
    delete comment.precedingNode;
    delete comment.enclosingNode;
    delete comment.followingNode;
  });
}

function breakTies(tiesToBreak, text, options) {
  var tieCount = tiesToBreak.length;

  if (tieCount === 0) {
    return;
  }

  var _tiesToBreak$ = tiesToBreak[0],
      precedingNode = _tiesToBreak$.precedingNode,
      followingNode = _tiesToBreak$.followingNode;
  var gapEndPos = options.locStart(followingNode); // Iterate backwards through tiesToBreak, examining the gaps
  // between the tied comments. In order to qualify as leading, a
  // comment must be separated from followingNode by an unbroken series of
  // gaps (or other comments). Gaps should only contain whitespace or open
  // parentheses.

  var indexOfFirstLeadingComment;

  for (indexOfFirstLeadingComment = tieCount; indexOfFirstLeadingComment > 0; --indexOfFirstLeadingComment) {
    var comment = tiesToBreak[indexOfFirstLeadingComment - 1];
    assert$3.strictEqual(comment.precedingNode, precedingNode);
    assert$3.strictEqual(comment.followingNode, followingNode);
    var gap = text.slice(options.locEnd(comment), gapEndPos).trim();

    if (gap === "" || /^\(+$/.test(gap)) {
      gapEndPos = options.locStart(comment);
    } else {
      // The gap string contained something other than whitespace or open
      // parentheses.
      break;
    }
  }

  tiesToBreak.forEach(function (comment, i) {
    if (i < indexOfFirstLeadingComment) {
      addTrailingComment(precedingNode, comment);
    } else {
      addLeadingComment(followingNode, comment);
    }
  });
  tiesToBreak.length = 0;
}

function printComment(commentPath, options) {
  var comment = commentPath.getValue();
  comment.printed = true;
  return options.printer.printComment(commentPath, options);
}

function findExpressionIndexForComment(quasis, comment, options) {
  var startPos = options.locStart(comment) - 1;

  for (var i = 1; i < quasis.length; ++i) {
    if (startPos < getQuasiRange(quasis[i]).start) {
      return i - 1;
    }
  } // We haven't found it, it probably means that some of the locations are off.
  // Let's just return the first one.

  /* istanbul ignore next */


  return 0;
}

function getQuasiRange(expr) {
  if (expr.start !== undefined) {
    // Babylon
    return {
      start: expr.start,
      end: expr.end
    };
  } // Flow


  return {
    start: expr.range[0],
    end: expr.range[1]
  };
}

function printLeadingComment(commentPath, print, options) {
  var comment = commentPath.getValue();
  var contents = printComment(commentPath, options);

  if (!contents) {
    return "";
  }

  var isBlock = options.printer.isBlockComment && options.printer.isBlockComment(comment); // Leading block comments should see if they need to stay on the
  // same line or not.

  if (isBlock) {
    return concat([contents, hasNewline(options.originalText, options.locEnd(comment)) ? hardline : " "]);
  }

  return concat([contents, hardline]);
}

function printTrailingComment(commentPath, print, options) {
  var comment = commentPath.getValue();
  var contents = printComment(commentPath, options);

  if (!contents) {
    return "";
  }

  var isBlock = options.printer.isBlockComment && options.printer.isBlockComment(comment); // We don't want the line to break
  // when the parentParentNode is a ClassDeclaration/-Expression
  // And the parentNode is in the superClass property

  var parentNode = commentPath.getNode(1);
  var parentParentNode = commentPath.getNode(2);
  var isParentSuperClass = parentParentNode && (parentParentNode.type === "ClassDeclaration" || parentParentNode.type === "ClassExpression") && parentParentNode.superClass === parentNode;

  if (hasNewline(options.originalText, options.locStart(comment), {
    backwards: true
  })) {
    // This allows comments at the end of nested structures:
    // {
    //   x: 1,
    //   y: 2
    //   // A comment
    // }
    // Those kinds of comments are almost always leading comments, but
    // here it doesn't go "outside" the block and turns it into a
    // trailing comment for `2`. We can simulate the above by checking
    // if this a comment on its own line; normal trailing comments are
    // always at the end of another expression.
    var isLineBeforeEmpty = isPreviousLineEmpty(options.originalText, comment, options.locStart);
    return lineSuffix(concat([hardline, isLineBeforeEmpty ? hardline : "", contents]));
  } else if (isBlock || isParentSuperClass) {
    // Trailing block comments never need a newline
    return concat([" ", contents]);
  }

  return concat([lineSuffix(" " + contents), !isBlock ? breakParent : ""]);
}

function printDanglingComments(path, options, sameIndent, filter) {
  var parts = [];
  var node = path.getValue();

  if (!node || !node.comments) {
    return "";
  }

  path.each(function (commentPath) {
    var comment = commentPath.getValue();

    if (comment && !comment.leading && !comment.trailing && (!filter || filter(comment))) {
      parts.push(printComment(commentPath, options));
    }
  }, "comments");

  if (parts.length === 0) {
    return "";
  }

  if (sameIndent) {
    return join(hardline, parts);
  }

  return indent(concat([hardline, join(hardline, parts)]));
}

function prependCursorPlaceholder(path, options, printed) {
  if (path.getNode() === options.cursorNode && path.getValue()) {
    return concat([cursor, printed, cursor]);
  }

  return printed;
}

function printComments(path, print, options, needsSemi) {
  var value = path.getValue();
  var printed = print(path);
  var comments = value && value.comments;

  if (!comments || comments.length === 0) {
    return prependCursorPlaceholder(path, options, printed);
  }

  var leadingParts = [];
  var trailingParts = [needsSemi ? ";" : "", printed];
  path.each(function (commentPath) {
    var comment = commentPath.getValue();
    var leading = comment.leading,
        trailing = comment.trailing;

    if (leading) {
      var contents = printLeadingComment(commentPath, print, options);

      if (!contents) {
        return;
      }

      leadingParts.push(contents);
      var text = options.originalText;

      if (hasNewline(text, skipNewline(text, options.locEnd(comment)))) {
        leadingParts.push(hardline);
      }
    } else if (trailing) {
      trailingParts.push(printTrailingComment(commentPath, print, options));
    }
  }, "comments");
  return prependCursorPlaceholder(path, options, concat(leadingParts.concat(trailingParts)));
}

var comments = {
  attach: attach,
  printComments: printComments,
  printDanglingComments: printDanglingComments,
  getSortedChildNodes: getSortedChildNodes
};

function FastPath(value) {
  assert$3.ok(this instanceof FastPath);
  this.stack = [value];
} // The name of the current property is always the penultimate element of
// this.stack, and always a String.


FastPath.prototype.getName = function getName() {
  var s = this.stack;
  var len = s.length;

  if (len > 1) {
    return s[len - 2];
  } // Since the name is always a string, null is a safe sentinel value to
  // return if we do not know the name of the (root) value.

  /* istanbul ignore next */


  return null;
}; // The value of the current property is always the final element of
// this.stack.


FastPath.prototype.getValue = function getValue() {
  var s = this.stack;
  return s[s.length - 1];
};

function getNodeHelper(path, count) {
  var s = path.stack;

  for (var i = s.length - 1; i >= 0; i -= 2) {
    var value = s[i];

    if (value && !Array.isArray(value) && --count < 0) {
      return value;
    }
  }

  return null;
}

FastPath.prototype.getNode = function getNode(count) {
  return getNodeHelper(this, ~~count);
};

FastPath.prototype.getParentNode = function getParentNode(count) {
  return getNodeHelper(this, ~~count + 1);
}; // Temporarily push properties named by string arguments given after the
// callback function onto this.stack, then call the callback with a
// reference to this (modified) FastPath object. Note that the stack will
// be restored to its original state after the callback is finished, so it
// is probably a mistake to retain a reference to the path.


FastPath.prototype.call = function call(callback
/*, name1, name2, ... */
) {
  var s = this.stack;
  var origLen = s.length;
  var value = s[origLen - 1];
  var argc = arguments.length;

  for (var i = 1; i < argc; ++i) {
    var name = arguments[i];
    value = value[name];
    s.push(name, value);
  }

  var result = callback(this);
  s.length = origLen;
  return result;
}; // Similar to FastPath.prototype.call, except that the value obtained by
// accessing this.getValue()[name1][name2]... should be array-like. The
// callback will be called with a reference to this path object for each
// element of the array.


FastPath.prototype.each = function each(callback
/*, name1, name2, ... */
) {
  var s = this.stack;
  var origLen = s.length;
  var value = s[origLen - 1];
  var argc = arguments.length;

  for (var i = 1; i < argc; ++i) {
    var name = arguments[i];
    value = value[name];
    s.push(name, value);
  }

  for (var _i = 0; _i < value.length; ++_i) {
    if (_i in value) {
      s.push(_i, value[_i]); // If the callback needs to know the value of i, call
      // path.getName(), assuming path is the parameter name.

      callback(this);
      s.length -= 2;
    }
  }

  s.length = origLen;
}; // Similar to FastPath.prototype.each, except that the results of the
// callback function invocations are stored in an array and returned at
// the end of the iteration.


FastPath.prototype.map = function map(callback
/*, name1, name2, ... */
) {
  var s = this.stack;
  var origLen = s.length;
  var value = s[origLen - 1];
  var argc = arguments.length;

  for (var i = 1; i < argc; ++i) {
    var name = arguments[i];
    value = value[name];
    s.push(name, value);
  }

  var result = new Array(value.length);

  for (var _i2 = 0; _i2 < value.length; ++_i2) {
    if (_i2 in value) {
      s.push(_i2, value[_i2]);
      result[_i2] = callback(this, _i2);
      s.length -= 2;
    }
  }

  s.length = origLen;
  return result;
};

var fastPath = FastPath;

var normalize$1 = options.normalize;

function printSubtree(path, print, options$$1, printAstToDoc) {
  if (options$$1.printer.embed) {
    return options$$1.printer.embed(path, print, function (text, partialNextOptions) {
      return textToDoc(text, partialNextOptions, options$$1, printAstToDoc);
    }, options$$1);
  }
}

function textToDoc(text, partialNextOptions, parentOptions, printAstToDoc) {
  var nextOptions = normalize$1(Object.assign({}, parentOptions, partialNextOptions, {
    parentParser: parentOptions.parser,
    originalText: text
  }), {
    passThrough: true
  });
  var result = parser.parse(text, nextOptions);
  var ast = result.ast;
  text = result.text;
  var astComments = ast.comments;
  delete ast.comments;
  comments.attach(astComments, ast, text, nextOptions);
  return printAstToDoc(ast, nextOptions);
}

var multiparser = {
  printSubtree: printSubtree
};

var doc$2 = doc;
var docBuilders$2 = doc$2.builders;
var concat$3 = docBuilders$2.concat;
var hardline$2 = docBuilders$2.hardline;
var addAlignmentToDoc$1 = docBuilders$2.addAlignmentToDoc;
var docUtils$2 = doc$2.utils;

function printAstToDoc(ast, options, addAlignmentSize) {
  addAlignmentSize = addAlignmentSize || 0;
  var printer = options.printer;
  var cache = new Map();

  function printGenerically(path, args) {
    var node = path.getValue();
    var shouldCache = node && _typeof(node) === "object" && args === undefined;

    if (shouldCache && cache.has(node)) {
      return cache.get(node);
    } // We let JSXElement print its comments itself because it adds () around
    // UnionTypeAnnotation has to align the child without the comments


    var res;

    if (printer.willPrintOwnComments && printer.willPrintOwnComments(path)) {
      res = genericPrint(path, options, printGenerically, args);
    } else {
      res = comments.printComments(path, function (p) {
        return genericPrint(p, options, printGenerically, args);
      }, options, args && args.needsSemi);
    }

    if (shouldCache) {
      cache.set(node, res);
    }

    return res;
  }

  var doc$$2 = printGenerically(new fastPath(ast));

  if (addAlignmentSize > 0) {
    // Add a hardline to make the indents take effect
    // It should be removed in index.js format()
    doc$$2 = addAlignmentToDoc$1(docUtils$2.removeLines(concat$3([hardline$2, doc$$2])), addAlignmentSize, options.tabWidth);
  }

  docUtils$2.propagateBreaks(doc$$2);

  if (options.parser === "json" || options.parser === "json5" || options.parser === "json-stringify") {
    doc$$2 = concat$3([doc$$2, hardline$2]);
  }

  return doc$$2;
}

function genericPrint(path, options, printPath, args) {
  assert$3.ok(path instanceof fastPath);
  var node = path.getValue();
  var printer = options.printer; // Escape hatch

  if (printer.hasPrettierIgnore && printer.hasPrettierIgnore(path)) {
    return options.originalText.slice(options.locStart(node), options.locEnd(node));
  }

  if (node) {
    try {
      // Potentially switch to a different parser
      var sub = multiparser.printSubtree(path, printPath, options, printAstToDoc);

      if (sub) {
        return sub;
      }
    } catch (error) {
      /* istanbul ignore if */
      if (commonjsGlobal.PRETTIER_DEBUG) {
        throw error;
      } // Continue with current parser

    }
  }

  return printer.print(path, options, printPath, args);
}

var astToDoc = printAstToDoc;

function findSiblingAncestors(startNodeAndParents, endNodeAndParents, opts) {
  var resultStartNode = startNodeAndParents.node;
  var resultEndNode = endNodeAndParents.node;

  if (resultStartNode === resultEndNode) {
    return {
      startNode: resultStartNode,
      endNode: resultEndNode
    };
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = endNodeAndParents.parentNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var endParent = _step.value;

      if (endParent.type !== "Program" && endParent.type !== "File" && opts.locStart(endParent) >= opts.locStart(startNodeAndParents.node)) {
        resultEndNode = endParent;
      } else {
        break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = startNodeAndParents.parentNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var startParent = _step2.value;

      if (startParent.type !== "Program" && startParent.type !== "File" && opts.locEnd(startParent) <= opts.locEnd(endNodeAndParents.node)) {
        resultStartNode = startParent;
      } else {
        break;
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return {
    startNode: resultStartNode,
    endNode: resultEndNode
  };
}

function findNodeAtOffset(node, offset, options, predicate, parentNodes) {
  predicate = predicate || function () {
    return true;
  };

  parentNodes = parentNodes || [];
  var start = options.locStart(node, options.locStart);
  var end = options.locEnd(node, options.locEnd);

  if (start <= offset && offset <= end) {
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = comments.getSortedChildNodes(node, options)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var childNode = _step3.value;
        var childResult = findNodeAtOffset(childNode, offset, options, predicate, [node].concat(parentNodes));

        if (childResult) {
          return childResult;
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    if (predicate(node)) {
      return {
        node: node,
        parentNodes: parentNodes
      };
    }
  }
} // See https://www.ecma-international.org/ecma-262/5.1/#sec-A.5


function isSourceElement(opts, node) {
  if (node == null) {
    return false;
  } // JS and JS like to avoid repetitions


  var jsSourceElements = ["FunctionDeclaration", "BlockStatement", "BreakStatement", "ContinueStatement", "DebuggerStatement", "DoWhileStatement", "EmptyStatement", "ExpressionStatement", "ForInStatement", "ForStatement", "IfStatement", "LabeledStatement", "ReturnStatement", "SwitchStatement", "ThrowStatement", "TryStatement", "VariableDeclaration", "WhileStatement", "WithStatement", "ClassDeclaration", // ES 2015
  "ImportDeclaration", // Module
  "ExportDefaultDeclaration", // Module
  "ExportNamedDeclaration", // Module
  "ExportAllDeclaration", // Module
  "TypeAlias", // Flow
  "InterfaceDeclaration", // Flow, TypeScript
  "TypeAliasDeclaration", // TypeScript
  "ExportAssignment", // TypeScript
  "ExportDeclaration" // TypeScript
  ];
  var jsonSourceElements = ["ObjectExpression", "ArrayExpression", "StringLiteral", "NumericLiteral", "BooleanLiteral", "NullLiteral"];
  var graphqlSourceElements = ["OperationDefinition", "FragmentDefinition", "VariableDefinition", "TypeExtensionDefinition", "ObjectTypeDefinition", "FieldDefinition", "DirectiveDefinition", "EnumTypeDefinition", "EnumValueDefinition", "InputValueDefinition", "InputObjectTypeDefinition", "SchemaDefinition", "OperationTypeDefinition", "InterfaceTypeDefinition", "UnionTypeDefinition", "ScalarTypeDefinition"];

  switch (opts.parser) {
    case "flow":
    case "babylon":
    case "typescript":
      return jsSourceElements.indexOf(node.type) > -1;

    case "json":
      return jsonSourceElements.indexOf(node.type) > -1;

    case "graphql":
      return graphqlSourceElements.indexOf(node.kind) > -1;

    case "vue":
      return node.tag !== "root";
  }

  return false;
}

function calculateRange(text, opts, ast) {
  // Contract the range so that it has non-whitespace characters at its endpoints.
  // This ensures we can format a range that doesn't end on a node.
  var rangeStringOrig = text.slice(opts.rangeStart, opts.rangeEnd);
  var startNonWhitespace = Math.max(opts.rangeStart + rangeStringOrig.search(/\S/), opts.rangeStart);
  var endNonWhitespace;

  for (endNonWhitespace = opts.rangeEnd; endNonWhitespace > opts.rangeStart; --endNonWhitespace) {
    if (text[endNonWhitespace - 1].match(/\S/)) {
      break;
    }
  }

  var startNodeAndParents = findNodeAtOffset(ast, startNonWhitespace, opts, function (node) {
    return isSourceElement(opts, node);
  });
  var endNodeAndParents = findNodeAtOffset(ast, endNonWhitespace, opts, function (node) {
    return isSourceElement(opts, node);
  });

  if (!startNodeAndParents || !endNodeAndParents) {
    return {
      rangeStart: 0,
      rangeEnd: 0
    };
  }

  var siblingAncestors = findSiblingAncestors(startNodeAndParents, endNodeAndParents, opts);
  var startNode = siblingAncestors.startNode,
      endNode = siblingAncestors.endNode;
  var rangeStart = Math.min(opts.locStart(startNode, opts.locStart), opts.locStart(endNode, opts.locStart));
  var rangeEnd = Math.max(opts.locEnd(startNode, opts.locEnd), opts.locEnd(endNode, opts.locEnd));
  return {
    rangeStart: rangeStart,
    rangeEnd: rangeEnd
  };
}

var rangeUtil = {
  calculateRange: calculateRange,
  findNodeAtOffset: findNodeAtOffset
};

var normalizeOptions = options.normalize;
var _printDocToString = doc.printer.printDocToString;
var printDocToDebug = doc.debug.printDocToDebug;
var UTF8BOM = 0xfeff;
var CURSOR = Symbol("cursor");

function guessLineEnding(text) {
  var index = text.indexOf("\n");

  if (index >= 0 && text.charAt(index - 1) === "\r") {
    return "\r\n";
  }

  return "\n";
}

function ensureAllCommentsPrinted(astComments) {
  if (!astComments) {
    return;
  }

  for (var i = 0; i < astComments.length; ++i) {
    if (astComments[i].value.trim() === "prettier-ignore") {
      // If there's a prettier-ignore, we're not printing that sub-tree so we
      // don't know if the comments was printed or not.
      return;
    }
  }

  astComments.forEach(function (comment) {
    if (!comment.printed) {
      throw new Error('Comment "' + comment.value.trim() + '" was not printed. Please report this error!');
    }

    delete comment.printed;
  });
}

function attachComments(text, ast, opts) {
  var astComments = ast.comments;

  if (astComments) {
    delete ast.comments;
    comments.attach(astComments, ast, text, opts);
  }

  ast.tokens = [];
  opts.originalText = opts.parser === "yaml" ? text : text.trimRight();
  return astComments;
}

function coreFormat(text, opts, addAlignmentSize) {
  if (!text || !text.trim().length) {
    return {
      formatted: "",
      cursorOffset: 0
    };
  }

  addAlignmentSize = addAlignmentSize || 0;
  var parsed = parser.parse(text, opts);
  var ast = parsed.ast;
  var originalText = text;
  text = parsed.text;

  if (opts.cursorOffset >= 0) {
    var nodeResult = rangeUtil.findNodeAtOffset(ast, opts.cursorOffset, opts);

    if (nodeResult && nodeResult.node) {
      opts.cursorNode = nodeResult.node;
    }
  }

  var astComments = attachComments(text, ast, opts);
  var doc$$1 = astToDoc(ast, opts, addAlignmentSize);
  opts.newLine = guessLineEnding(originalText);

  var result = _printDocToString(doc$$1, opts);

  ensureAllCommentsPrinted(astComments); // Remove extra leading indentation as well as the added indentation after last newline

  if (addAlignmentSize > 0) {
    var trimmed = result.formatted.trim();

    if (result.cursorNodeStart !== undefined) {
      result.cursorNodeStart -= result.formatted.indexOf(trimmed);
    }

    result.formatted = trimmed + opts.newLine;
  }

  if (opts.cursorOffset >= 0) {
    var oldCursorNodeStart;
    var oldCursorNodeText;
    var cursorOffsetRelativeToOldCursorNode;
    var newCursorNodeStart;
    var newCursorNodeText;

    if (opts.cursorNode && result.cursorNodeText) {
      oldCursorNodeStart = opts.locStart(opts.cursorNode);
      oldCursorNodeText = text.slice(oldCursorNodeStart, opts.locEnd(opts.cursorNode));
      cursorOffsetRelativeToOldCursorNode = opts.cursorOffset - oldCursorNodeStart;
      newCursorNodeStart = result.cursorNodeStart;
      newCursorNodeText = result.cursorNodeText;
    } else {
      oldCursorNodeStart = 0;
      oldCursorNodeText = text;
      cursorOffsetRelativeToOldCursorNode = opts.cursorOffset;
      newCursorNodeStart = 0;
      newCursorNodeText = result.formatted;
    }

    if (oldCursorNodeText === newCursorNodeText) {
      return {
        formatted: result.formatted,
        cursorOffset: newCursorNodeStart + cursorOffsetRelativeToOldCursorNode
      };
    } // diff old and new cursor node texts, with a special cursor
    // symbol inserted to find out where it moves to


    var oldCursorNodeCharArray = oldCursorNodeText.split("");
    oldCursorNodeCharArray.splice(cursorOffsetRelativeToOldCursorNode, 0, CURSOR);
    var newCursorNodeCharArray = newCursorNodeText.split("");
    var cursorNodeDiff = lib.diffArrays(oldCursorNodeCharArray, newCursorNodeCharArray);
    var cursorOffset = newCursorNodeStart;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = cursorNodeDiff[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var entry = _step.value;

        if (entry.removed) {
          if (entry.value.indexOf(CURSOR) > -1) {
            break;
          }
        } else {
          cursorOffset += entry.count;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return {
      formatted: result.formatted,
      cursorOffset: cursorOffset
    };
  }

  return {
    formatted: result.formatted
  };
}

function formatRange(text, opts) {
  var parsed = parser.parse(text, opts);
  var ast = parsed.ast;
  text = parsed.text;
  var range = rangeUtil.calculateRange(text, opts, ast);
  var rangeStart = range.rangeStart;
  var rangeEnd = range.rangeEnd;
  var rangeString = text.slice(rangeStart, rangeEnd); // Try to extend the range backwards to the beginning of the line.
  // This is so we can detect indentation correctly and restore it.
  // Use `Math.min` since `lastIndexOf` returns 0 when `rangeStart` is 0

  var rangeStart2 = Math.min(rangeStart, text.lastIndexOf("\n", rangeStart) + 1);
  var indentString = text.slice(rangeStart2, rangeStart);
  var alignmentSize = util.getAlignmentSize(indentString, opts.tabWidth);
  var rangeResult = coreFormat(rangeString, Object.assign({}, opts, {
    rangeStart: 0,
    rangeEnd: Infinity,
    printWidth: opts.printWidth - alignmentSize,
    // track the cursor offset only if it's within our range
    cursorOffset: opts.cursorOffset >= rangeStart && opts.cursorOffset < rangeEnd ? opts.cursorOffset - rangeStart : -1
  }), alignmentSize); // Since the range contracts to avoid trailing whitespace,
  // we need to remove the newline that was inserted by the `format` call.

  var rangeTrimmed = rangeResult.formatted.trimRight();
  var formatted = text.slice(0, rangeStart) + rangeTrimmed + text.slice(rangeEnd);
  var cursorOffset = opts.cursorOffset;

  if (opts.cursorOffset >= rangeEnd) {
    // handle the case where the cursor was past the end of the range
    cursorOffset = opts.cursorOffset - rangeEnd + (rangeStart + rangeTrimmed.length);
  } else if (rangeResult.cursorOffset !== undefined) {
    // handle the case where the cursor was in the range
    cursorOffset = rangeResult.cursorOffset + rangeStart;
  } // keep the cursor as it was if it was before the start of the range


  return {
    formatted: formatted,
    cursorOffset: cursorOffset
  };
}

function format(text, opts) {
  var selectedParser = parser.resolveParser(opts);
  var hasPragma = !selectedParser.hasPragma || selectedParser.hasPragma(text);

  if (opts.requirePragma && !hasPragma) {
    return {
      formatted: text
    };
  }

  if (opts.rangeStart > 0 || opts.rangeEnd < text.length) {
    return formatRange(text, opts);
  }

  var hasUnicodeBOM = text.charCodeAt(0) === UTF8BOM;

  if (hasUnicodeBOM) {
    text = text.substring(1);
  }

  if (opts.insertPragma && opts.printer.insertPragma && !hasPragma) {
    text = opts.printer.insertPragma(text);
  }

  var result = coreFormat(text, opts);

  if (hasUnicodeBOM) {
    result.formatted = String.fromCharCode(UTF8BOM) + result.formatted;
  }

  return result;
}

var core = {
  formatWithCursor: function formatWithCursor(text, opts) {
    opts = normalizeOptions(opts);
    return format(text, opts);
  },
  parse: function parse(text, opts, massage) {
    opts = normalizeOptions(opts);
    var parsed = parser.parse(text, opts);

    if (massage) {
      parsed.ast = massageAst(parsed.ast, opts);
    }

    return parsed;
  },
  formatAST: function formatAST(ast, opts) {
    opts = normalizeOptions(opts);
    var doc$$1 = astToDoc(ast, opts);
    return _printDocToString(doc$$1, opts);
  },
  // Doesn't handle shebang for now
  formatDoc: function formatDoc(doc$$1, opts) {
    var debug = printDocToDebug(doc$$1);
    opts = normalizeOptions(Object.assign({}, opts, {
      parser: "babylon"
    }));
    return format(debug, opts).formatted;
  },
  printToDoc: function printToDoc(text, opts) {
    opts = normalizeOptions(opts);
    var parsed = parser.parse(text, opts);
    var ast = parsed.ast;
    text = parsed.text;
    attachComments(text, ast, opts);
    return astToDoc(ast, opts);
  },
  printDocToString: function printDocToString(doc$$1, opts) {
    return _printDocToString(doc$$1, normalizeOptions(opts));
  }
};

var _require$$0$builders$1 = doc.builders;
var indent$3 = _require$$0$builders$1.indent;
var join$3 = _require$$0$builders$1.join;
var hardline$4 = _require$$0$builders$1.hardline;
var softline$2 = _require$$0$builders$1.softline;
var literalline$2 = _require$$0$builders$1.literalline;
var concat$5 = _require$$0$builders$1.concat;
var dedentToRoot$1 = _require$$0$builders$1.dedentToRoot;
var _require$$0$utils = doc.utils;
var mapDoc$2 = _require$$0$utils.mapDoc;
var stripTrailingHardline$1 = _require$$0$utils.stripTrailingHardline;

function embed(path, print, textToDoc
/*, options */
) {
  var node = path.getValue();
  var parent = path.getParentNode();
  var parentParent = path.getParentNode(1);

  switch (node.type) {
    case "TemplateLiteral":
      {
        var isCss = [isStyledJsx, isStyledComponents, isCssProp, isAngularComponentStyles].some(function (isIt) {
          return isIt(path);
        });

        if (isCss) {
          // Get full template literal with expressions replaced by placeholders
          var rawQuasis = node.quasis.map(function (q) {
            return q.value.raw;
          });
          var placeholderID = 0;
          var text = rawQuasis.reduce(function (prevVal, currVal, idx) {
            return idx == 0 ? currVal : prevVal + "@prettier-placeholder-" + placeholderID++ + "-id" + currVal;
          }, "");
          var doc$$2 = textToDoc(text, {
            parser: "css"
          });
          return transformCssDoc(doc$$2, path, print);
        }
        /*
         * react-relay and graphql-tag
         * graphql`...`
         * graphql.experimental`...`
         * gql`...`
         *
         * This intentionally excludes Relay Classic tags, as Prettier does not
         * support Relay Classic formatting.
         */


        if (isGraphQL(path)) {
          var expressionDocs = node.expressions ? path.map(print, "expressions") : [];
          var numQuasis = node.quasis.length;

          if (numQuasis === 1 && node.quasis[0].value.raw.trim() === "") {
            return "``";
          }

          var parts = [];

          for (var i = 0; i < numQuasis; i++) {
            var templateElement = node.quasis[i];
            var isFirst = i === 0;
            var isLast = i === numQuasis - 1;
            var _text = templateElement.value.cooked; // Bail out if any of the quasis have an invalid escape sequence
            // (which would make the `cooked` value be `null` or `undefined`)

            if (typeof _text !== "string") {
              return null;
            }

            var lines = _text.split("\n");

            var numLines = lines.length;
            var expressionDoc = expressionDocs[i];
            var startsWithBlankLine = numLines > 2 && lines[0].trim() === "" && lines[1].trim() === "";
            var endsWithBlankLine = numLines > 2 && lines[numLines - 1].trim() === "" && lines[numLines - 2].trim() === "";
            var commentsAndWhitespaceOnly = lines.every(function (line) {
              return /^\s*(?:#[^\r\n]*)?$/.test(line);
            }); // Bail out if an interpolation occurs within a comment.

            if (!isLast && /#[^\r\n]*$/.test(lines[numLines - 1])) {
              return null;
            }

            var _doc = null;

            if (commentsAndWhitespaceOnly) {
              _doc = printGraphqlComments(lines);
            } else {
              _doc = stripTrailingHardline$1(textToDoc(_text, {
                parser: "graphql"
              }));
            }

            if (_doc) {
              _doc = escapeBackticks(_doc);

              if (!isFirst && startsWithBlankLine) {
                parts.push("");
              }

              parts.push(_doc);

              if (!isLast && endsWithBlankLine) {
                parts.push("");
              }
            } else if (!isFirst && !isLast && startsWithBlankLine) {
              parts.push("");
            }

            if (expressionDoc) {
              parts.push(concat$5(["${", expressionDoc, "}"]));
            }
          }

          return concat$5(["`", indent$3(concat$5([hardline$4, join$3(hardline$4, parts)])), hardline$4, "`"]);
        }

        break;
      }

    case "TemplateElement":
      {
        /**
         * md`...`
         * markdown`...`
         */
        if (parentParent && parentParent.type === "TaggedTemplateExpression" && parent.quasis.length === 1 && parentParent.tag.type === "Identifier" && (parentParent.tag.name === "md" || parentParent.tag.name === "markdown")) {
          var _text2 = parent.quasis[0].value.raw.replace(/((?:\\\\)*)\\`/g, function (_, backslashes) {
            return "\\".repeat(backslashes.length / 2) + "`";
          });

          var indentation = getIndentation(_text2);
          var hasIndent = indentation !== "";
          return concat$5([hasIndent ? indent$3(concat$5([softline$2, printMarkdown(_text2.replace(new RegExp("^".concat(indentation), "gm"), ""))])) : concat$5([literalline$2, dedentToRoot$1(printMarkdown(_text2))]), softline$2]);
        }

        break;
      }
  }

  function printMarkdown(text) {
    var doc$$2 = textToDoc(text, {
      parser: "markdown",
      __inJsTemplate: true
    });
    return stripTrailingHardline$1(escapeBackticks(doc$$2));
  }
}

function isPropertyWithinAngularComponentDecorator(path, parentIndexToCheck) {
  var parent = path.getParentNode(parentIndexToCheck);
  return !!(parent && parent.type === "Decorator" && parent.expression && parent.expression.type === "CallExpression" && parent.expression.callee && parent.expression.callee.name === "Component");
}

function getIndentation(str) {
  var firstMatchedIndent = str.match(/^([^\S\n]*)\S/m);
  return firstMatchedIndent === null ? "" : firstMatchedIndent[1];
}

function escapeBackticks(doc$$2) {
  return mapDoc$2(doc$$2, function (currentDoc) {
    if (!currentDoc.parts) {
      return currentDoc;
    }

    var parts = [];
    currentDoc.parts.forEach(function (part) {
      if (typeof part === "string") {
        parts.push(part.replace(/(\\*)`/g, "$1$1\\`"));
      } else {
        parts.push(part);
      }
    });
    return Object.assign({}, currentDoc, {
      parts: parts
    });
  });
}

function transformCssDoc(quasisDoc, path, print) {
  var parentNode = path.getValue();
  var isEmpty = parentNode.quasis.length === 1 && !parentNode.quasis[0].value.raw.trim();

  if (isEmpty) {
    return "``";
  }

  var expressionDocs = parentNode.expressions ? path.map(print, "expressions") : [];
  var newDoc = replacePlaceholders(quasisDoc, expressionDocs);
  /* istanbul ignore if */

  if (!newDoc) {
    throw new Error("Couldn't insert all the expressions");
  }

  return concat$5(["`", indent$3(concat$5([hardline$4, stripTrailingHardline$1(newDoc)])), softline$2, "`"]);
} // Search all the placeholders in the quasisDoc tree
// and replace them with the expression docs one by one
// returns a new doc with all the placeholders replaced,
// or null if it couldn't replace any expression


function replacePlaceholders(quasisDoc, expressionDocs) {
  if (!expressionDocs || !expressionDocs.length) {
    return quasisDoc;
  }

  var expressions = expressionDocs.slice();
  var replaceCounter = 0;
  var newDoc = mapDoc$2(quasisDoc, function (doc$$2) {
    if (!doc$$2 || !doc$$2.parts || !doc$$2.parts.length) {
      return doc$$2;
    }

    var parts = doc$$2.parts;
    var atIndex = parts.indexOf("@");
    var placeholderIndex = atIndex + 1;

    if (atIndex > -1 && typeof parts[placeholderIndex] === "string" && parts[placeholderIndex].startsWith("prettier-placeholder")) {
      // If placeholder is split, join it
      var at = parts[atIndex];
      var placeholder = parts[placeholderIndex];
      var rest = parts.slice(placeholderIndex + 1);
      parts = parts.slice(0, atIndex).concat([at + placeholder]).concat(rest);
    }

    var atPlaceholderIndex = parts.findIndex(function (part) {
      return typeof part === "string" && part.startsWith("@prettier-placeholder");
    });

    if (atPlaceholderIndex > -1) {
      var _placeholder = parts[atPlaceholderIndex];

      var _rest = parts.slice(atPlaceholderIndex + 1);

      var placeholderMatch = _placeholder.match(/@prettier-placeholder-(.+)-id([\s\S]*)/);

      var placeholderID = placeholderMatch[1]; // When the expression has a suffix appended, like:
      // animation: linear ${time}s ease-out;

      var suffix = placeholderMatch[2];
      var expression = expressions[placeholderID];
      replaceCounter++;
      parts = parts.slice(0, atPlaceholderIndex).concat(["${", expression, "}" + suffix]).concat(_rest);
    }

    return Object.assign({}, doc$$2, {
      parts: parts
    });
  });
  return expressions.length === replaceCounter ? newDoc : null;
}

function printGraphqlComments(lines) {
  var parts = [];
  var seenComment = false;
  lines.map(function (textLine) {
    return textLine.trim();
  }).forEach(function (textLine, i, array) {
    // Lines are either whitespace only, or a comment (with poential whitespace
    // around it). Drop whitespace-only lines.
    if (textLine === "") {
      return;
    }

    if (array[i - 1] === "" && seenComment) {
      // If a non-first comment is preceded by a blank (whitespace only) line,
      // add in a blank line.
      parts.push(concat$5([hardline$4, textLine]));
    } else {
      parts.push(textLine);
    }

    seenComment = true;
  }); // If `lines` was whitespace only, return `null`.

  return parts.length === 0 ? null : join$3(hardline$4, parts);
}
/**
 * Template literal in this context:
 * <style jsx>{`div{color:red}`}</style>
 */


function isStyledJsx(path) {
  var node = path.getValue();
  var parent = path.getParentNode();
  var parentParent = path.getParentNode(1);
  return parentParent && node.quasis && parent.type === "JSXExpressionContainer" && parentParent.type === "JSXElement" && parentParent.openingElement.name.name === "style" && parentParent.openingElement.attributes.some(function (attribute) {
    return attribute.name.name === "jsx";
  });
}
/**
 * Angular Components can have:
 * - Inline HTML template
 * - Inline CSS styles
 *
 * ...which are both within template literals somewhere
 * inside of the Component decorator factory.
 *
 * TODO: Format HTML template once prettier's HTML
 * formatting is "ready"
 *
 * E.g.
 * @Component({
 *  template: `<div>...</div>`,
 *  styles: [`h1 { color: blue; }`]
 * })
 */


function isAngularComponentStyles(path) {
  var parent = path.getParentNode();
  var parentParent = path.getParentNode(1);
  var isWithinArrayValueFromProperty = !!(parent && parent.type === "ArrayExpression" && parentParent.type === "Property");

  if (isWithinArrayValueFromProperty && isPropertyWithinAngularComponentDecorator(path, 4)) {
    if (parentParent.key && parentParent.key.name === "styles") {
      return true;
    }
  }

  return false;
}
/**
 * styled-components template literals
 */


function isStyledComponents(path) {
  var parent = path.getParentNode();

  if (!parent || parent.type !== "TaggedTemplateExpression") {
    return false;
  }

  var tag = parent.tag;

  switch (tag.type) {
    case "MemberExpression":
      return (// styled.foo``
        isStyledIdentifier(tag.object) || // Component.extend``
        isStyledExtend(tag)
      );

    case "CallExpression":
      return (// styled(Component)``
        isStyledIdentifier(tag.callee) || tag.callee.type === "MemberExpression" && (tag.callee.object.type === "MemberExpression" && ( // styled.foo.attr({})``
        isStyledIdentifier(tag.callee.object.object) || // Component.extend.attr({)``
        isStyledExtend(tag.callee.object)) || // styled(Component).attr({})``
        tag.callee.object.type === "CallExpression" && isStyledIdentifier(tag.callee.object.callee))
      );

    case "Identifier":
      // css``
      return tag.name === "css";

    default:
      return false;
  }
}
/**
 * JSX element with CSS prop
 */


function isCssProp(path) {
  var parent = path.getParentNode();
  var parentParent = path.getParentNode(1);
  return parentParent && parent.type === "JSXExpressionContainer" && parentParent.type === "JSXAttribute" && parentParent.name.type === "JSXIdentifier" && parentParent.name.name === "css";
}

function isStyledIdentifier(node) {
  return node.type === "Identifier" && node.name === "styled";
}

function isStyledExtend(node) {
  return /^[A-Z]/.test(node.object.name) && node.property.name === "extend";
}
/*
 * react-relay and graphql-tag
 * graphql`...`
 * graphql.experimental`...`
 * gql`...`
 * GraphQL comment block
 *
 * This intentionally excludes Relay Classic tags, as Prettier does not
 * support Relay Classic formatting.
 */


function isGraphQL(path) {
  var node = path.getValue();
  var parent = path.getParentNode(); // This checks for a leading comment that is exactly `/* GraphQL */`
  // In order to be in line with other implementations of this comment tag
  // we will not trim the comment value and we will expect exactly one space on
  // either side of the GraphQL string
  // Also see ./clean.js

  var hasGraphQLComment = node.leadingComments && node.leadingComments.some(function (comment) {
    return comment.type === "CommentBlock" && comment.value === " GraphQL ";
  });
  return hasGraphQLComment || parent && (parent.type === "TaggedTemplateExpression" && (parent.tag.type === "MemberExpression" && parent.tag.object.name === "graphql" && parent.tag.property.name === "experimental" || parent.tag.type === "Identifier" && (parent.tag.name === "gql" || parent.tag.name === "graphql")) || parent.type === "CallExpression" && parent.callee.type === "Identifier" && parent.callee.name === "graphql");
}

var embed_1 = embed;

function clean(ast, newObj, parent) {
  ["range", "raw", "comments", "leadingComments", "trailingComments", "extra", "start", "end", "flags"].forEach(function (name) {
    delete newObj[name];
  });

  if (ast.type === "BigIntLiteral") {
    newObj.value = newObj.value.toLowerCase();
  } // We remove extra `;` and add them when needed


  if (ast.type === "EmptyStatement") {
    return null;
  } // We move text around, including whitespaces and add {" "}


  if (ast.type === "JSXText") {
    return null;
  }

  if (ast.type === "JSXExpressionContainer" && ast.expression.type === "Literal" && ast.expression.value === " ") {
    return null;
  } // (TypeScript) Ignore `static` in `constructor(static p) {}`
  // and `export` in `constructor(export p) {}`


  if (ast.type === "TSParameterProperty" && ast.accessibility === null && !ast.readonly) {
    return {
      type: "Identifier",
      name: ast.parameter.name,
      typeAnnotation: newObj.parameter.typeAnnotation,
      decorators: newObj.decorators
    };
  } // (TypeScript) ignore empty `specifiers` array


  if (ast.type === "TSNamespaceExportDeclaration" && ast.specifiers && ast.specifiers.length === 0) {
    delete newObj.specifiers;
  } // (TypeScript) bypass TSParenthesizedType


  if (ast.type === "TSParenthesizedType" && ast.typeAnnotation.type === "TSTypeAnnotation") {
    return newObj.typeAnnotation.typeAnnotation;
  } // We convert <div></div> to <div />


  if (ast.type === "JSXOpeningElement") {
    delete newObj.selfClosing;
  }

  if (ast.type === "JSXElement") {
    delete newObj.closingElement;
  } // We change {'key': value} into {key: value}


  if ((ast.type === "Property" || ast.type === "ObjectProperty" || ast.type === "MethodDefinition" || ast.type === "ClassProperty" || ast.type === "TSPropertySignature" || ast.type === "ObjectTypeProperty") && _typeof(ast.key) === "object" && ast.key && (ast.key.type === "Literal" || ast.key.type === "StringLiteral" || ast.key.type === "Identifier")) {
    delete newObj.key;
  }

  if (ast.type === "OptionalMemberExpression" && ast.optional === false) {
    newObj.type = "MemberExpression";
    delete newObj.optional;
  } // Remove raw and cooked values from TemplateElement when it's CSS
  // styled-jsx


  if (ast.type === "JSXElement" && ast.openingElement.name.name === "style" && ast.openingElement.attributes.some(function (attr) {
    return attr.name.name === "jsx";
  })) {
    var templateLiterals = newObj.children.filter(function (child) {
      return child.type === "JSXExpressionContainer" && child.expression.type === "TemplateLiteral";
    }).map(function (container) {
      return container.expression;
    });
    var quasis = templateLiterals.reduce(function (quasis, templateLiteral) {
      return quasis.concat(templateLiteral.quasis);
    }, []);
    quasis.forEach(function (q) {
      return delete q.value;
    });
  } // CSS template literals in css prop


  if (ast.type === "JSXAttribute" && ast.name.name === "css" && ast.value.type === "JSXExpressionContainer" && ast.value.expression.type === "TemplateLiteral") {
    newObj.value.expression.quasis.forEach(function (q) {
      return delete q.value;
    });
  } // CSS template literals in Angular Component decorator


  var expression = ast.expression || ast.callee;

  if (ast.type === "Decorator" && expression.type === "CallExpression" && expression.callee.name === "Component" && expression.arguments.length === 1 && expression.arguments[0].properties.some(function (prop) {
    return prop.key.name === "styles" && prop.value.type === "ArrayExpression";
  })) {
    newObj.expression.arguments[0].properties.forEach(function (prop) {
      if (prop.value.type === "ArrayExpression") {
        prop.value.elements[0].quasis.forEach(function (q) {
          return delete q.value;
        });
      }
    });
  } // styled-components, graphql, markdown


  if (ast.type === "TaggedTemplateExpression" && (ast.tag.type === "MemberExpression" || ast.tag.type === "Identifier" && (ast.tag.name === "gql" || ast.tag.name === "graphql" || ast.tag.name === "css" || ast.tag.name === "md" || ast.tag.name === "markdown") || ast.tag.type === "CallExpression")) {
    newObj.quasi.quasis.forEach(function (quasi) {
      return delete quasi.value;
    });
  }

  if (ast.type === "TemplateLiteral") {
    // This checks for a leading comment that is exactly `/* GraphQL */`
    // In order to be in line with other implementations of this comment tag
    // we will not trim the comment value and we will expect exactly one space on
    // either side of the GraphQL string
    // Also see ./embed.js
    var hasGraphQLComment = ast.leadingComments && ast.leadingComments.some(function (comment) {
      return comment.type === "CommentBlock" && comment.value === " GraphQL ";
    });

    if (hasGraphQLComment || parent.type === "CallExpression" && parent.callee.name === "graphql") {
      newObj.quasis.forEach(function (quasi) {
        return delete quasi.value;
      });
    }
  }
}

var clean_1 = clean;

var detectNewline = createCommonjsModule(function (module) {
  'use strict';

  module.exports = function (str) {
    if (typeof str !== 'string') {
      throw new TypeError('Expected a string');
    }

    var newlines = str.match(/(?:\r?\n)/g) || [];

    if (newlines.length === 0) {
      return null;
    }

    var crlf = newlines.filter(function (el) {
      return el === '\r\n';
    }).length;
    var lf = newlines.length - crlf;
    return crlf > lf ? '\r\n' : '\n';
  };

  module.exports.graceful = function (str) {
    return module.exports(str) || '\n';
  };
});

var build = createCommonjsModule(function (module, exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.extract = extract;
  exports.strip = strip;
  exports.parse = parse;
  exports.parseWithComments = parseWithComments;
  exports.print = print;

  var _detectNewline;

  function _load_detectNewline() {
    return _detectNewline = _interopRequireDefault(detectNewline);
  }

  var _os;

  function _load_os() {
    return _os = require$$1$1;
  }

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }
  /**
   * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   *
   */


  var commentEndRe = /\*\/$/;
  var commentStartRe = /^\/\*\*/;
  var docblockRe = /^\s*(\/\*\*?(.|\r?\n)*?\*\/)/;
  var lineCommentRe = /(^|\s+)\/\/([^\r\n]*)/g;
  var ltrimNewlineRe = /^(\r?\n)+/;
  var multilineRe = /(?:^|\r?\n) *(@[^\r\n]*?) *\r?\n *(?![^@\r\n]*\/\/[^]*)([^@\r\n\s][^@\r\n]+?) *\r?\n/g;
  var propertyRe = /(?:^|\r?\n) *@(\S+) *([^\r\n]*)/g;
  var stringStartRe = /(\r?\n|^) *\* ?/g;

  function extract(contents) {
    var match = contents.match(docblockRe);
    return match ? match[0].trimLeft() : '';
  }

  function strip(contents) {
    var match = contents.match(docblockRe);
    return match && match[0] ? contents.substring(match[0].length) : contents;
  }

  function parse(docblock) {
    return parseWithComments(docblock).pragmas;
  }

  function parseWithComments(docblock) {
    var line = (0, (_detectNewline || _load_detectNewline()).default)(docblock) || (_os || _load_os()).EOL;

    docblock = docblock.replace(commentStartRe, '').replace(commentEndRe, '').replace(stringStartRe, '$1'); // Normalize multi-line directives

    var prev = '';

    while (prev !== docblock) {
      prev = docblock;
      docblock = docblock.replace(multilineRe, "".concat(line, "$1 $2").concat(line));
    }

    docblock = docblock.replace(ltrimNewlineRe, '').trimRight();
    var result = Object.create(null);
    var comments = docblock.replace(propertyRe, '').replace(ltrimNewlineRe, '').trimRight();
    var match;

    while (match = propertyRe.exec(docblock)) {
      // strip linecomments from pragmas
      var nextPragma = match[2].replace(lineCommentRe, '');

      if (typeof result[match[1]] === 'string' || Array.isArray(result[match[1]])) {
        result[match[1]] = [].concat(result[match[1]], nextPragma);
      } else {
        result[match[1]] = nextPragma;
      }
    }

    return {
      comments: comments,
      pragmas: result
    };
  }

  function print(_ref) {
    var _ref$comments = _ref.comments;
    var comments = _ref$comments === undefined ? '' : _ref$comments;
    var _ref$pragmas = _ref.pragmas;
    var pragmas = _ref$pragmas === undefined ? {} : _ref$pragmas;

    var line = (0, (_detectNewline || _load_detectNewline()).default)(comments) || (_os || _load_os()).EOL;

    var head = '/**';
    var start = ' *';
    var tail = ' */';
    var keys = Object.keys(pragmas);
    var printedObject = keys.map(function (key) {
      return printKeyValues(key, pragmas[key]);
    }).reduce(function (arr, next) {
      return arr.concat(next);
    }, []).map(function (keyValue) {
      return start + ' ' + keyValue + line;
    }).join('');

    if (!comments) {
      if (keys.length === 0) {
        return '';
      }

      if (keys.length === 1 && !Array.isArray(pragmas[keys[0]])) {
        var value = pragmas[keys[0]];
        return "".concat(head, " ").concat(printKeyValues(keys[0], value)[0]).concat(tail);
      }
    }

    var printedComments = comments.split(line).map(function (textLine) {
      return "".concat(start, " ").concat(textLine);
    }).join(line) + line;
    return head + line + (comments ? printedComments : '') + (comments && keys.length ? start + line : '') + printedObject + tail;
  }

  function printKeyValues(key, valueOrArray) {
    return [].concat(valueOrArray).map(function (value) {
      return "@".concat(key, " ").concat(value).trim();
    });
  }
});
unwrapExports(build);

function hasPragma(text) {
  var pragmas = Object.keys(build.parse(build.extract(text)));
  return pragmas.indexOf("prettier") !== -1 || pragmas.indexOf("format") !== -1;
}

function insertPragma$1(text) {
  var parsedDocblock = build.parseWithComments(build.extract(text));
  var pragmas = Object.assign({
    format: ""
  }, parsedDocblock.pragmas);
  var newDocblock = build.print({
    pragmas: pragmas,
    comments: parsedDocblock.comments.replace(/^(\s+?\r?\n)+/, "") // remove leading newlines

  });
  var strippedText = build.strip(text);
  var separatingNewlines = strippedText.startsWith("\n") ? "\n" : "\n\n";
  return newDocblock + separatingNewlines + strippedText;
}

var pragma = {
  hasPragma: hasPragma,
  insertPragma: insertPragma$1
};

var addLeadingComment$2 = utilShared.addLeadingComment;
var addTrailingComment$2 = utilShared.addTrailingComment;
var addDanglingComment$2 = utilShared.addDanglingComment;

function handleOwnLineComment(comment, text, options, ast, isLastComment) {
  var precedingNode = comment.precedingNode,
      enclosingNode = comment.enclosingNode,
      followingNode = comment.followingNode;

  if (handleLastFunctionArgComments(text, precedingNode, enclosingNode, followingNode, comment, options) || handleMemberExpressionComments(enclosingNode, followingNode, comment) || handleIfStatementComments(text, precedingNode, enclosingNode, followingNode, comment, options) || handleTryStatementComments(enclosingNode, followingNode, comment) || handleClassComments(enclosingNode, precedingNode, followingNode, comment) || handleImportSpecifierComments(enclosingNode, comment) || handleForComments(enclosingNode, precedingNode, comment) || handleUnionTypeComments(precedingNode, enclosingNode, followingNode, comment) || handleOnlyComments(enclosingNode, ast, comment, isLastComment) || handleImportDeclarationComments(text, enclosingNode, precedingNode, comment, options) || handleAssignmentPatternComments(enclosingNode, comment) || handleMethodNameComments(text, enclosingNode, precedingNode, comment, options)) {
    return true;
  }

  return false;
}

function handleEndOfLineComment(comment, text, options, ast, isLastComment) {
  var precedingNode = comment.precedingNode,
      enclosingNode = comment.enclosingNode,
      followingNode = comment.followingNode;

  if (handleLastFunctionArgComments(text, precedingNode, enclosingNode, followingNode, comment, options) || handleConditionalExpressionComments(enclosingNode, precedingNode, followingNode, comment, text, options) || handleImportSpecifierComments(enclosingNode, comment) || handleIfStatementComments(text, precedingNode, enclosingNode, followingNode, comment, options) || handleClassComments(enclosingNode, precedingNode, followingNode, comment) || handleLabeledStatementComments(enclosingNode, comment) || handleCallExpressionComments(precedingNode, enclosingNode, comment) || handlePropertyComments(enclosingNode, comment) || handleOnlyComments(enclosingNode, ast, comment, isLastComment) || handleTypeAliasComments(enclosingNode, followingNode, comment) || handleVariableDeclaratorComments(enclosingNode, followingNode, comment)) {
    return true;
  }

  return false;
}

function handleRemainingComment(comment, text, options, ast, isLastComment) {
  var precedingNode = comment.precedingNode,
      enclosingNode = comment.enclosingNode,
      followingNode = comment.followingNode;

  if (handleIfStatementComments(text, precedingNode, enclosingNode, followingNode, comment, options) || handleObjectPropertyAssignment(enclosingNode, precedingNode, comment) || handleCommentInEmptyParens(text, enclosingNode, comment, options) || handleMethodNameComments(text, enclosingNode, precedingNode, comment, options) || handleOnlyComments(enclosingNode, ast, comment, isLastComment) || handleCommentAfterArrowParams(text, enclosingNode, comment, options) || handleFunctionNameComments(text, enclosingNode, precedingNode, comment, options) || handleTSMappedTypeComments(text, enclosingNode, precedingNode, followingNode, comment) || handleBreakAndContinueStatementComments(enclosingNode, comment)) {
    return true;
  }

  return false;
}

function addBlockStatementFirstComment(node, comment) {
  var body = node.body.filter(function (n) {
    return n.type !== "EmptyStatement";
  });

  if (body.length === 0) {
    addDanglingComment$2(node, comment);
  } else {
    addLeadingComment$2(body[0], comment);
  }
}

function addBlockOrNotComment(node, comment) {
  if (node.type === "BlockStatement") {
    addBlockStatementFirstComment(node, comment);
  } else {
    addLeadingComment$2(node, comment);
  }
} // There are often comments before the else clause of if statements like
//
//   if (1) { ... }
//   // comment
//   else { ... }
//
// They are being attached as leading comments of the BlockExpression which
// is not well printed. What we want is to instead move the comment inside
// of the block and make it leadingComment of the first element of the block
// or dangling comment of the block if there is nothing inside
//
//   if (1) { ... }
//   else {
//     // comment
//     ...
//   }


function handleIfStatementComments(text, precedingNode, enclosingNode, followingNode, comment, options) {
  if (!enclosingNode || enclosingNode.type !== "IfStatement" || !followingNode) {
    return false;
  } // We unfortunately have no way using the AST or location of nodes to know
  // if the comment is positioned before the condition parenthesis:
  //   if (a /* comment */) {}
  // The only workaround I found is to look at the next character to see if
  // it is a ).


  var nextCharacter = util.getNextNonSpaceNonCommentCharacter(text, comment, options.locEnd);

  if (nextCharacter === ")") {
    addTrailingComment$2(precedingNode, comment);
    return true;
  } // Comments before `else`:
  // - treat as trailing comments of the consequent, if it's a BlockStatement
  // - treat as a dangling comment otherwise


  if (precedingNode === enclosingNode.consequent && followingNode === enclosingNode.alternate) {
    if (precedingNode.type === "BlockStatement") {
      addTrailingComment$2(precedingNode, comment);
    } else {
      addDanglingComment$2(enclosingNode, comment);
    }

    return true;
  }

  if (followingNode.type === "BlockStatement") {
    addBlockStatementFirstComment(followingNode, comment);
    return true;
  }

  if (followingNode.type === "IfStatement") {
    addBlockOrNotComment(followingNode.consequent, comment);
    return true;
  } // For comments positioned after the condition parenthesis in an if statement
  // before the consequent with or without brackets on, such as
  // if (a) /* comment */ {} or if (a) /* comment */ true,
  // we look at the next character to see if it is a { or if the following node
  // is the consequent for the if statement


  if (nextCharacter === "{" || enclosingNode.consequent === followingNode) {
    addLeadingComment$2(followingNode, comment);
    return true;
  }

  return false;
} // Same as IfStatement but for TryStatement


function handleTryStatementComments(enclosingNode, followingNode, comment) {
  if (!enclosingNode || enclosingNode.type !== "TryStatement" || !followingNode) {
    return false;
  }

  if (followingNode.type === "BlockStatement") {
    addBlockStatementFirstComment(followingNode, comment);
    return true;
  }

  if (followingNode.type === "TryStatement") {
    addBlockOrNotComment(followingNode.finalizer, comment);
    return true;
  }

  if (followingNode.type === "CatchClause") {
    addBlockOrNotComment(followingNode.body, comment);
    return true;
  }

  return false;
}

function handleMemberExpressionComments(enclosingNode, followingNode, comment) {
  if (enclosingNode && enclosingNode.type === "MemberExpression" && followingNode && followingNode.type === "Identifier") {
    addLeadingComment$2(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleConditionalExpressionComments(enclosingNode, precedingNode, followingNode, comment, text, options) {
  var isSameLineAsPrecedingNode = precedingNode && !util.hasNewlineInRange(text, options.locEnd(precedingNode), options.locStart(comment));

  if ((!precedingNode || !isSameLineAsPrecedingNode) && enclosingNode && enclosingNode.type === "ConditionalExpression" && followingNode) {
    addLeadingComment$2(followingNode, comment);
    return true;
  }

  return false;
}

function handleObjectPropertyAssignment(enclosingNode, precedingNode, comment) {
  if (enclosingNode && (enclosingNode.type === "ObjectProperty" || enclosingNode.type === "Property") && enclosingNode.shorthand && enclosingNode.key === precedingNode && enclosingNode.value.type === "AssignmentPattern") {
    addTrailingComment$2(enclosingNode.value.left, comment);
    return true;
  }

  return false;
}

function handleClassComments(enclosingNode, precedingNode, followingNode, comment) {
  if (enclosingNode && (enclosingNode.type === "ClassDeclaration" || enclosingNode.type === "ClassExpression") && enclosingNode.decorators && enclosingNode.decorators.length > 0 && !(followingNode && followingNode.type === "Decorator")) {
    if (!enclosingNode.decorators || enclosingNode.decorators.length === 0) {
      addLeadingComment$2(enclosingNode, comment);
    } else {
      addTrailingComment$2(enclosingNode.decorators[enclosingNode.decorators.length - 1], comment);
    }

    return true;
  }

  return false;
}

function handleMethodNameComments(text, enclosingNode, precedingNode, comment, options) {
  // This is only needed for estree parsers (flow, typescript) to attach
  // after a method name:
  // obj = { fn /*comment*/() {} };
  if (enclosingNode && precedingNode && (enclosingNode.type === "Property" || enclosingNode.type === "MethodDefinition") && precedingNode.type === "Identifier" && enclosingNode.key === precedingNode && // special Property case: { key: /*comment*/(value) };
  // comment should be attached to value instead of key
  util.getNextNonSpaceNonCommentCharacter(text, precedingNode, options.locEnd) !== ":") {
    addTrailingComment$2(precedingNode, comment);
    return true;
  } // Print comments between decorators and class methods as a trailing comment
  // on the decorator node instead of the method node


  if (precedingNode && enclosingNode && precedingNode.type === "Decorator" && (enclosingNode.type === "ClassMethod" || enclosingNode.type === "ClassProperty" || enclosingNode.type === "TSAbstractClassProperty" || enclosingNode.type === "TSAbstractMethodDefinition" || enclosingNode.type === "MethodDefinition")) {
    addTrailingComment$2(precedingNode, comment);
    return true;
  }

  return false;
}

function handleFunctionNameComments(text, enclosingNode, precedingNode, comment, options) {
  if (util.getNextNonSpaceNonCommentCharacter(text, comment, options.locEnd) !== "(") {
    return false;
  }

  if (precedingNode && enclosingNode && (enclosingNode.type === "FunctionDeclaration" || enclosingNode.type === "FunctionExpression" || enclosingNode.type === "ClassMethod" || enclosingNode.type === "MethodDefinition" || enclosingNode.type === "ObjectMethod")) {
    addTrailingComment$2(precedingNode, comment);
    return true;
  }

  return false;
}

function handleCommentAfterArrowParams(text, enclosingNode, comment, options) {
  if (!(enclosingNode && enclosingNode.type === "ArrowFunctionExpression")) {
    return false;
  }

  var index = utilShared.getNextNonSpaceNonCommentCharacterIndex(text, comment, options);

  if (text.substr(index, 2) === "=>") {
    addDanglingComment$2(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleCommentInEmptyParens(text, enclosingNode, comment, options) {
  if (util.getNextNonSpaceNonCommentCharacter(text, comment, options.locEnd) !== ")") {
    return false;
  } // Only add dangling comments to fix the case when no params are present,
  // i.e. a function without any argument.


  if (enclosingNode && ((enclosingNode.type === "FunctionDeclaration" || enclosingNode.type === "FunctionExpression" || enclosingNode.type === "ArrowFunctionExpression" && (enclosingNode.body.type !== "CallExpression" || enclosingNode.body.arguments.length === 0) || enclosingNode.type === "ClassMethod" || enclosingNode.type === "ObjectMethod") && enclosingNode.params.length === 0 || enclosingNode.type === "CallExpression" && enclosingNode.arguments.length === 0)) {
    addDanglingComment$2(enclosingNode, comment);
    return true;
  }

  if (enclosingNode && enclosingNode.type === "MethodDefinition" && enclosingNode.value.params.length === 0) {
    addDanglingComment$2(enclosingNode.value, comment);
    return true;
  }

  return false;
}

function handleLastFunctionArgComments(text, precedingNode, enclosingNode, followingNode, comment, options) {
  // Type definitions functions
  if (precedingNode && precedingNode.type === "FunctionTypeParam" && enclosingNode && enclosingNode.type === "FunctionTypeAnnotation" && followingNode && followingNode.type !== "FunctionTypeParam") {
    addTrailingComment$2(precedingNode, comment);
    return true;
  } // Real functions


  if (precedingNode && (precedingNode.type === "Identifier" || precedingNode.type === "AssignmentPattern") && enclosingNode && (enclosingNode.type === "ArrowFunctionExpression" || enclosingNode.type === "FunctionExpression" || enclosingNode.type === "FunctionDeclaration" || enclosingNode.type === "ObjectMethod" || enclosingNode.type === "ClassMethod") && util.getNextNonSpaceNonCommentCharacter(text, comment, options.locEnd) === ")") {
    addTrailingComment$2(precedingNode, comment);
    return true;
  }

  return false;
}

function handleImportSpecifierComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "ImportSpecifier") {
    addLeadingComment$2(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleLabeledStatementComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "LabeledStatement") {
    addLeadingComment$2(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleBreakAndContinueStatementComments(enclosingNode, comment) {
  if (enclosingNode && (enclosingNode.type === "ContinueStatement" || enclosingNode.type === "BreakStatement") && !enclosingNode.label) {
    addTrailingComment$2(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleCallExpressionComments(precedingNode, enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "CallExpression" && precedingNode && enclosingNode.callee === precedingNode && enclosingNode.arguments.length > 0) {
    addLeadingComment$2(enclosingNode.arguments[0], comment);
    return true;
  }

  return false;
}

function handleUnionTypeComments(precedingNode, enclosingNode, followingNode, comment) {
  if (enclosingNode && (enclosingNode.type === "UnionTypeAnnotation" || enclosingNode.type === "TSUnionType")) {
    addTrailingComment$2(precedingNode, comment);
    return true;
  }

  return false;
}

function handlePropertyComments(enclosingNode, comment) {
  if (enclosingNode && (enclosingNode.type === "Property" || enclosingNode.type === "ObjectProperty")) {
    addLeadingComment$2(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleOnlyComments(enclosingNode, ast, comment, isLastComment) {
  // With Flow the enclosingNode is undefined so use the AST instead.
  if (ast && ast.body && ast.body.length === 0) {
    if (isLastComment) {
      addDanglingComment$2(ast, comment);
    } else {
      addLeadingComment$2(ast, comment);
    }

    return true;
  } else if (enclosingNode && enclosingNode.type === "Program" && enclosingNode.body.length === 0 && enclosingNode.directives && enclosingNode.directives.length === 0) {
    if (isLastComment) {
      addDanglingComment$2(enclosingNode, comment);
    } else {
      addLeadingComment$2(enclosingNode, comment);
    }

    return true;
  }

  return false;
}

function handleForComments(enclosingNode, precedingNode, comment) {
  if (enclosingNode && (enclosingNode.type === "ForInStatement" || enclosingNode.type === "ForOfStatement")) {
    addLeadingComment$2(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleImportDeclarationComments(text, enclosingNode, precedingNode, comment, options) {
  if (precedingNode && enclosingNode && enclosingNode.type === "ImportDeclaration" && util.hasNewline(text, options.locEnd(comment))) {
    addTrailingComment$2(precedingNode, comment);
    return true;
  }

  return false;
}

function handleAssignmentPatternComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "AssignmentPattern") {
    addLeadingComment$2(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleTypeAliasComments(enclosingNode, followingNode, comment) {
  if (enclosingNode && enclosingNode.type === "TypeAlias") {
    addLeadingComment$2(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleVariableDeclaratorComments(enclosingNode, followingNode, comment) {
  if (enclosingNode && (enclosingNode.type === "VariableDeclarator" || enclosingNode.type === "AssignmentExpression") && followingNode && (followingNode.type === "ObjectExpression" || followingNode.type === "ArrayExpression" || followingNode.type === "TemplateLiteral" || followingNode.type === "TaggedTemplateExpression")) {
    addLeadingComment$2(followingNode, comment);
    return true;
  }

  return false;
}

function handleTSMappedTypeComments(text, enclosingNode, precedingNode, followingNode, comment) {
  if (!enclosingNode || enclosingNode.type !== "TSMappedType") {
    return false;
  }

  if (followingNode && followingNode.type === "TSTypeParameter" && followingNode.name) {
    addLeadingComment$2(followingNode.name, comment);
    return true;
  }

  if (precedingNode && precedingNode.type === "TSTypeParameter" && precedingNode.constraint) {
    addTrailingComment$2(precedingNode.constraint, comment);
    return true;
  }

  return false;
}

function isBlockComment(comment) {
  return comment.type === "Block" || comment.type === "CommentBlock";
}

var comments$3 = {
  handleOwnLineComment: handleOwnLineComment,
  handleEndOfLineComment: handleEndOfLineComment,
  handleRemainingComment: handleRemainingComment,
  isBlockComment: isBlockComment
};

function hasClosureCompilerTypeCastComment(text, path, locStart, locEnd) {
  // https://github.com/google/closure-compiler/wiki/Annotating-Types#type-casts
  // Syntax example: var x = /** @type {string} */ (fruit);
  var n = path.getValue();
  return util.getNextNonSpaceNonCommentCharacter(text, n, locEnd) === ")" && (hasTypeCastComment(n) || hasAncestorTypeCastComment(0)); // for sub-item: /** @type {array} */ (numberOrString).map(x => x);

  function hasAncestorTypeCastComment(index) {
    var ancestor = path.getParentNode(index);
    return ancestor && util.getNextNonSpaceNonCommentCharacter(text, ancestor, locEnd) !== ")" && /^[\s(]*$/.test(text.slice(locStart(ancestor), locStart(n))) ? hasTypeCastComment(ancestor) || hasAncestorTypeCastComment(index + 1) : false;
  }

  function hasTypeCastComment(node) {
    return node.comments && node.comments.some(function (comment) {
      return comment.leading && comments$3.isBlockComment(comment) && comment.value.match(/^\*\s*@type\s*{[^}]+}\s*$/) && util.getNextNonSpaceNonCommentCharacter(text, comment, locEnd) === "(";
    });
  }
}

function needsParens(path, options) {
  var parent = path.getParentNode();

  if (!parent) {
    return false;
  }

  var name = path.getName();
  var node = path.getNode(); // If the value of this path is some child of a Node and not a Node
  // itself, then it doesn't need parentheses. Only Node objects (in
  // fact, only Expression nodes) need parentheses.

  if (path.getValue() !== node) {
    return false;
  } // Only statements don't need parentheses.


  if (isStatement(node)) {
    return false;
  } // Closure compiler requires that type casted expressions to be surrounded by
  // parentheses.


  if (hasClosureCompilerTypeCastComment(options.originalText, path, options.locStart, options.locEnd)) {
    return true;
  } // Identifiers never need parentheses.


  if (node.type === "Identifier") {
    return false;
  }

  if (parent.type === "ParenthesizedExpression") {
    return false;
  } // Add parens around the extends clause of a class. It is needed for almost
  // all expressions.


  if ((parent.type === "ClassDeclaration" || parent.type === "ClassExpression") && parent.superClass === node && (node.type === "ArrowFunctionExpression" || node.type === "AssignmentExpression" || node.type === "AwaitExpression" || node.type === "BinaryExpression" || node.type === "ConditionalExpression" || node.type === "LogicalExpression" || node.type === "NewExpression" || node.type === "ObjectExpression" || node.type === "ParenthesizedExpression" || node.type === "SequenceExpression" || node.type === "TaggedTemplateExpression" || node.type === "UnaryExpression" || node.type === "UpdateExpression" || node.type === "YieldExpression")) {
    return true;
  }

  if (parent.type === "ArrowFunctionExpression" && parent.body === node && node.type !== "SequenceExpression" && // these have parens added anyway
  util.startsWithNoLookaheadToken(node,
  /* forbidFunctionClassAndDoExpr */
  false) || parent.type === "ExpressionStatement" && util.startsWithNoLookaheadToken(node,
  /* forbidFunctionClassAndDoExpr */
  true)) {
    return true;
  }

  switch (node.type) {
    case "CallExpression":
      {
        var firstParentNotMemberExpression = parent;
        var i = 0;

        while (firstParentNotMemberExpression && firstParentNotMemberExpression.type === "MemberExpression") {
          firstParentNotMemberExpression = path.getParentNode(++i);
        }

        if (firstParentNotMemberExpression.type === "NewExpression" && firstParentNotMemberExpression.callee === path.getParentNode(i - 1)) {
          return true;
        }

        return false;
      }

    case "SpreadElement":
    case "SpreadProperty":
      return parent.type === "MemberExpression" && name === "object" && parent.object === node;

    case "UpdateExpression":
      if (parent.type === "UnaryExpression") {
        return node.prefix && (node.operator === "++" && parent.operator === "+" || node.operator === "--" && parent.operator === "-");
      }

    // else fallthrough

    case "UnaryExpression":
      switch (parent.type) {
        case "UnaryExpression":
          return node.operator === parent.operator && (node.operator === "+" || node.operator === "-");

        case "BindExpression":
        case "MemberExpression":
          return name === "object" && parent.object === node;

        case "TaggedTemplateExpression":
          return true;

        case "NewExpression":
        case "CallExpression":
          return name === "callee" && parent.callee === node;

        case "BinaryExpression":
          return parent.operator === "**" && name === "left";

        case "TSNonNullExpression":
          return true;

        default:
          return false;
      }

    case "BinaryExpression":
      {
        if (parent.type === "UpdateExpression") {
          return true;
        }

        var isLeftOfAForStatement = function isLeftOfAForStatement(node) {
          var i = 0;

          while (node) {
            var _parent = path.getParentNode(i++);

            if (!_parent) {
              return false;
            }

            if (_parent.type === "ForStatement" && _parent.init === node) {
              return true;
            }

            node = _parent;
          }

          return false;
        };

        if (node.operator === "in" && isLeftOfAForStatement(node)) {
          return true;
        }
      }
    // fallthrough

    case "TSTypeAssertionExpression":
    case "TSAsExpression":
    case "LogicalExpression":
      switch (parent.type) {
        case "ConditionalExpression":
          return node.type === "TSAsExpression";

        case "CallExpression":
        case "NewExpression":
          return name === "callee" && parent.callee === node;

        case "ClassDeclaration":
        case "TSAbstractClassDeclaration":
          return name === "superClass" && parent.superClass === node;

        case "TSTypeAssertionExpression":
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "BindExpression":
        case "AwaitExpression":
        case "TSAsExpression":
        case "TSNonNullExpression":
        case "UpdateExpression":
          return true;

        case "MemberExpression":
          return name === "object" && parent.object === node;

        case "AssignmentExpression":
          return parent.left === node && (node.type === "TSTypeAssertionExpression" || node.type === "TSAsExpression");

        case "Decorator":
          return parent.expression === node && (node.type === "TSTypeAssertionExpression" || node.type === "TSAsExpression");

        case "BinaryExpression":
        case "LogicalExpression":
          {
            if (!node.operator && node.type !== "TSTypeAssertionExpression") {
              return true;
            }

            var po = parent.operator;
            var pp = util.getPrecedence(po);
            var no = node.operator;
            var np = util.getPrecedence(no);

            if (pp > np) {
              return true;
            }

            if ((po === "||" || po === "??") && no === "&&") {
              return true;
            }

            if (pp === np && name === "right") {
              assert$3.strictEqual(parent.right, node);
              return true;
            }

            if (pp === np && !util.shouldFlatten(po, no)) {
              return true;
            }

            if (pp < np && no === "%") {
              return !util.shouldFlatten(po, no);
            } // Add parenthesis when working with binary operators
            // It's not stricly needed but helps with code understanding


            if (util.isBitwiseOperator(po)) {
              return true;
            }

            return false;
          }

        default:
          return false;
      }

    case "TSParenthesizedType":
      {
        var grandParent = path.getParentNode(1);

        if ((parent.type === "TSTypeParameter" || parent.type === "TypeParameter" || parent.type === "VariableDeclarator" || parent.type === "TSTypeAnnotation" || parent.type === "GenericTypeAnnotation" || parent.type === "TSTypeReference") && node.typeAnnotation.type === "TSTypeAnnotation" && node.typeAnnotation.typeAnnotation.type !== "TSFunctionType" && grandParent.type !== "TSTypeOperator") {
          return false;
        } // Delegate to inner TSParenthesizedType


        if (node.typeAnnotation.type === "TSParenthesizedType") {
          return false;
        }

        return true;
      }

    case "SequenceExpression":
      switch (parent.type) {
        case "ReturnStatement":
          return false;

        case "ForStatement":
          // Although parentheses wouldn't hurt around sequence
          // expressions in the head of for loops, traditional style
          // dictates that e.g. i++, j++ should not be wrapped with
          // parentheses.
          return false;

        case "ExpressionStatement":
          return name !== "expression";

        case "ArrowFunctionExpression":
          // We do need parentheses, but SequenceExpressions are handled
          // specially when printing bodies of arrow functions.
          return name !== "body";

        default:
          // Otherwise err on the side of overparenthesization, adding
          // explicit exceptions above if this proves overzealous.
          return true;
      }

    case "YieldExpression":
      if (parent.type === "UnaryExpression" || parent.type === "AwaitExpression" || parent.type === "TSAsExpression" || parent.type === "TSNonNullExpression") {
        return true;
      }

    // else fallthrough

    case "AwaitExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "BinaryExpression":
        case "LogicalExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "TSAsExpression":
        case "TSNonNullExpression":
        case "BindExpression":
          return true;

        case "MemberExpression":
          return parent.object === node;

        case "NewExpression":
        case "CallExpression":
          return parent.callee === node;

        case "ConditionalExpression":
          return parent.test === node;

        default:
          return false;
      }

    case "ArrayTypeAnnotation":
      return parent.type === "NullableTypeAnnotation";

    case "IntersectionTypeAnnotation":
    case "UnionTypeAnnotation":
      return parent.type === "ArrayTypeAnnotation" || parent.type === "NullableTypeAnnotation" || parent.type === "IntersectionTypeAnnotation" || parent.type === "UnionTypeAnnotation";

    case "NullableTypeAnnotation":
      return parent.type === "ArrayTypeAnnotation";

    case "FunctionTypeAnnotation":
      {
        var ancestor = parent.type === "NullableTypeAnnotation" ? path.getParentNode(1) : parent;
        return ancestor.type === "UnionTypeAnnotation" || ancestor.type === "IntersectionTypeAnnotation" || ancestor.type === "ArrayTypeAnnotation" || // We should check ancestor's parent to know whether the parentheses
        // are really needed, but since ??T doesn't make sense this check
        // will almost never be true.
        ancestor.type === "NullableTypeAnnotation";
      }

    case "StringLiteral":
    case "NumericLiteral":
    case "Literal":
      if (typeof node.value === "string" && parent.type === "ExpressionStatement" && ( // TypeScript workaround for eslint/typescript-eslint-parser#267
      // See corresponding workaround in printer.js case: "Literal"
      options.parser !== "typescript" && !parent.directive || options.parser === "typescript" && options.originalText.substr(options.locStart(node) - 1, 1) === "(")) {
        // To avoid becoming a directive
        var _grandParent = path.getParentNode(1);

        return _grandParent.type === "Program" || _grandParent.type === "BlockStatement";
      }

      return parent.type === "MemberExpression" && typeof node.value === "number" && name === "object" && parent.object === node;

    case "AssignmentExpression":
      {
        var _grandParent2 = path.getParentNode(1);

        if (parent.type === "ArrowFunctionExpression" && parent.body === node) {
          return true;
        } else if (parent.type === "ClassProperty" && parent.key === node && parent.computed) {
          return false;
        } else if (parent.type === "TSPropertySignature" && parent.name === node) {
          return false;
        } else if (parent.type === "ForStatement" && (parent.init === node || parent.update === node)) {
          return false;
        } else if (parent.type === "ExpressionStatement") {
          return node.left.type === "ObjectPattern";
        } else if (parent.type === "TSPropertySignature" && parent.key === node) {
          return false;
        } else if (parent.type === "AssignmentExpression") {
          return false;
        } else if (parent.type === "SequenceExpression" && _grandParent2 && _grandParent2.type === "ForStatement" && (_grandParent2.init === parent || _grandParent2.update === parent)) {
          return false;
        }

        return true;
      }

    case "ConditionalExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "BinaryExpression":
        case "LogicalExpression":
        case "ExportDefaultDeclaration":
        case "AwaitExpression":
        case "JSXSpreadAttribute":
        case "TSTypeAssertionExpression":
        case "TypeCastExpression":
        case "TSAsExpression":
        case "TSNonNullExpression":
          return true;

        case "NewExpression":
        case "CallExpression":
          return name === "callee" && parent.callee === node;

        case "ConditionalExpression":
          return name === "test" && parent.test === node;

        case "MemberExpression":
          return name === "object" && parent.object === node;

        default:
          return false;
      }

    case "FunctionExpression":
      switch (parent.type) {
        case "CallExpression":
          return name === "callee";
        // Not strictly necessary, but it's clearer to the reader if IIFEs are wrapped in parentheses.

        case "TaggedTemplateExpression":
          return true;
        // This is basically a kind of IIFE.

        case "ExportDefaultDeclaration":
          return true;

        default:
          return false;
      }

    case "ArrowFunctionExpression":
      switch (parent.type) {
        case "CallExpression":
          return name === "callee";

        case "NewExpression":
          return name === "callee";

        case "MemberExpression":
          return name === "object";

        case "TSAsExpression":
        case "BindExpression":
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "LogicalExpression":
        case "BinaryExpression":
        case "AwaitExpression":
        case "TSTypeAssertionExpression":
          return true;

        case "ConditionalExpression":
          return name === "test";

        default:
          return false;
      }

    case "ClassExpression":
      return parent.type === "ExportDefaultDeclaration";

    case "OptionalMemberExpression":
      return parent.type === "MemberExpression";
  }

  return false;
}

function isStatement(node) {
  return node.type === "BlockStatement" || node.type === "BreakStatement" || node.type === "ClassBody" || node.type === "ClassDeclaration" || node.type === "ClassMethod" || node.type === "ClassProperty" || node.type === "ClassPrivateProperty" || node.type === "ContinueStatement" || node.type === "DebuggerStatement" || node.type === "DeclareClass" || node.type === "DeclareExportAllDeclaration" || node.type === "DeclareExportDeclaration" || node.type === "DeclareFunction" || node.type === "DeclareInterface" || node.type === "DeclareModule" || node.type === "DeclareModuleExports" || node.type === "DeclareVariable" || node.type === "DoWhileStatement" || node.type === "ExportAllDeclaration" || node.type === "ExportDefaultDeclaration" || node.type === "ExportNamedDeclaration" || node.type === "ExpressionStatement" || node.type === "ForAwaitStatement" || node.type === "ForInStatement" || node.type === "ForOfStatement" || node.type === "ForStatement" || node.type === "FunctionDeclaration" || node.type === "IfStatement" || node.type === "ImportDeclaration" || node.type === "InterfaceDeclaration" || node.type === "LabeledStatement" || node.type === "MethodDefinition" || node.type === "ReturnStatement" || node.type === "SwitchStatement" || node.type === "ThrowStatement" || node.type === "TryStatement" || node.type === "TSAbstractClassDeclaration" || node.type === "TSEnumDeclaration" || node.type === "TSImportEqualsDeclaration" || node.type === "TSInterfaceDeclaration" || node.type === "TSModuleDeclaration" || node.type === "TSNamespaceExportDeclaration" || node.type === "TypeAlias" || node.type === "VariableDeclaration" || node.type === "WhileStatement" || node.type === "WithStatement";
}

var needsParens_1 = needsParens;

var getParentExportDeclaration$1 = util.getParentExportDeclaration;
var isExportDeclaration$1 = util.isExportDeclaration;
var shouldFlatten$1 = util.shouldFlatten;
var getNextNonSpaceNonCommentCharacter$1 = util.getNextNonSpaceNonCommentCharacter;
var hasNewline$2 = util.hasNewline;
var hasNewlineInRange$1 = util.hasNewlineInRange;
var getLast$4 = util.getLast;
var getStringWidth$2 = util.getStringWidth;
var printString$1 = util.printString;
var printNumber$1 = util.printNumber;
var hasIgnoreComment$1 = util.hasIgnoreComment;
var skipWhitespace$1 = util.skipWhitespace;
var hasNodeIgnoreComment$1 = util.hasNodeIgnoreComment;
var getPenultimate$1 = util.getPenultimate;
var startsWithNoLookaheadToken$1 = util.startsWithNoLookaheadToken;
var getIndentSize$1 = util.getIndentSize;
var matchAncestorTypes$1 = util.matchAncestorTypes;
var isWithinParentArrayProperty$1 = util.isWithinParentArrayProperty;
var isNextLineEmpty$2 = utilShared.isNextLineEmpty;
var isNextLineEmptyAfterIndex$1 = utilShared.isNextLineEmptyAfterIndex;
var getNextNonSpaceNonCommentCharacterIndex$2 = utilShared.getNextNonSpaceNonCommentCharacterIndex;
var isIdentifierName = utils.keyword.isIdentifierNameES6;
var insertPragma = pragma.insertPragma;
var _require$$4$builders = doc.builders;
var concat$4 = _require$$4$builders.concat;
var join$2 = _require$$4$builders.join;
var line$3 = _require$$4$builders.line;
var hardline$3 = _require$$4$builders.hardline;
var softline$1 = _require$$4$builders.softline;
var literalline$1 = _require$$4$builders.literalline;
var group$1 = _require$$4$builders.group;
var indent$2 = _require$$4$builders.indent;
var align$1 = _require$$4$builders.align;
var conditionalGroup$1 = _require$$4$builders.conditionalGroup;
var fill$2 = _require$$4$builders.fill;
var ifBreak$1 = _require$$4$builders.ifBreak;
var breakParent$2 = _require$$4$builders.breakParent;
var lineSuffixBoundary$1 = _require$$4$builders.lineSuffixBoundary;
var addAlignmentToDoc$2 = _require$$4$builders.addAlignmentToDoc;
var dedent$2 = _require$$4$builders.dedent;
var _require$$4$utils = doc.utils;
var willBreak$1 = _require$$4$utils.willBreak;
var isLineNext$1 = _require$$4$utils.isLineNext;
var isEmpty$1 = _require$$4$utils.isEmpty;
var removeLines$1 = _require$$4$utils.removeLines;
var printDocToString$1 = doc.printer.printDocToString;

function shouldPrintComma(options, level) {
  level = level || "es5";

  switch (options.trailingComma) {
    case "all":
      if (level === "all") {
        return true;
      }

    // fallthrough

    case "es5":
      if (level === "es5") {
        return true;
      }

    // fallthrough

    case "none":
    default:
      return false;
  }
}

function genericPrint$1(path, options, printPath, args) {
  var node = path.getValue();
  var needsParens = false;
  var linesWithoutParens = printPathNoParens(path, options, printPath, args);

  if (!node || isEmpty$1(linesWithoutParens)) {
    return linesWithoutParens;
  }

  var decorators = [];

  if (node.decorators && node.decorators.length > 0 && // If the parent node is an export declaration, it will be
  // responsible for printing node.decorators.
  !getParentExportDeclaration$1(path)) {
    var separator = node.decorators.length === 1 && isWithinParentArrayProperty$1(path, "params") ? line$3 : hardline$3;
    path.each(function (decoratorPath) {
      var decorator = decoratorPath.getValue();

      if (decorator.expression) {
        decorator = decorator.expression;
      } else {
        decorator = decorator.callee;
      }

      decorators.push(printPath(decoratorPath), separator);
    }, "decorators");
  } else if (isExportDeclaration$1(node) && node.declaration && node.declaration.decorators) {
    // Export declarations are responsible for printing any decorators
    // that logically apply to node.declaration.
    path.each(function (decoratorPath) {
      var decorator = decoratorPath.getValue();
      var prefix = decorator.type === "Decorator" ? "" : "@";
      decorators.push(prefix, printPath(decoratorPath), hardline$3);
    }, "declaration", "decorators");
  } else {
    // Nodes with decorators can't have parentheses, so we can avoid
    // computing pathNeedsParens() except in this case.
    needsParens = needsParens_1(path, options);
  }

  var parts = [];

  if (needsParens) {
    parts.unshift("(");
  }

  parts.push(linesWithoutParens);

  if (needsParens) {
    parts.push(")");
  }

  if (decorators.length > 0) {
    return group$1(concat$4(decorators.concat(parts)));
  }

  return concat$4(parts);
}

function hasPrettierIgnore(path) {
  return hasIgnoreComment$1(path) || hasJsxIgnoreComment(path);
}

function hasJsxIgnoreComment(path) {
  var node = path.getValue();
  var parent = path.getParentNode();

  if (!parent || !node || !isJSXNode(node) || !isJSXNode(parent)) {
    return false;
  } // Lookup the previous sibling, ignoring any empty JSXText elements


  var index = parent.children.indexOf(node);
  var prevSibling = null;

  for (var i = index; i > 0; i--) {
    var candidate = parent.children[i - 1];

    if (candidate.type === "JSXText" && !isMeaningfulJSXText(candidate)) {
      continue;
    }

    prevSibling = candidate;
    break;
  }

  return prevSibling && prevSibling.type === "JSXExpressionContainer" && prevSibling.expression.type === "JSXEmptyExpression" && prevSibling.expression.comments && prevSibling.expression.comments.find(function (comment) {
    return comment.value.trim() === "prettier-ignore";
  });
} // The following is the shared logic for
// ternary operators, namely ConditionalExpression
// and TSConditionalType


function formatTernaryOperator(path, options, print, operatorOptions) {
  var n = path.getValue();
  var parts = [];
  var operatorOpts = Object.assign({
    beforeParts: function beforeParts() {
      return [""];
    },
    afterParts: function afterParts() {
      return [""];
    },
    shouldCheckJsx: true,
    operatorName: "ConditionalExpression",
    consequentNode: "consequent",
    alternateNode: "alternate",
    testNode: "test",
    breakNested: true
  }, operatorOptions || {}); // We print a ConditionalExpression in either "JSX mode" or "normal mode".
  // See tests/jsx/conditional-expression.js for more info.

  var jsxMode = false;
  var parent = path.getParentNode();
  var forceNoIndent = parent.type === operatorOpts.operatorName; // Find the outermost non-ConditionalExpression parent, and the outermost
  // ConditionalExpression parent. We'll use these to determine if we should
  // print in JSX mode.

  var currentParent;
  var previousParent;
  var i = 0;

  do {
    previousParent = currentParent || n;
    currentParent = path.getParentNode(i);
    i++;
  } while (currentParent && currentParent.type === operatorOpts.operatorName);

  var firstNonConditionalParent = currentParent || parent;
  var lastConditionalParent = previousParent;

  if (operatorOpts.shouldCheckJsx && isJSXNode(n[operatorOpts.testNode]) || isJSXNode(n[operatorOpts.consequentNode]) || isJSXNode(n[operatorOpts.alternateNode]) || conditionalExpressionChainContainsJSX(lastConditionalParent)) {
    jsxMode = true;
    forceNoIndent = true; // Even though they don't need parens, we wrap (almost) everything in
    // parens when using ?: within JSX, because the parens are analogous to
    // curly braces in an if statement.

    var wrap = function wrap(doc$$2) {
      return concat$4([ifBreak$1("(", ""), indent$2(concat$4([softline$1, doc$$2])), softline$1, ifBreak$1(")", "")]);
    }; // The only things we don't wrap are:
    // * Nested conditional expressions in alternates
    // * null


    var isNull = function isNull(node) {
      return node.type === "NullLiteral" || node.type === "Literal" && node.value === null;
    };

    parts.push(" ? ", isNull(n[operatorOpts.consequentNode]) ? path.call(print, operatorOpts.consequentNode) : wrap(path.call(print, operatorOpts.consequentNode)), " : ", n[operatorOpts.alternateNode].type === operatorOpts.operatorName || isNull(n[operatorOpts.alternateNode]) ? path.call(print, operatorOpts.alternateNode) : wrap(path.call(print, operatorOpts.alternateNode)));
  } else {
    // normal mode
    var part = concat$4([line$3, "? ", n[operatorOpts.consequentNode].type === operatorOpts.operatorName ? ifBreak$1("", "(") : "", align$1(2, path.call(print, operatorOpts.consequentNode)), n[operatorOpts.consequentNode].type === operatorOpts.operatorName ? ifBreak$1("", ")") : "", line$3, ": ", align$1(2, path.call(print, operatorOpts.alternateNode))]);
    parts.push(parent.type === operatorOpts.operatorName ? options.useTabs ? dedent$2(indent$2(part)) : align$1(Math.max(0, options.tabWidth - 2), part) : part);
  } // We want a whole chain of ConditionalExpressions to all
  // break if any of them break. That means we should only group around the
  // outer-most ConditionalExpression.


  var maybeGroup = function maybeGroup(doc$$2) {
    return operatorOpts.breakNested ? parent === firstNonConditionalParent ? group$1(doc$$2) : doc$$2 : group$1(doc$$2);
  }; // Always group in normal mode.
  // Break the closing paren to keep the chain right after it:
  // (a
  //   ? b
  //   : c
  // ).call()


  var breakClosingParen = !jsxMode && (parent.type === "MemberExpression" || parent.type === "OptionalMemberExpression") && !parent.computed;
  return maybeGroup(concat$4([].concat(operatorOpts.beforeParts(), forceNoIndent ? concat$4(parts) : indent$2(concat$4(parts)), operatorOpts.afterParts(breakClosingParen))));
}

function getTypeScriptMappedTypeModifier(tokenNode, keyword) {
  if (tokenNode.type === "TSPlusToken") {
    return "+" + keyword;
  } else if (tokenNode.type === "TSMinusToken") {
    return "-" + keyword;
  }

  return keyword;
}

function printPathNoParens(path, options, print, args) {
  var n = path.getValue();
  var semi = options.semi ? ";" : "";

  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  var parts = [];

  switch (n.type) {
    case "File":
      // Print @babel/parser's InterpreterDirective here so that
      // leading comments on the `Program` node get printed after the hashbang.
      if (n.program && n.program.interpreter) {
        parts.push(path.call(function (programPath) {
          return programPath.call(print, "interpreter");
        }, "program"));
      }

      parts.push(path.call(print, "program"));
      return concat$4(parts);

    case "Program":
      // Babel 6
      if (n.directives) {
        path.each(function (childPath) {
          parts.push(print(childPath), semi, hardline$3);

          if (isNextLineEmpty$2(options.originalText, childPath.getValue(), options)) {
            parts.push(hardline$3);
          }
        }, "directives");
      }

      parts.push(path.call(function (bodyPath) {
        return printStatementSequence(bodyPath, options, print);
      }, "body"));
      parts.push(comments.printDanglingComments(path, options,
      /* sameIndent */
      true)); // Only force a trailing newline if there were any contents.

      if (n.body.length || n.comments) {
        parts.push(hardline$3);
      }

      return concat$4(parts);
    // Babel extension.

    case "EmptyStatement":
      return "";

    case "ExpressionStatement":
      // Detect Flow-parsed directives
      if (n.directive) {
        return concat$4([nodeStr(n.expression, options, true), semi]);
      } // Do not append semicolon after the only JSX element in a program


      return concat$4([path.call(print, "expression"), isTheOnlyJSXElementInMarkdown(options, path) ? "" : semi]);
    // Babel extension.

    case "ParenthesizedExpression":
      return concat$4(["(", path.call(print, "expression"), ")"]);

    case "AssignmentExpression":
      return printAssignment(n.left, path.call(print, "left"), concat$4([" ", n.operator]), n.right, path.call(print, "right"), options);

    case "BinaryExpression":
    case "LogicalExpression":
      {
        var parent = path.getParentNode();
        var parentParent = path.getParentNode(1);
        var isInsideParenthesis = n !== parent.body && (parent.type === "IfStatement" || parent.type === "WhileStatement" || parent.type === "DoWhileStatement");

        var _parts = printBinaryishExpressions(path, print, options,
        /* isNested */
        false, isInsideParenthesis); //   if (
        //     this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft
        //   ) {
        //
        // looks super weird, we want to break the children if the parent breaks
        //
        //   if (
        //     this.hasPlugin("dynamicImports") &&
        //     this.lookahead().type === tt.parenLeft
        //   ) {


        if (isInsideParenthesis) {
          return concat$4(_parts);
        } // Break between the parens in unaries or in a member expression, i.e.
        //
        //   (
        //     a &&
        //     b &&
        //     c
        //   ).call()


        if (parent.type === "UnaryExpression" || (parent.type === "MemberExpression" || parent.type === "OptionalMemberExpression") && !parent.computed) {
          return group$1(concat$4([indent$2(concat$4([softline$1, concat$4(_parts)])), softline$1]));
        } // Avoid indenting sub-expressions in some cases where the first sub-expression is already
        // indented accordingly. We should indent sub-expressions where the first case isn't indented.


        var shouldNotIndent = parent.type === "ReturnStatement" || parent.type === "JSXExpressionContainer" && parentParent.type === "JSXAttribute" || n === parent.body && parent.type === "ArrowFunctionExpression" || n !== parent.body && parent.type === "ForStatement" || parent.type === "ConditionalExpression" && parentParent.type !== "ReturnStatement";
        var shouldIndentIfInlining = parent.type === "AssignmentExpression" || parent.type === "VariableDeclarator" || parent.type === "ClassProperty" || parent.type === "TSAbstractClassProperty" || parent.type === "ClassPrivateProperty" || parent.type === "ObjectProperty" || parent.type === "Property";
        var samePrecedenceSubExpression = isBinaryish(n.left) && shouldFlatten$1(n.operator, n.left.operator);

        if (shouldNotIndent || shouldInlineLogicalExpression(n) && !samePrecedenceSubExpression || !shouldInlineLogicalExpression(n) && shouldIndentIfInlining) {
          return group$1(concat$4(_parts));
        }

        var rest = concat$4(_parts.slice(1));
        return group$1(concat$4([// Don't include the initial expression in the indentation
        // level. The first item is guaranteed to be the first
        // left-most expression.
        _parts.length > 0 ? _parts[0] : "", indent$2(rest)]));
      }

    case "AssignmentPattern":
      return concat$4([path.call(print, "left"), " = ", path.call(print, "right")]);

    case "TSTypeAssertionExpression":
      {
        var shouldBreakAfterCast = !(n.expression.type === "ArrayExpression" || n.expression.type === "ObjectExpression");
        var castGroup = group$1(concat$4(["<", indent$2(concat$4([softline$1, path.call(print, "typeAnnotation")])), softline$1, ">"]));
        var exprContents = concat$4([ifBreak$1("("), indent$2(concat$4([softline$1, path.call(print, "expression")])), softline$1, ifBreak$1(")")]);

        if (shouldBreakAfterCast) {
          return conditionalGroup$1([concat$4([castGroup, path.call(print, "expression")]), concat$4([castGroup, group$1(exprContents, {
            shouldBreak: true
          })]), concat$4([castGroup, path.call(print, "expression")])]);
        }

        return group$1(concat$4([castGroup, path.call(print, "expression")]));
      }

    case "OptionalMemberExpression":
    case "MemberExpression":
      {
        var _parent = path.getParentNode();

        var firstNonMemberParent;
        var i = 0;

        do {
          firstNonMemberParent = path.getParentNode(i);
          i++;
        } while (firstNonMemberParent && (firstNonMemberParent.type === "MemberExpression" || firstNonMemberParent.type === "OptionalMemberExpression" || firstNonMemberParent.type === "TSNonNullExpression"));

        var shouldInline = firstNonMemberParent && (firstNonMemberParent.type === "NewExpression" || firstNonMemberParent.type === "BindExpression" || firstNonMemberParent.type === "VariableDeclarator" && firstNonMemberParent.id.type !== "Identifier" || firstNonMemberParent.type === "AssignmentExpression" && firstNonMemberParent.left.type !== "Identifier") || n.computed || n.object.type === "Identifier" && n.property.type === "Identifier" && _parent.type !== "MemberExpression" && _parent.type !== "OptionalMemberExpression";
        return concat$4([path.call(print, "object"), shouldInline ? printMemberLookup(path, options, print) : group$1(indent$2(concat$4([softline$1, printMemberLookup(path, options, print)])))]);
      }

    case "MetaProperty":
      return concat$4([path.call(print, "meta"), ".", path.call(print, "property")]);

    case "BindExpression":
      if (n.object) {
        parts.push(path.call(print, "object"));
      }

      parts.push(group$1(indent$2(concat$4([softline$1, printBindExpressionCallee(path, options, print)]))));
      return concat$4(parts);

    case "Identifier":
      {
        return concat$4([n.name, printOptionalToken(path), printTypeAnnotation(path, options, print)]);
      }

    case "SpreadElement":
    case "SpreadElementPattern":
    case "RestProperty":
    case "SpreadProperty":
    case "SpreadPropertyPattern":
    case "RestElement":
    case "ObjectTypeSpreadProperty":
      return concat$4(["...", path.call(print, "argument"), printTypeAnnotation(path, options, print)]);

    case "FunctionDeclaration":
    case "FunctionExpression":
      if (isNodeStartingWithDeclare(n, options)) {
        parts.push("declare ");
      }

      parts.push(printFunctionDeclaration(path, print, options));

      if (!n.body) {
        parts.push(semi);
      }

      return concat$4(parts);

    case "ArrowFunctionExpression":
      {
        if (n.async) {
          parts.push("async ");
        }

        if (shouldPrintParamsWithoutParens(path, options)) {
          parts.push(path.call(print, "params", 0));
        } else {
          parts.push(group$1(concat$4([printFunctionParams(path, print, options,
          /* expandLast */
          args && (args.expandLastArg || args.expandFirstArg),
          /* printTypeParams */
          true), printReturnType(path, print, options)])));
        }

        var dangling = comments.printDanglingComments(path, options,
        /* sameIndent */
        true, function (comment) {
          var nextCharacter = getNextNonSpaceNonCommentCharacterIndex$2(options.originalText, comment, options);
          return options.originalText.substr(nextCharacter, 2) === "=>";
        });

        if (dangling) {
          parts.push(" ", dangling);
        }

        parts.push(" =>");
        var body = path.call(function (bodyPath) {
          return print(bodyPath, args);
        }, "body"); // We want to always keep these types of nodes on the same line
        // as the arrow.

        if (!hasLeadingOwnLineComment(options.originalText, n.body, options) && (n.body.type === "ArrayExpression" || n.body.type === "ObjectExpression" || n.body.type === "BlockStatement" || isJSXNode(n.body) || isTemplateOnItsOwnLine(n.body, options.originalText, options) || n.body.type === "ArrowFunctionExpression" || n.body.type === "DoExpression")) {
          return group$1(concat$4([concat$4(parts), " ", body]));
        } // We handle sequence expressions as the body of arrows specially,
        // so that the required parentheses end up on their own lines.


        if (n.body.type === "SequenceExpression") {
          return group$1(concat$4([concat$4(parts), group$1(concat$4([" (", indent$2(concat$4([softline$1, body])), softline$1, ")"]))]));
        } // if the arrow function is expanded as last argument, we are adding a
        // level of indentation and need to add a softline to align the closing )
        // with the opening (, or if it's inside a JSXExpression (e.g. an attribute)
        // we should align the expression's closing } with the line with the opening {.


        var shouldAddSoftLine = (args && args.expandLastArg || path.getParentNode().type === "JSXExpressionContainer") && !(n.comments && n.comments.length);
        var printTrailingComma = args && args.expandLastArg && shouldPrintComma(options, "all"); // In order to avoid confusion between
        // a => a ? a : a
        // a <= a ? a : a

        var shouldAddParens = n.body.type === "ConditionalExpression" && !startsWithNoLookaheadToken$1(n.body,
        /* forbidFunctionAndClass */
        false);
        return group$1(concat$4([concat$4(parts), group$1(concat$4([indent$2(concat$4([line$3, shouldAddParens ? ifBreak$1("", "(") : "", body, shouldAddParens ? ifBreak$1("", ")") : ""])), shouldAddSoftLine ? concat$4([ifBreak$1(printTrailingComma ? "," : ""), softline$1]) : ""]))]));
      }

    case "MethodDefinition":
    case "TSAbstractMethodDefinition":
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }

      if (n.static) {
        parts.push("static ");
      }

      if (n.type === "TSAbstractMethodDefinition") {
        parts.push("abstract ");
      }

      parts.push(printMethod(path, options, print));
      return concat$4(parts);

    case "YieldExpression":
      parts.push("yield");

      if (n.delegate) {
        parts.push("*");
      }

      if (n.argument) {
        parts.push(" ", path.call(print, "argument"));
      }

      return concat$4(parts);

    case "AwaitExpression":
      return concat$4(["await ", path.call(print, "argument")]);

    case "ImportSpecifier":
      if (n.importKind) {
        parts.push(path.call(print, "importKind"), " ");
      }

      parts.push(path.call(print, "imported"));

      if (n.local && n.local.name !== n.imported.name) {
        parts.push(" as ", path.call(print, "local"));
      }

      return concat$4(parts);

    case "ExportSpecifier":
      parts.push(path.call(print, "local"));

      if (n.exported && n.exported.name !== n.local.name) {
        parts.push(" as ", path.call(print, "exported"));
      }

      return concat$4(parts);

    case "ImportNamespaceSpecifier":
      parts.push("* as ");

      if (n.local) {
        parts.push(path.call(print, "local"));
      } else if (n.id) {
        parts.push(path.call(print, "id"));
      }

      return concat$4(parts);

    case "ImportDefaultSpecifier":
      if (n.local) {
        return path.call(print, "local");
      }

      return path.call(print, "id");

    case "TSExportAssignment":
      return concat$4(["export = ", path.call(print, "expression"), semi]);

    case "ExportDefaultDeclaration":
    case "ExportNamedDeclaration":
      return printExportDeclaration(path, options, print);

    case "ExportAllDeclaration":
      parts.push("export ");

      if (n.exportKind === "type") {
        parts.push("type ");
      }

      parts.push("* from ", path.call(print, "source"), semi);
      return concat$4(parts);

    case "ExportNamespaceSpecifier":
    case "ExportDefaultSpecifier":
      return path.call(print, "exported");

    case "ImportDeclaration":
      {
        parts.push("import ");

        if (n.importKind && n.importKind !== "value") {
          parts.push(n.importKind + " ");
        }

        var standalones = [];
        var grouped = [];

        if (n.specifiers && n.specifiers.length > 0) {
          path.each(function (specifierPath) {
            var value = specifierPath.getValue();

            if (value.type === "ImportDefaultSpecifier" || value.type === "ImportNamespaceSpecifier") {
              standalones.push(print(specifierPath));
            } else {
              grouped.push(print(specifierPath));
            }
          }, "specifiers");

          if (standalones.length > 0) {
            parts.push(join$2(", ", standalones));
          }

          if (standalones.length > 0 && grouped.length > 0) {
            parts.push(", ");
          }

          if (grouped.length === 1 && standalones.length === 0 && n.specifiers && !n.specifiers.some(function (node) {
            return node.comments;
          })) {
            parts.push(concat$4(["{", options.bracketSpacing ? " " : "", concat$4(grouped), options.bracketSpacing ? " " : "", "}"]));
          } else if (grouped.length >= 1) {
            parts.push(group$1(concat$4(["{", indent$2(concat$4([options.bracketSpacing ? line$3 : softline$1, join$2(concat$4([",", line$3]), grouped)])), ifBreak$1(shouldPrintComma(options) ? "," : ""), options.bracketSpacing ? line$3 : softline$1, "}"])));
          }

          parts.push(" from ");
        } else if (n.importKind && n.importKind === "type" || // import {} from 'x'
        /{\s*}/.test(options.originalText.slice(options.locStart(n), options.locStart(n.source)))) {
          parts.push("{} from ");
        }

        parts.push(path.call(print, "source"), semi);
        return concat$4(parts);
      }

    case "Import":
      return "import";

    case "BlockStatement":
      {
        var naked = path.call(function (bodyPath) {
          return printStatementSequence(bodyPath, options, print);
        }, "body");
        var hasContent = n.body.find(function (node) {
          return node.type !== "EmptyStatement";
        });
        var hasDirectives = n.directives && n.directives.length > 0;

        var _parent2 = path.getParentNode();

        var _parentParent = path.getParentNode(1);

        if (!hasContent && !hasDirectives && !hasDanglingComments(n) && (_parent2.type === "ArrowFunctionExpression" || _parent2.type === "FunctionExpression" || _parent2.type === "FunctionDeclaration" || _parent2.type === "ObjectMethod" || _parent2.type === "ClassMethod" || _parent2.type === "ForStatement" || _parent2.type === "WhileStatement" || _parent2.type === "DoWhileStatement" || _parent2.type === "DoExpression" || _parent2.type === "CatchClause" && !_parentParent.finalizer)) {
          return "{}";
        }

        parts.push("{"); // Babel 6

        if (hasDirectives) {
          path.each(function (childPath) {
            parts.push(indent$2(concat$4([hardline$3, print(childPath), semi])));

            if (isNextLineEmpty$2(options.originalText, childPath.getValue(), options)) {
              parts.push(hardline$3);
            }
          }, "directives");
        }

        if (hasContent) {
          parts.push(indent$2(concat$4([hardline$3, naked])));
        }

        parts.push(comments.printDanglingComments(path, options));
        parts.push(hardline$3, "}");
        return concat$4(parts);
      }

    case "ReturnStatement":
      parts.push("return");

      if (n.argument) {
        if (returnArgumentHasLeadingComment(options, n.argument)) {
          parts.push(concat$4([" (", indent$2(concat$4([hardline$3, path.call(print, "argument")])), hardline$3, ")"]));
        } else if (n.argument.type === "LogicalExpression" || n.argument.type === "BinaryExpression" || n.argument.type === "SequenceExpression") {
          parts.push(group$1(concat$4([ifBreak$1(" (", " "), indent$2(concat$4([softline$1, path.call(print, "argument")])), softline$1, ifBreak$1(")")])));
        } else {
          parts.push(" ", path.call(print, "argument"));
        }
      }

      if (hasDanglingComments(n)) {
        parts.push(" ", comments.printDanglingComments(path, options,
        /* sameIndent */
        true));
      }

      parts.push(semi);
      return concat$4(parts);

    case "NewExpression":
    case "OptionalCallExpression":
    case "CallExpression":
      {
        var isNew = n.type === "NewExpression";
        var optional = printOptionalToken(path);

        if ( // We want to keep CommonJS- and AMD-style require calls, and AMD-style
        // define calls, as a unit.
        // e.g. `define(["some/lib", (lib) => {`
        !isNew && n.callee.type === "Identifier" && (n.callee.name === "require" || n.callee.name === "define") || n.callee.type === "Import" || // Template literals as single arguments
        n.arguments.length === 1 && isTemplateOnItsOwnLine(n.arguments[0], options.originalText, options) || // Keep test declarations on a single line
        // e.g. `it('long name', () => {`
        !isNew && isTestCall(n, path.getParentNode())) {
          return concat$4([isNew ? "new " : "", path.call(print, "callee"), optional, printFunctionTypeParameters(path, options, print), concat$4(["(", join$2(", ", path.map(print, "arguments")), ")"])]);
        } // We detect calls on member lookups and possibly print them in a
        // special chain format. See `printMemberChain` for more info.


        if (!isNew && isMemberish(n.callee)) {
          return printMemberChain(path, options, print);
        }

        return concat$4([isNew ? "new " : "", path.call(print, "callee"), optional, printFunctionTypeParameters(path, options, print), printArgumentsList(path, options, print)]);
      }

    case "TSInterfaceDeclaration":
      if (isNodeStartingWithDeclare(n, options)) {
        parts.push("declare ");
      }

      parts.push(n.abstract ? "abstract " : "", printTypeScriptModifiers(path, options, print), "interface ", path.call(print, "id"), n.typeParameters ? path.call(print, "typeParameters") : "", " ");

      if (n.heritage.length) {
        parts.push(group$1(indent$2(concat$4([softline$1, "extends ", indent$2(join$2(concat$4([",", line$3]), path.map(print, "heritage"))), " "]))));
      }

      parts.push(path.call(print, "body"));
      return concat$4(parts);

    case "ObjectTypeInternalSlot":
      return concat$4([n.static ? "static " : "", "[[", path.call(print, "id"), "]]", printOptionalToken(path), n.method ? "" : ": ", path.call(print, "value")]);

    case "ObjectExpression":
    case "ObjectPattern":
    case "ObjectTypeAnnotation":
    case "TSInterfaceBody":
    case "TSTypeLiteral":
      {
        var isTypeAnnotation = n.type === "ObjectTypeAnnotation";

        var _parent3 = path.getParentNode(0);

        var shouldBreak = n.type === "TSInterfaceBody" || n.type === "ObjectPattern" && _parent3.type !== "FunctionDeclaration" && _parent3.type !== "FunctionExpression" && _parent3.type !== "ArrowFunctionExpression" && _parent3.type !== "AssignmentPattern" && _parent3.type !== "CatchClause" && n.properties.some(function (property) {
          return property.value && (property.value.type === "ObjectPattern" || property.value.type === "ArrayPattern");
        }) || n.type !== "ObjectPattern" && hasNewlineInRange$1(options.originalText, options.locStart(n), options.locEnd(n));
        var isFlowInterfaceLikeBody = isTypeAnnotation && _parent3 && (_parent3.type === "InterfaceDeclaration" || _parent3.type === "DeclareInterface" || _parent3.type === "DeclareClass") && path.getName() === "body";
        var separator = isFlowInterfaceLikeBody ? ";" : n.type === "TSInterfaceBody" || n.type === "TSTypeLiteral" ? ifBreak$1(semi, ";") : ",";
        var fields = [];
        var leftBrace = n.exact ? "{|" : "{";
        var rightBrace = n.exact ? "|}" : "}";
        var propertiesField;

        if (n.type === "TSTypeLiteral") {
          propertiesField = "members";
        } else if (n.type === "TSInterfaceBody") {
          propertiesField = "body";
        } else {
          propertiesField = "properties";
        }

        if (isTypeAnnotation) {
          fields.push("indexers", "callProperties", "internalSlots");
        }

        fields.push(propertiesField); // Unfortunately, things are grouped together in the ast can be
        // interleaved in the source code. So we need to reorder them before
        // printing them.

        var propsAndLoc = [];
        fields.forEach(function (field) {
          path.each(function (childPath) {
            var node = childPath.getValue();
            propsAndLoc.push({
              node: node,
              printed: print(childPath),
              loc: options.locStart(node)
            });
          }, field);
        });
        var separatorParts = [];
        var props = propsAndLoc.sort(function (a, b) {
          return a.loc - b.loc;
        }).map(function (prop) {
          var result = concat$4(separatorParts.concat(group$1(prop.printed)));
          separatorParts = [separator, line$3];

          if (prop.node.type === "TSPropertySignature" && hasNodeIgnoreComment$1(prop.node)) {
            separatorParts.shift();
          }

          if (isNextLineEmpty$2(options.originalText, prop.node, options)) {
            separatorParts.push(hardline$3);
          }

          return result;
        });
        var lastElem = getLast$4(n[propertiesField]);
        var canHaveTrailingSeparator = !(lastElem && (lastElem.type === "RestProperty" || lastElem.type === "RestElement" || hasNodeIgnoreComment$1(lastElem)));
        var content;

        if (props.length === 0 && !n.typeAnnotation) {
          if (!hasDanglingComments(n)) {
            return concat$4([leftBrace, rightBrace]);
          }

          content = group$1(concat$4([leftBrace, comments.printDanglingComments(path, options), softline$1, rightBrace, printOptionalToken(path)]));
        } else {
          content = concat$4([leftBrace, indent$2(concat$4([options.bracketSpacing ? line$3 : softline$1, concat$4(props)])), ifBreak$1(canHaveTrailingSeparator && (separator !== "," || shouldPrintComma(options)) ? separator : ""), concat$4([options.bracketSpacing ? line$3 : softline$1, rightBrace]), printOptionalToken(path), printTypeAnnotation(path, options, print)]);
        } // If we inline the object as first argument of the parent, we don't want
        // to create another group so that the object breaks before the return
        // type


        var parentParentParent = path.getParentNode(2);

        if (n.type === "ObjectPattern" && _parent3 && shouldHugArguments(_parent3) && _parent3.params[0] === n || shouldHugType(n) && parentParentParent && shouldHugArguments(parentParentParent) && parentParentParent.params[0].typeAnnotation && parentParentParent.params[0].typeAnnotation.typeAnnotation === n) {
          return content;
        }

        return group$1(content, {
          shouldBreak: shouldBreak
        });
      }
    // Babel 6

    case "ObjectProperty": // Non-standard AST node type.

    case "Property":
      if (n.method || n.kind === "get" || n.kind === "set") {
        return printMethod(path, options, print);
      }

      if (n.shorthand) {
        parts.push(path.call(print, "value"));
      } else {
        var printedLeft;

        if (n.computed) {
          printedLeft = concat$4(["[", path.call(print, "key"), "]"]);
        } else {
          printedLeft = printPropertyKey(path, options, print);
        }

        parts.push(printAssignment(n.key, printedLeft, ":", n.value, path.call(print, "value"), options));
      }

      return concat$4(parts);
    // Babel 6

    case "ClassMethod":
      if (n.static) {
        parts.push("static ");
      }

      parts = parts.concat(printObjectMethod(path, options, print));
      return concat$4(parts);
    // Babel 6

    case "ObjectMethod":
      return printObjectMethod(path, options, print);

    case "Decorator":
      return concat$4(["@", path.call(print, "expression"), path.call(print, "callee")]);

    case "ArrayExpression":
    case "ArrayPattern":
      if (n.elements.length === 0) {
        if (!hasDanglingComments(n)) {
          parts.push("[]");
        } else {
          parts.push(group$1(concat$4(["[", comments.printDanglingComments(path, options), softline$1, "]"])));
        }
      } else {
        var _lastElem = getLast$4(n.elements);

        var canHaveTrailingComma = !(_lastElem && _lastElem.type === "RestElement"); // JavaScript allows you to have empty elements in an array which
        // changes its length based on the number of commas. The algorithm
        // is that if the last argument is null, we need to force insert
        // a comma to ensure JavaScript recognizes it.
        //   [,].length === 1
        //   [1,].length === 1
        //   [1,,].length === 2
        //
        // Note that getLast returns null if the array is empty, but
        // we already check for an empty array just above so we are safe

        var needsForcedTrailingComma = canHaveTrailingComma && _lastElem === null;
        parts.push(group$1(concat$4(["[", indent$2(concat$4([softline$1, printArrayItems(path, options, "elements", print)])), needsForcedTrailingComma ? "," : "", ifBreak$1(canHaveTrailingComma && !needsForcedTrailingComma && shouldPrintComma(options) ? "," : ""), comments.printDanglingComments(path, options,
        /* sameIndent */
        true), softline$1, "]"])));
      }

      parts.push(printOptionalToken(path), printTypeAnnotation(path, options, print));
      return concat$4(parts);

    case "SequenceExpression":
      {
        var _parent4 = path.getParentNode(0);

        if (_parent4.type === "ExpressionStatement" || _parent4.type === "ForStatement") {
          // For ExpressionStatements and for-loop heads, which are among
          // the few places a SequenceExpression appears unparenthesized, we want
          // to indent expressions after the first.
          var _parts2 = [];
          path.each(function (p) {
            if (p.getName() === 0) {
              _parts2.push(print(p));
            } else {
              _parts2.push(",", indent$2(concat$4([line$3, print(p)])));
            }
          }, "expressions");
          return group$1(concat$4(_parts2));
        }

        return group$1(concat$4([join$2(concat$4([",", line$3]), path.map(print, "expressions"))]));
      }

    case "ThisExpression":
      return "this";

    case "Super":
      return "super";

    case "NullLiteral":
      // Babel 6 Literal split
      return "null";

    case "RegExpLiteral":
      // Babel 6 Literal split
      return printRegex(n);

    case "NumericLiteral":
      // Babel 6 Literal split
      return printNumber$1(n.extra.raw);

    case "BigIntLiteral":
      return concat$4([printNumber$1(n.extra.rawValue), "n"]);

    case "BooleanLiteral": // Babel 6 Literal split

    case "StringLiteral": // Babel 6 Literal split

    case "Literal":
      {
        if (n.regex) {
          return printRegex(n.regex);
        }

        if (typeof n.value === "number") {
          return printNumber$1(n.raw);
        }

        if (typeof n.value !== "string") {
          return "" + n.value;
        } // TypeScript workaround for eslint/typescript-eslint-parser#267
        // See corresponding workaround in needs-parens.js


        var grandParent = path.getParentNode(1);
        var isTypeScriptDirective = options.parser === "typescript" && typeof n.value === "string" && grandParent && (grandParent.type === "Program" || grandParent.type === "BlockStatement");
        return nodeStr(n, options, isTypeScriptDirective);
      }

    case "Directive":
      return path.call(print, "value");
    // Babel 6

    case "DirectiveLiteral":
      return nodeStr(n, options);

    case "UnaryExpression":
      parts.push(n.operator);

      if (/[a-z]$/.test(n.operator)) {
        parts.push(" ");
      }

      parts.push(path.call(print, "argument"));
      return concat$4(parts);

    case "UpdateExpression":
      parts.push(path.call(print, "argument"), n.operator);

      if (n.prefix) {
        parts.reverse();
      }

      return concat$4(parts);

    case "ConditionalExpression":
      return formatTernaryOperator(path, options, print, {
        beforeParts: function beforeParts() {
          return [path.call(print, "test")];
        },
        afterParts: function afterParts(breakClosingParen) {
          return [breakClosingParen ? softline$1 : ""];
        }
      });

    case "VariableDeclaration":
      {
        var printed = path.map(function (childPath) {
          return print(childPath);
        }, "declarations"); // We generally want to terminate all variable declarations with a
        // semicolon, except when they in the () part of for loops.

        var parentNode = path.getParentNode();
        var isParentForLoop = parentNode.type === "ForStatement" || parentNode.type === "ForInStatement" || parentNode.type === "ForOfStatement" || parentNode.type === "ForAwaitStatement";
        var hasValue = n.declarations.some(function (decl) {
          return decl.init;
        });
        var firstVariable;

        if (printed.length === 1) {
          firstVariable = printed[0];
        } else if (printed.length > 1) {
          // Indent first var to comply with eslint one-var rule
          firstVariable = indent$2(printed[0]);
        }

        parts = [isNodeStartingWithDeclare(n, options) ? "declare " : "", n.kind, firstVariable ? concat$4([" ", firstVariable]) : "", indent$2(concat$4(printed.slice(1).map(function (p) {
          return concat$4([",", hasValue && !isParentForLoop ? hardline$3 : line$3, p]);
        })))];

        if (!(isParentForLoop && parentNode.body !== n)) {
          parts.push(semi);
        }

        return group$1(concat$4(parts));
      }

    case "VariableDeclarator":
      return printAssignment(n.id, concat$4([path.call(print, "id"), path.call(print, "typeParameters")]), " =", n.init, n.init && path.call(print, "init"), options);

    case "WithStatement":
      return group$1(concat$4(["with (", path.call(print, "object"), ")", adjustClause(n.body, path.call(print, "body"))]));

    case "IfStatement":
      {
        var con = adjustClause(n.consequent, path.call(print, "consequent"));
        var opening = group$1(concat$4(["if (", group$1(concat$4([indent$2(concat$4([softline$1, path.call(print, "test")])), softline$1])), ")", con]));
        parts.push(opening);

        if (n.alternate) {
          var commentOnOwnLine = hasTrailingComment(n.consequent) && n.consequent.comments.some(function (comment) {
            return comment.trailing && !comments$3.isBlockComment(comment);
          }) || needsHardlineAfterDanglingComment(n);
          var elseOnSameLine = n.consequent.type === "BlockStatement" && !commentOnOwnLine;
          parts.push(elseOnSameLine ? " " : hardline$3);

          if (hasDanglingComments(n)) {
            parts.push(comments.printDanglingComments(path, options, true), commentOnOwnLine ? hardline$3 : " ");
          }

          parts.push("else", group$1(adjustClause(n.alternate, path.call(print, "alternate"), n.alternate.type === "IfStatement")));
        }

        return concat$4(parts);
      }

    case "ForStatement":
      {
        var _body = adjustClause(n.body, path.call(print, "body")); // We want to keep dangling comments above the loop to stay consistent.
        // Any comment positioned between the for statement and the parentheses
        // is going to be printed before the statement.


        var _dangling = comments.printDanglingComments(path, options,
        /* sameLine */
        true);

        var printedComments = _dangling ? concat$4([_dangling, softline$1]) : "";

        if (!n.init && !n.test && !n.update) {
          return concat$4([printedComments, group$1(concat$4(["for (;;)", _body]))]);
        }

        return concat$4([printedComments, group$1(concat$4(["for (", group$1(concat$4([indent$2(concat$4([softline$1, path.call(print, "init"), ";", line$3, path.call(print, "test"), ";", line$3, path.call(print, "update")])), softline$1])), ")", _body]))]);
      }

    case "WhileStatement":
      return group$1(concat$4(["while (", group$1(concat$4([indent$2(concat$4([softline$1, path.call(print, "test")])), softline$1])), ")", adjustClause(n.body, path.call(print, "body"))]));

    case "ForInStatement":
      // Note: esprima can't actually parse "for each (".
      return group$1(concat$4([n.each ? "for each (" : "for (", path.call(print, "left"), " in ", path.call(print, "right"), ")", adjustClause(n.body, path.call(print, "body"))]));

    case "ForOfStatement":
    case "ForAwaitStatement":
      {
        // Babylon 7 removed ForAwaitStatement in favor of ForOfStatement
        // with `"await": true`:
        // https://github.com/estree/estree/pull/138
        var isAwait = n.type === "ForAwaitStatement" || n.await;
        return group$1(concat$4(["for", isAwait ? " await" : "", " (", path.call(print, "left"), " of ", path.call(print, "right"), ")", adjustClause(n.body, path.call(print, "body"))]));
      }

    case "DoWhileStatement":
      {
        var clause = adjustClause(n.body, path.call(print, "body"));
        var doBody = group$1(concat$4(["do", clause]));
        parts = [doBody];

        if (n.body.type === "BlockStatement") {
          parts.push(" ");
        } else {
          parts.push(hardline$3);
        }

        parts.push("while (");
        parts.push(group$1(concat$4([indent$2(concat$4([softline$1, path.call(print, "test")])), softline$1])), ")", semi);
        return concat$4(parts);
      }

    case "DoExpression":
      return concat$4(["do ", path.call(print, "body")]);

    case "BreakStatement":
      parts.push("break");

      if (n.label) {
        parts.push(" ", path.call(print, "label"));
      }

      parts.push(semi);
      return concat$4(parts);

    case "ContinueStatement":
      parts.push("continue");

      if (n.label) {
        parts.push(" ", path.call(print, "label"));
      }

      parts.push(semi);
      return concat$4(parts);

    case "LabeledStatement":
      if (n.body.type === "EmptyStatement") {
        return concat$4([path.call(print, "label"), ":;"]);
      }

      return concat$4([path.call(print, "label"), ": ", path.call(print, "body")]);

    case "TryStatement":
      return concat$4(["try ", path.call(print, "block"), n.handler ? concat$4([" ", path.call(print, "handler")]) : "", n.finalizer ? concat$4([" finally ", path.call(print, "finalizer")]) : ""]);

    case "CatchClause":
      return concat$4(["catch ", n.param ? concat$4(["(", path.call(print, "param"), ") "]) : "", path.call(print, "body")]);

    case "ThrowStatement":
      return concat$4(["throw ", path.call(print, "argument"), semi]);
    // Note: ignoring n.lexical because it has no printing consequences.

    case "SwitchStatement":
      return concat$4([group$1(concat$4(["switch (", indent$2(concat$4([softline$1, path.call(print, "discriminant")])), softline$1, ")"])), " {", n.cases.length > 0 ? indent$2(concat$4([hardline$3, join$2(hardline$3, path.map(function (casePath) {
        var caseNode = casePath.getValue();
        return concat$4([casePath.call(print), n.cases.indexOf(caseNode) !== n.cases.length - 1 && isNextLineEmpty$2(options.originalText, caseNode, options) ? hardline$3 : ""]);
      }, "cases"))])) : "", hardline$3, "}"]);

    case "SwitchCase":
      {
        if (n.test) {
          parts.push("case ", path.call(print, "test"), ":");
        } else {
          parts.push("default:");
        }

        var consequent = n.consequent.filter(function (node) {
          return node.type !== "EmptyStatement";
        });

        if (consequent.length > 0) {
          var cons = path.call(function (consequentPath) {
            return printStatementSequence(consequentPath, options, print);
          }, "consequent");
          parts.push(consequent.length === 1 && consequent[0].type === "BlockStatement" ? concat$4([" ", cons]) : indent$2(concat$4([hardline$3, cons])));
        }

        return concat$4(parts);
      }
    // JSX extensions below.

    case "DebuggerStatement":
      return concat$4(["debugger", semi]);

    case "JSXAttribute":
      parts.push(path.call(print, "name"));

      if (n.value) {
        var res;

        if (isStringLiteral(n.value)) {
          var value = rawText(n.value);
          res = '"' + value.slice(1, -1).replace(/"/g, "&quot;") + '"';
        } else {
          res = path.call(print, "value");
        }

        parts.push("=", res);
      }

      return concat$4(parts);

    case "JSXIdentifier":
      // Can be removed when this is fixed:
      // https://github.com/eslint/typescript-eslint-parser/issues/337
      if (!n.name) {
        return "this";
      }

      return "" + n.name;

    case "JSXNamespacedName":
      return join$2(":", [path.call(print, "namespace"), path.call(print, "name")]);

    case "JSXMemberExpression":
      return join$2(".", [path.call(print, "object"), path.call(print, "property")]);

    case "TSQualifiedName":
      return join$2(".", [path.call(print, "left"), path.call(print, "right")]);

    case "JSXSpreadAttribute":
    case "JSXSpreadChild":
      {
        return concat$4(["{", path.call(function (p) {
          var printed = concat$4(["...", print(p)]);
          var n = p.getValue();

          if (!n.comments || !n.comments.length) {
            return printed;
          }

          return concat$4([indent$2(concat$4([softline$1, comments.printComments(p, function () {
            return printed;
          }, options)])), softline$1]);
        }, n.type === "JSXSpreadAttribute" ? "argument" : "expression"), "}"]);
      }

    case "JSXExpressionContainer":
      {
        var _parent5 = path.getParentNode(0);

        var preventInline = _parent5.type === "JSXAttribute" && n.expression.comments && n.expression.comments.length > 0;

        var _shouldInline = !preventInline && (n.expression.type === "ArrayExpression" || n.expression.type === "ObjectExpression" || n.expression.type === "ArrowFunctionExpression" || n.expression.type === "CallExpression" || n.expression.type === "OptionalCallExpression" || n.expression.type === "FunctionExpression" || n.expression.type === "JSXEmptyExpression" || n.expression.type === "TemplateLiteral" || n.expression.type === "TaggedTemplateExpression" || n.expression.type === "DoExpression" || isJSXNode(_parent5) && (n.expression.type === "ConditionalExpression" || isBinaryish(n.expression)));

        if (_shouldInline) {
          return group$1(concat$4(["{", path.call(print, "expression"), lineSuffixBoundary$1, "}"]));
        }

        return group$1(concat$4(["{", indent$2(concat$4([softline$1, path.call(print, "expression")])), softline$1, lineSuffixBoundary$1, "}"]));
      }

    case "JSXFragment":
    case "TSJsxFragment":
    case "JSXElement":
      {
        var elem = comments.printComments(path, function () {
          return printJSXElement(path, options, print);
        }, options);
        return maybeWrapJSXElementInParens(path, elem);
      }

    case "JSXOpeningElement":
      {
        var _n = path.getValue();

        var nameHasComments = _n.name && _n.name.comments && _n.name.comments.length > 0; // Don't break self-closing elements with no attributes and no comments

        if (_n.selfClosing && !_n.attributes.length && !nameHasComments) {
          return concat$4(["<", path.call(print, "name"), path.call(print, "typeParameters"), " />"]);
        } // don't break up opening elements with a single long text attribute


        if (_n.attributes && _n.attributes.length === 1 && _n.attributes[0].value && isStringLiteral(_n.attributes[0].value) && !_n.attributes[0].value.value.includes("\n") && // We should break for the following cases:
        // <div
        //   // comment
        //   attr="value"
        // >
        // <div
        //   attr="value"
        //   // comment
        // >
        !nameHasComments && (!_n.attributes[0].comments || !_n.attributes[0].comments.length)) {
          return group$1(concat$4(["<", path.call(print, "name"), path.call(print, "typeParameters"), " ", concat$4(path.map(print, "attributes")), _n.selfClosing ? " />" : ">"]));
        }

        var lastAttrHasTrailingComments = _n.attributes.length && hasTrailingComment(getLast$4(_n.attributes));
        var bracketSameLine = options.jsxBracketSameLine && ( // We should print the bracket in a new line for the following cases:
        // <div
        //   // comment
        // >
        // <div
        //   attr // comment
        // >
        !nameHasComments || _n.attributes.length) && !lastAttrHasTrailingComments; // We should print the opening element expanded if any prop value is a
        // string literal with newlines

        var _shouldBreak = _n.attributes && _n.attributes.some(function (attr) {
          return attr.value && isStringLiteral(attr.value) && attr.value.value.includes("\n");
        });

        return group$1(concat$4(["<", path.call(print, "name"), path.call(print, "typeParameters"), concat$4([indent$2(concat$4(path.map(function (attr) {
          return concat$4([line$3, print(attr)]);
        }, "attributes"))), _n.selfClosing ? line$3 : bracketSameLine ? ">" : softline$1]), _n.selfClosing ? "/>" : bracketSameLine ? "" : ">"]), {
          shouldBreak: _shouldBreak
        });
      }

    case "JSXClosingElement":
      return concat$4(["</", path.call(print, "name"), ">"]);

    case "JSXOpeningFragment":
    case "JSXClosingFragment":
    case "TSJsxOpeningFragment":
    case "TSJsxClosingFragment":
      {
        var hasComment = n.comments && n.comments.length;
        var hasOwnLineComment = hasComment && !n.comments.every(comments$3.isBlockComment);
        var isOpeningFragment = n.type === "JSXOpeningFragment" || n.type === "TSJsxOpeningFragment";
        return concat$4([isOpeningFragment ? "<" : "</", indent$2(concat$4([hasOwnLineComment ? hardline$3 : hasComment && !isOpeningFragment ? " " : "", comments.printDanglingComments(path, options, true)])), hasOwnLineComment ? hardline$3 : "", ">"]);
      }

    case "JSXText":
      /* istanbul ignore next */
      throw new Error("JSXTest should be handled by JSXElement");

    case "JSXEmptyExpression":
      {
        var requiresHardline = n.comments && !n.comments.every(comments$3.isBlockComment);
        return concat$4([comments.printDanglingComments(path, options,
        /* sameIndent */
        !requiresHardline), requiresHardline ? hardline$3 : ""]);
      }

    case "ClassBody":
      if (!n.comments && n.body.length === 0) {
        return "{}";
      }

      return concat$4(["{", n.body.length > 0 ? indent$2(concat$4([hardline$3, path.call(function (bodyPath) {
        return printStatementSequence(bodyPath, options, print);
      }, "body")])) : comments.printDanglingComments(path, options), hardline$3, "}"]);

    case "ClassProperty":
    case "TSAbstractClassProperty":
    case "ClassPrivateProperty":
      {
        if (n.accessibility) {
          parts.push(n.accessibility + " ");
        }

        if (n.static) {
          parts.push("static ");
        }

        if (n.type === "TSAbstractClassProperty") {
          parts.push("abstract ");
        }

        if (n.readonly) {
          parts.push("readonly ");
        }

        var variance = getFlowVariance(n);

        if (variance) {
          parts.push(variance);
        }

        if (n.computed) {
          parts.push("[", path.call(print, "key"), "]");
        } else {
          parts.push(printPropertyKey(path, options, print));
        }

        parts.push(printOptionalToken(path));
        parts.push(printTypeAnnotation(path, options, print));

        if (n.value) {
          parts.push(" =", printAssignmentRight(n.key, n.value, path.call(print, "value"), options));
        }

        parts.push(semi);
        return group$1(concat$4(parts));
      }

    case "ClassDeclaration":
    case "ClassExpression":
    case "TSAbstractClassDeclaration":
      if (isNodeStartingWithDeclare(n, options)) {
        parts.push("declare ");
      }

      parts.push(concat$4(printClass(path, options, print)));
      return concat$4(parts);

    case "TSInterfaceHeritage":
      parts.push(path.call(print, "id"));

      if (n.typeParameters) {
        parts.push(path.call(print, "typeParameters"));
      }

      return concat$4(parts);

    case "TemplateElement":
      return join$2(literalline$1, n.value.raw.split(/\r?\n/g));

    case "TemplateLiteral":
      {
        var expressions = path.map(print, "expressions");

        var _parentNode = path.getParentNode();
        /**
         * describe.each`table`(name, fn)
         * describe.only.each`table`(name, fn)
         * describe.skip.each`table`(name, fn)
         * test.each`table`(name, fn)
         * test.only.each`table`(name, fn)
         * test.skip.each`table`(name, fn)
         *
         * Ref: https://github.com/facebook/jest/pull/6102
         */


        var jestEachTriggerRegex = /^[xf]?(describe|it|test)$/;

        if (_parentNode.type === "TaggedTemplateExpression" && _parentNode.quasi === n && _parentNode.tag.type === "MemberExpression" && _parentNode.tag.property.type === "Identifier" && _parentNode.tag.property.name === "each" && (_parentNode.tag.object.type === "Identifier" && jestEachTriggerRegex.test(_parentNode.tag.object.name) || _parentNode.tag.object.type === "MemberExpression" && _parentNode.tag.object.property.type === "Identifier" && (_parentNode.tag.object.property.name === "only" || _parentNode.tag.object.property.name === "skip") && _parentNode.tag.object.object.type === "Identifier" && jestEachTriggerRegex.test(_parentNode.tag.object.object.name))) {
          /**
           * a    | b    | expected
           * ${1} | ${1} | ${2}
           * ${1} | ${2} | ${3}
           * ${2} | ${1} | ${3}
           */
          var headerNames = n.quasis[0].value.raw.trim().split(/\s*\|\s*/);

          if (headerNames.length > 1 || headerNames.some(function (headerName) {
            return headerName.length !== 0;
          })) {
            var stringifiedExpressions = expressions.map(function (doc$$2) {
              return "${" + printDocToString$1(doc$$2, Object.assign({}, options, {
                printWidth: Infinity
              })).formatted + "}";
            });
            var tableBody = [{
              hasLineBreak: false,
              cells: []
            }];

            for (var _i = 1; _i < n.quasis.length; _i++) {
              var row = tableBody[tableBody.length - 1];
              var correspondingExpression = stringifiedExpressions[_i - 1];
              row.cells.push(correspondingExpression);

              if (correspondingExpression.indexOf("\n") !== -1) {
                row.hasLineBreak = true;
              }

              if (n.quasis[_i].value.raw.indexOf("\n") !== -1) {
                tableBody.push({
                  hasLineBreak: false,
                  cells: []
                });
              }
            }

            var maxColumnCount = tableBody.reduce(function (maxColumnCount, row) {
              return Math.max(maxColumnCount, row.cells.length);
            }, headerNames.length);
            var maxColumnWidths = Array.from(new Array(maxColumnCount), function () {
              return 0;
            });
            var table = [{
              cells: headerNames
            }].concat(tableBody.filter(function (row) {
              return row.cells.length !== 0;
            }));
            table.filter(function (row) {
              return !row.hasLineBreak;
            }).forEach(function (row) {
              row.cells.forEach(function (cell, index) {
                maxColumnWidths[index] = Math.max(maxColumnWidths[index], getStringWidth$2(cell));
              });
            });
            parts.push("`", indent$2(concat$4([hardline$3, join$2(hardline$3, table.map(function (row) {
              return join$2(" | ", row.cells.map(function (cell, index) {
                return row.hasLineBreak ? cell : cell + " ".repeat(maxColumnWidths[index] - getStringWidth$2(cell));
              }));
            }))])), hardline$3, "`");
            return concat$4(parts);
          }
        }

        parts.push("`");
        path.each(function (childPath) {
          var i = childPath.getName();
          parts.push(print(childPath));

          if (i < expressions.length) {
            // For a template literal of the following form:
            //   `someQuery {
            //     ${call({
            //       a,
            //       b,
            //     })}
            //   }`
            // the expression is on its own line (there is a \n in the previous
            // quasi literal), therefore we want to indent the JavaScript
            // expression inside at the beginning of ${ instead of the beginning
            // of the `.
            var tabWidth = options.tabWidth;
            var indentSize = getIndentSize$1(childPath.getValue().value.raw, tabWidth);
            var _printed = expressions[i];

            if (n.expressions[i].comments && n.expressions[i].comments.length || n.expressions[i].type === "MemberExpression" || n.expressions[i].type === "OptionalMemberExpression" || n.expressions[i].type === "ConditionalExpression") {
              _printed = concat$4([indent$2(concat$4([softline$1, _printed])), softline$1]);
            }

            var aligned = addAlignmentToDoc$2(_printed, indentSize, tabWidth);
            parts.push(group$1(concat$4(["${", aligned, lineSuffixBoundary$1, "}"])));
          }
        }, "quasis");
        parts.push("`");
        return concat$4(parts);
      }
    // These types are unprintable because they serve as abstract
    // supertypes for other (printable) types.

    case "TaggedTemplateExpression":
      return concat$4([path.call(print, "tag"), path.call(print, "typeParameters"), path.call(print, "quasi")]);

    case "Node":
    case "Printable":
    case "SourceLocation":
    case "Position":
    case "Statement":
    case "Function":
    case "Pattern":
    case "Expression":
    case "Declaration":
    case "Specifier":
    case "NamedSpecifier":
    case "Comment":
    case "MemberTypeAnnotation": // Flow

    case "Type":
      /* istanbul ignore next */
      throw new Error("unprintable type: " + JSON.stringify(n.type));
    // Type Annotations for Facebook Flow, typically stripped out or
    // transformed away before printing.

    case "TypeAnnotation":
    case "TSTypeAnnotation":
      if (n.typeAnnotation) {
        return path.call(print, "typeAnnotation");
      }
      /* istanbul ignore next */


      return "";

    case "TSTupleType":
    case "TupleTypeAnnotation":
      {
        var typesField = n.type === "TSTupleType" ? "elementTypes" : "types";
        return group$1(concat$4(["[", indent$2(concat$4([softline$1, printArrayItems(path, options, typesField, print)])), // TypeScript doesn't support trailing commas in tuple types
        n.type === "TSTupleType" ? "" : ifBreak$1(shouldPrintComma(options) ? "," : ""), comments.printDanglingComments(path, options,
        /* sameIndent */
        true), softline$1, "]"]));
      }

    case "ExistsTypeAnnotation":
      return "*";

    case "EmptyTypeAnnotation":
      return "empty";

    case "AnyTypeAnnotation":
      return "any";

    case "MixedTypeAnnotation":
      return "mixed";

    case "ArrayTypeAnnotation":
      return concat$4([path.call(print, "elementType"), "[]"]);

    case "BooleanTypeAnnotation":
      return "boolean";

    case "BooleanLiteralTypeAnnotation":
      return "" + n.value;

    case "DeclareClass":
      return printFlowDeclaration(path, printClass(path, options, print));

    case "DeclareFunction":
      // For TypeScript the DeclareFunction node shares the AST
      // structure with FunctionDeclaration
      if (n.params) {
        return concat$4(["declare ", printFunctionDeclaration(path, print, options), semi]);
      }

      return printFlowDeclaration(path, ["function ", path.call(print, "id"), n.predicate ? " " : "", path.call(print, "predicate"), semi]);

    case "DeclareModule":
      return printFlowDeclaration(path, ["module ", path.call(print, "id"), " ", path.call(print, "body")]);

    case "DeclareModuleExports":
      return printFlowDeclaration(path, ["module.exports", ": ", path.call(print, "typeAnnotation"), semi]);

    case "DeclareVariable":
      return printFlowDeclaration(path, ["var ", path.call(print, "id"), semi]);

    case "DeclareExportAllDeclaration":
      return concat$4(["declare export * from ", path.call(print, "source")]);

    case "DeclareExportDeclaration":
      return concat$4(["declare ", printExportDeclaration(path, options, print)]);

    case "DeclareOpaqueType":
    case "OpaqueType":
      {
        parts.push("opaque type ", path.call(print, "id"), path.call(print, "typeParameters"));

        if (n.supertype) {
          parts.push(": ", path.call(print, "supertype"));
        }

        if (n.impltype) {
          parts.push(" = ", path.call(print, "impltype"));
        }

        parts.push(semi);

        if (n.type === "DeclareOpaqueType") {
          return printFlowDeclaration(path, parts);
        }

        return concat$4(parts);
      }

    case "FunctionTypeAnnotation":
    case "TSFunctionType":
      {
        // FunctionTypeAnnotation is ambiguous:
        // declare function foo(a: B): void; OR
        // var A: (a: B) => void;
        var _parent6 = path.getParentNode(0);

        var _parentParent2 = path.getParentNode(1);

        var _parentParentParent = path.getParentNode(2);

        var isArrowFunctionTypeAnnotation = n.type === "TSFunctionType" || !((_parent6.type === "ObjectTypeProperty" || _parent6.type === "ObjectTypeInternalSlot") && !getFlowVariance(_parent6) && !_parent6.optional && options.locStart(_parent6) === options.locStart(n) || _parent6.type === "ObjectTypeCallProperty" || _parentParentParent && _parentParentParent.type === "DeclareFunction");
        var needsColon = isArrowFunctionTypeAnnotation && (_parent6.type === "TypeAnnotation" || _parent6.type === "TSTypeAnnotation"); // Sadly we can't put it inside of FastPath::needsColon because we are
        // printing ":" as part of the expression and it would put parenthesis
        // around :(

        var needsParens = needsColon && isArrowFunctionTypeAnnotation && (_parent6.type === "TypeAnnotation" || _parent6.type === "TSTypeAnnotation") && _parentParent2.type === "ArrowFunctionExpression";

        if (isObjectTypePropertyAFunction(_parent6, options)) {
          isArrowFunctionTypeAnnotation = true;
          needsColon = true;
        }

        if (needsParens) {
          parts.push("(");
        }

        parts.push(printFunctionParams(path, print, options,
        /* expandArg */
        false,
        /* printTypeParams */
        true)); // The returnType is not wrapped in a TypeAnnotation, so the colon
        // needs to be added separately.

        if (n.returnType || n.predicate || n.typeAnnotation) {
          parts.push(isArrowFunctionTypeAnnotation ? " => " : ": ", path.call(print, "returnType"), path.call(print, "predicate"), path.call(print, "typeAnnotation"));
        }

        if (needsParens) {
          parts.push(")");
        }

        return group$1(concat$4(parts));
      }

    case "TSRestType":
      return concat$4(["...", path.call(print, "typeAnnotation")]);

    case "TSOptionalType":
      return concat$4([path.call(print, "typeAnnotation"), "?"]);

    case "FunctionTypeParam":
      return concat$4([path.call(print, "name"), printOptionalToken(path), n.name ? ": " : "", path.call(print, "typeAnnotation")]);

    case "GenericTypeAnnotation":
      return concat$4([path.call(print, "id"), path.call(print, "typeParameters")]);

    case "DeclareInterface":
    case "InterfaceDeclaration":
    case "InterfaceTypeAnnotation":
      {
        if (n.type === "DeclareInterface" || isNodeStartingWithDeclare(n, options)) {
          parts.push("declare ");
        }

        parts.push("interface");

        if (n.type === "DeclareInterface" || n.type === "InterfaceDeclaration") {
          parts.push(" ", path.call(print, "id"), path.call(print, "typeParameters"));
        }

        if (n["extends"].length > 0) {
          parts.push(group$1(indent$2(concat$4([line$3, "extends ", join$2(", ", path.map(print, "extends"))]))));
        }

        parts.push(" ", path.call(print, "body"));
        return group$1(concat$4(parts));
      }

    case "ClassImplements":
    case "InterfaceExtends":
      return concat$4([path.call(print, "id"), path.call(print, "typeParameters")]);

    case "TSIntersectionType":
    case "IntersectionTypeAnnotation":
      {
        var types = path.map(print, "types");
        var result = [];
        var wasIndented = false;

        for (var _i2 = 0; _i2 < types.length; ++_i2) {
          if (_i2 === 0) {
            result.push(types[_i2]);
          } else if (isObjectType(n.types[_i2 - 1]) && isObjectType(n.types[_i2])) {
            // If both are objects, don't indent
            result.push(concat$4([" & ", wasIndented ? indent$2(types[_i2]) : types[_i2]]));
          } else if (!isObjectType(n.types[_i2 - 1]) && !isObjectType(n.types[_i2])) {
            // If no object is involved, go to the next line if it breaks
            result.push(indent$2(concat$4([" &", line$3, types[_i2]])));
          } else {
            // If you go from object to non-object or vis-versa, then inline it
            if (_i2 > 1) {
              wasIndented = true;
            }

            result.push(" & ", _i2 > 1 ? indent$2(types[_i2]) : types[_i2]);
          }
        }

        return group$1(concat$4(result));
      }

    case "TSUnionType":
    case "UnionTypeAnnotation":
      {
        // single-line variation
        // A | B | C
        // multi-line variation
        // | A
        // | B
        // | C
        var _parent7 = path.getParentNode();

        var _parentParent3 = path.getParentNode(1); // If there's a leading comment, the parent is doing the indentation


        var shouldIndent = _parent7.type !== "TypeParameterInstantiation" && _parent7.type !== "TSTypeParameterInstantiation" && _parent7.type !== "GenericTypeAnnotation" && _parent7.type !== "TSTypeReference" && !(_parent7.type === "FunctionTypeParam" && !_parent7.name) && _parentParent3.type !== "TSTypeAssertionExpression" && !((_parent7.type === "TypeAlias" || _parent7.type === "VariableDeclarator") && hasLeadingOwnLineComment(options.originalText, n, options)); // {
        //   a: string
        // } | null | void
        // should be inlined and not be printed in the multi-line variant

        var shouldHug = shouldHugType(n); // We want to align the children but without its comment, so it looks like
        // | child1
        // // comment
        // | child2

        var _printed2 = path.map(function (typePath) {
          var printedType = typePath.call(print);

          if (!shouldHug) {
            printedType = align$1(2, printedType);
          }

          return comments.printComments(typePath, function () {
            return printedType;
          }, options);
        }, "types");

        if (shouldHug) {
          return join$2(" | ", _printed2);
        }

        var code = concat$4([ifBreak$1(concat$4([shouldIndent ? line$3 : "", "| "])), join$2(concat$4([line$3, "| "]), _printed2)]);
        var hasParens;

        if (n.type === "TSUnionType") {
          var greatGrandParent = path.getParentNode(2);
          var greatGreatGrandParent = path.getParentNode(3);
          hasParens = greatGrandParent && greatGrandParent.type === "TSParenthesizedType" && greatGreatGrandParent && (greatGreatGrandParent.type === "TSUnionType" || greatGreatGrandParent.type === "TSIntersectionType");
        } else {
          hasParens = needsParens_1(path, options);
        }

        if (hasParens) {
          return group$1(concat$4([indent$2(code), softline$1]));
        }

        return group$1(shouldIndent ? indent$2(code) : code);
      }

    case "NullableTypeAnnotation":
      return concat$4(["?", path.call(print, "typeAnnotation")]);

    case "TSNullKeyword":
    case "NullLiteralTypeAnnotation":
      return "null";

    case "ThisTypeAnnotation":
      return "this";

    case "NumberTypeAnnotation":
      return "number";

    case "ObjectTypeCallProperty":
      if (n.static) {
        parts.push("static ");
      }

      parts.push(path.call(print, "value"));
      return concat$4(parts);

    case "ObjectTypeIndexer":
      {
        var _variance = getFlowVariance(n);

        return concat$4([_variance || "", "[", path.call(print, "id"), n.id ? ": " : "", path.call(print, "key"), "]: ", path.call(print, "value")]);
      }

    case "ObjectTypeProperty":
      {
        var _variance2 = getFlowVariance(n);

        var modifier = "";

        if (n.proto) {
          modifier = "proto ";
        } else if (n.static) {
          modifier = "static ";
        }

        return concat$4([modifier, isGetterOrSetter(n) ? n.kind + " " : "", _variance2 || "", printPropertyKey(path, options, print), printOptionalToken(path), isFunctionNotation(n, options) ? "" : ": ", path.call(print, "value")]);
      }

    case "QualifiedTypeIdentifier":
      return concat$4([path.call(print, "qualification"), ".", path.call(print, "id")]);

    case "StringLiteralTypeAnnotation":
      return nodeStr(n, options);

    case "NumberLiteralTypeAnnotation":
      assert$3.strictEqual(_typeof(n.value), "number");

      if (n.extra != null) {
        return printNumber$1(n.extra.raw);
      }

      return printNumber$1(n.raw);

    case "StringTypeAnnotation":
      return "string";

    case "DeclareTypeAlias":
    case "TypeAlias":
      {
        if (n.type === "DeclareTypeAlias" || isNodeStartingWithDeclare(n, options)) {
          parts.push("declare ");
        }

        var _printed3 = printAssignmentRight(n.id, n.right, path.call(print, "right"), options);

        parts.push("type ", path.call(print, "id"), path.call(print, "typeParameters"), " =", _printed3, semi);
        return group$1(concat$4(parts));
      }

    case "TypeCastExpression":
      return concat$4(["(", path.call(print, "expression"), ": ", path.call(print, "typeAnnotation"), ")"]);

    case "TypeParameterDeclaration":
    case "TypeParameterInstantiation":
    case "TSTypeParameterDeclaration":
    case "TSTypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");

    case "TSTypeParameter":
    case "TypeParameter":
      {
        var _parent8 = path.getParentNode();

        if (_parent8.type === "TSMappedType") {
          parts.push("[", path.call(print, "name"));

          if (n.constraint) {
            parts.push(" in ", path.call(print, "constraint"));
          }

          parts.push("]");
          return concat$4(parts);
        }

        var _variance3 = getFlowVariance(n);

        if (_variance3) {
          parts.push(_variance3);
        }

        parts.push(path.call(print, "name"));

        if (n.bound) {
          parts.push(": ");
          parts.push(path.call(print, "bound"));
        }

        if (n.constraint) {
          parts.push(" extends ", path.call(print, "constraint"));
        }

        if (n["default"]) {
          parts.push(" = ", path.call(print, "default"));
        }

        return concat$4(parts);
      }

    case "TypeofTypeAnnotation":
      return concat$4(["typeof ", path.call(print, "argument")]);

    case "VoidTypeAnnotation":
      return "void";

    case "InferredPredicate":
      return "%checks";
    // Unhandled types below. If encountered, nodes of these types should
    // be either left alone or desugared into AST types that are fully
    // supported by the pretty-printer.

    case "DeclaredPredicate":
      return concat$4(["%checks(", path.call(print, "value"), ")"]);

    case "TSAbstractKeyword":
      return "abstract";

    case "TSAnyKeyword":
      return "any";

    case "TSAsyncKeyword":
      return "async";

    case "TSBooleanKeyword":
      return "boolean";

    case "TSConstKeyword":
      return "const";

    case "TSDeclareKeyword":
      return "declare";

    case "TSExportKeyword":
      return "export";

    case "TSNeverKeyword":
      return "never";

    case "TSNumberKeyword":
      return "number";

    case "TSObjectKeyword":
      return "object";

    case "TSProtectedKeyword":
      return "protected";

    case "TSPrivateKeyword":
      return "private";

    case "TSPublicKeyword":
      return "public";

    case "TSReadonlyKeyword":
      return "readonly";

    case "TSSymbolKeyword":
      return "symbol";

    case "TSStaticKeyword":
      return "static";

    case "TSStringKeyword":
      return "string";

    case "TSUndefinedKeyword":
      return "undefined";

    case "TSUnknownKeyword":
      return "unknown";

    case "TSVoidKeyword":
      return "void";

    case "TSAsExpression":
      return concat$4([path.call(print, "expression"), " as ", path.call(print, "typeAnnotation")]);

    case "TSArrayType":
      return concat$4([path.call(print, "elementType"), "[]"]);

    case "TSPropertySignature":
      {
        if (n.export) {
          parts.push("export ");
        }

        if (n.accessibility) {
          parts.push(n.accessibility + " ");
        }

        if (n.static) {
          parts.push("static ");
        }

        if (n.readonly) {
          parts.push("readonly ");
        }

        if (n.computed) {
          parts.push("[");
        }

        parts.push(printPropertyKey(path, options, print));

        if (n.computed) {
          parts.push("]");
        }

        parts.push(printOptionalToken(path));

        if (n.typeAnnotation) {
          parts.push(": ");
          parts.push(path.call(print, "typeAnnotation"));
        } // This isn't valid semantically, but it's in the AST so we can print it.


        if (n.initializer) {
          parts.push(" = ", path.call(print, "initializer"));
        }

        return concat$4(parts);
      }

    case "TSParameterProperty":
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }

      if (n.export) {
        parts.push("export ");
      }

      if (n.static) {
        parts.push("static ");
      }

      if (n.readonly) {
        parts.push("readonly ");
      }

      parts.push(path.call(print, "parameter"));
      return concat$4(parts);

    case "TSTypeReference":
      return concat$4([path.call(print, "typeName"), printTypeParameters(path, options, print, "typeParameters")]);

    case "TSTypeQuery":
      return concat$4(["typeof ", path.call(print, "exprName")]);

    case "TSParenthesizedType":
      {
        return path.call(print, "typeAnnotation");
      }

    case "TSIndexSignature":
      {
        var _parent9 = path.getParentNode();

        return concat$4([n.export ? "export " : "", n.accessibility ? concat$4([n.accessibility, " "]) : "", n.static ? "static " : "", n.readonly ? "readonly " : "", "[", path.call(print, "index"), "]: ", path.call(print, "typeAnnotation"), _parent9.type === "ClassBody" ? semi : ""]);
      }

    case "TSTypePredicate":
      return concat$4([path.call(print, "parameterName"), " is ", path.call(print, "typeAnnotation")]);

    case "TSNonNullExpression":
      return concat$4([path.call(print, "expression"), "!"]);

    case "TSThisType":
      return "this";

    case "TSImportType":
      return concat$4([!n.isTypeOf ? "" : "typeof ", "import(", path.call(print, "parameter"), ")", !n.qualifier ? "" : concat$4([".", path.call(print, "qualifier")]), printTypeParameters(path, options, print, "typeParameters")]);

    case "TSLiteralType":
      return path.call(print, "literal");

    case "TSIndexedAccessType":
      return concat$4([path.call(print, "objectType"), "[", path.call(print, "indexType"), "]"]);

    case "TSConstructSignature":
    case "TSConstructorType":
    case "TSCallSignature":
      {
        if (n.type !== "TSCallSignature") {
          parts.push("new ");
        }

        parts.push(group$1(printFunctionParams(path, print, options,
        /* expandArg */
        false,
        /* printTypeParams */
        true)));

        if (n.typeAnnotation) {
          var isType = n.type === "TSConstructorType";
          parts.push(isType ? " => " : ": ", path.call(print, "typeAnnotation"));
        }

        return concat$4(parts);
      }

    case "TSTypeOperator":
      return concat$4([n.operator, " ", path.call(print, "typeAnnotation")]);

    case "TSMappedType":
      return group$1(concat$4(["{", indent$2(concat$4([options.bracketSpacing ? line$3 : softline$1, n.readonlyToken ? concat$4([getTypeScriptMappedTypeModifier(n.readonlyToken, "readonly"), " "]) : "", printTypeScriptModifiers(path, options, print), path.call(print, "typeParameter"), n.questionToken ? getTypeScriptMappedTypeModifier(n.questionToken, "?") : "", ": ", path.call(print, "typeAnnotation")])), comments.printDanglingComments(path, options,
      /* sameIndent */
      true), options.bracketSpacing ? line$3 : softline$1, "}"]));

    case "TSMethodSignature":
      parts.push(n.accessibility ? concat$4([n.accessibility, " "]) : "", n.export ? "export " : "", n.static ? "static " : "", n.readonly ? "readonly " : "", n.computed ? "[" : "", path.call(print, "key"), n.computed ? "]" : "", printOptionalToken(path), printFunctionParams(path, print, options,
      /* expandArg */
      false,
      /* printTypeParams */
      true));

      if (n.typeAnnotation) {
        parts.push(": ", path.call(print, "typeAnnotation"));
      }

      return group$1(concat$4(parts));

    case "TSNamespaceExportDeclaration":
      parts.push("export as namespace ", path.call(print, "name"));

      if (options.semi) {
        parts.push(";");
      }

      return group$1(concat$4(parts));

    case "TSEnumDeclaration":
      if (isNodeStartingWithDeclare(n, options)) {
        parts.push("declare ");
      }

      if (n.modifiers) {
        parts.push(printTypeScriptModifiers(path, options, print));
      }

      if (n.const) {
        parts.push("const ");
      }

      parts.push("enum ", path.call(print, "id"), " ");

      if (n.members.length === 0) {
        parts.push(group$1(concat$4(["{", comments.printDanglingComments(path, options), softline$1, "}"])));
      } else {
        parts.push(group$1(concat$4(["{", indent$2(concat$4([hardline$3, printArrayItems(path, options, "members", print), shouldPrintComma(options, "es5") ? "," : ""])), comments.printDanglingComments(path, options,
        /* sameIndent */
        true), hardline$3, "}"])));
      }

      return concat$4(parts);

    case "TSEnumMember":
      parts.push(path.call(print, "id"));

      if (n.initializer) {
        parts.push(" = ", path.call(print, "initializer"));
      }

      return concat$4(parts);

    case "TSImportEqualsDeclaration":
      parts.push(printTypeScriptModifiers(path, options, print), "import ", path.call(print, "name"), " = ", path.call(print, "moduleReference"));

      if (options.semi) {
        parts.push(";");
      }

      return group$1(concat$4(parts));

    case "TSExternalModuleReference":
      return concat$4(["require(", path.call(print, "expression"), ")"]);

    case "TSModuleDeclaration":
      {
        var _parent10 = path.getParentNode();

        var isExternalModule = isLiteral(n.id);
        var parentIsDeclaration = _parent10.type === "TSModuleDeclaration";
        var bodyIsDeclaration = n.body && n.body.type === "TSModuleDeclaration";

        if (parentIsDeclaration) {
          parts.push(".");
        } else {
          if (n.declare === true) {
            parts.push("declare ");
          }

          parts.push(printTypeScriptModifiers(path, options, print)); // Global declaration looks like this:
          // (declare)? global { ... }

          var isGlobalDeclaration = n.id.type === "Identifier" && n.id.name === "global" && !/namespace|module/.test(options.originalText.slice(options.locStart(n), options.locStart(n.id)));

          if (!isGlobalDeclaration) {
            parts.push(isExternalModule ? "module " : "namespace ");
          }
        }

        parts.push(path.call(print, "id"));

        if (bodyIsDeclaration) {
          parts.push(path.call(print, "body"));
        } else if (n.body) {
          parts.push(" {", indent$2(concat$4([line$3, path.call(function (bodyPath) {
            return comments.printDanglingComments(bodyPath, options, true);
          }, "body"), group$1(path.call(print, "body"))])), line$3, "}");
        } else {
          parts.push(semi);
        }

        return concat$4(parts);
      }

    case "TSModuleBlock":
      return path.call(function (bodyPath) {
        return printStatementSequence(bodyPath, options, print);
      }, "body");

    case "PrivateName":
      return concat$4(["#", path.call(print, "id")]);

    case "TSConditionalType":
      return formatTernaryOperator(path, options, print, {
        beforeParts: function beforeParts() {
          return [path.call(print, "checkType"), " ", "extends", " ", path.call(print, "extendsType")];
        },
        shouldCheckJsx: false,
        operatorName: "TSConditionalType",
        consequentNode: "trueType",
        alternateNode: "falseType",
        testNode: "checkType",
        breakNested: false
      });

    case "TSInferType":
      return concat$4(["infer", " ", path.call(print, "typeParameter")]);

    case "InterpreterDirective":
      parts.push("#!", n.value, hardline$3);

      if (isNextLineEmpty$2(options.originalText, n, options)) {
        parts.push(hardline$3);
      }

      return concat$4(parts);

    default:
      /* istanbul ignore next */
      throw new Error("unknown type: " + JSON.stringify(n.type));
  }
}

function printStatementSequence(path, options, print) {
  var printed = [];
  var bodyNode = path.getNode();
  var isClass = bodyNode.type === "ClassBody";
  path.map(function (stmtPath, i) {
    var stmt = stmtPath.getValue(); // Just in case the AST has been modified to contain falsy
    // "statements," it's safer simply to skip them.

    /* istanbul ignore if */

    if (!stmt) {
      return;
    } // Skip printing EmptyStatement nodes to avoid leaving stray
    // semicolons lying around.


    if (stmt.type === "EmptyStatement") {
      return;
    }

    var stmtPrinted = print(stmtPath);
    var text = options.originalText;
    var parts = []; // in no-semi mode, prepend statement with semicolon if it might break ASI
    // don't prepend the only JSX element in a program with semicolon

    if (!options.semi && !isClass && !isTheOnlyJSXElementInMarkdown(options, stmtPath) && stmtNeedsASIProtection(stmtPath, options)) {
      if (stmt.comments && stmt.comments.some(function (comment) {
        return comment.leading;
      })) {
        parts.push(print(stmtPath, {
          needsSemi: true
        }));
      } else {
        parts.push(";", stmtPrinted);
      }
    } else {
      parts.push(stmtPrinted);
    }

    if (!options.semi && isClass) {
      if (classPropMayCauseASIProblems(stmtPath)) {
        parts.push(";");
      } else if (stmt.type === "ClassProperty") {
        var nextChild = bodyNode.body[i + 1];

        if (classChildNeedsASIProtection(nextChild)) {
          parts.push(";");
        }
      }
    }

    if (isNextLineEmpty$2(text, stmt, options) && !isLastStatement(stmtPath)) {
      parts.push(hardline$3);
    }

    printed.push(concat$4(parts));
  });
  return join$2(hardline$3, printed);
}

function printPropertyKey(path, options, print) {
  var node = path.getNode();
  var key = node.key;

  if (key.type === "Identifier" && !node.computed && options.parser === "json") {
    // a -> "a"
    return path.call(function (keyPath) {
      return comments.printComments(keyPath, function () {
        return JSON.stringify(key.name);
      }, options);
    }, "key");
  }

  if (isStringLiteral(key) && isIdentifierName(key.value) && !node.computed && options.parser !== "json" && !(options.parser === "typescript" && node.type === "ClassProperty")) {
    // 'a' -> a
    return path.call(function (keyPath) {
      return comments.printComments(keyPath, function () {
        return key.value;
      }, options);
    }, "key");
  }

  return path.call(print, "key");
}

function printMethod(path, options, print) {
  var node = path.getNode();
  var semi = options.semi ? ";" : "";
  var kind = node.kind;
  var parts = [];

  if (node.type === "ObjectMethod" || node.type === "ClassMethod") {
    node.value = node;
  }

  if (node.value.async) {
    parts.push("async ");
  }

  if (!kind || kind === "init" || kind === "method" || kind === "constructor") {
    if (node.value.generator) {
      parts.push("*");
    }
  } else {
    assert$3.ok(kind === "get" || kind === "set");
    parts.push(kind, " ");
  }

  var key = printPropertyKey(path, options, print);

  if (node.computed) {
    key = concat$4(["[", key, "]"]);
  }

  parts.push(key, concat$4(path.call(function (valuePath) {
    return [printFunctionTypeParameters(valuePath, options, print), group$1(concat$4([printFunctionParams(valuePath, print, options), printReturnType(valuePath, print, options)]))];
  }, "value")));

  if (!node.value.body || node.value.body.length === 0) {
    parts.push(semi);
  } else {
    parts.push(" ", path.call(print, "value", "body"));
  }

  return concat$4(parts);
}

function couldGroupArg(arg) {
  return arg.type === "ObjectExpression" && (arg.properties.length > 0 || arg.comments) || arg.type === "ArrayExpression" && (arg.elements.length > 0 || arg.comments) || arg.type === "TSTypeAssertionExpression" || arg.type === "TSAsExpression" || arg.type === "FunctionExpression" || arg.type === "ArrowFunctionExpression" && !arg.returnType && (arg.body.type === "BlockStatement" || arg.body.type === "ArrowFunctionExpression" || arg.body.type === "ObjectExpression" || arg.body.type === "ArrayExpression" || arg.body.type === "CallExpression" || arg.body.type === "OptionalCallExpression" || isJSXNode(arg.body));
}

function shouldGroupLastArg(args) {
  var lastArg = getLast$4(args);
  var penultimateArg = getPenultimate$1(args);
  return !hasLeadingComment(lastArg) && !hasTrailingComment(lastArg) && couldGroupArg(lastArg) && ( // If the last two arguments are of the same type,
  // disable last element expansion.
  !penultimateArg || penultimateArg.type !== lastArg.type);
}

function shouldGroupFirstArg(args) {
  if (args.length !== 2) {
    return false;
  }

  var firstArg = args[0];
  var secondArg = args[1];
  return (!firstArg.comments || !firstArg.comments.length) && (firstArg.type === "FunctionExpression" || firstArg.type === "ArrowFunctionExpression" && firstArg.body.type === "BlockStatement") && secondArg.type !== "FunctionExpression" && secondArg.type !== "ArrowFunctionExpression" && !couldGroupArg(secondArg);
}

var functionCompositionFunctionNames = new Set(["pipe", // RxJS, Ramda
"pipeP", // Ramda
"pipeK", // Ramda
"compose", // Ramda, Redux
"composeFlipped", // Not from any library, but common in Haskell, so supported
"composeP", // Ramda
"composeK", // Ramda
"flow", // Lodash
"flowRight", // Lodash
"connect" // Redux
]);

function isFunctionCompositionFunction(node) {
  switch (node.type) {
    case "OptionalMemberExpression":
    case "MemberExpression":
      {
        return isFunctionCompositionFunction(node.property);
      }

    case "Identifier":
      {
        return functionCompositionFunctionNames.has(node.name);
      }

    case "StringLiteral":
    case "Literal":
      {
        return functionCompositionFunctionNames.has(node.value);
      }
  }
}

function printArgumentsList(path, options, print) {
  var node = path.getValue();
  var args = node.arguments;

  if (args.length === 0) {
    return concat$4(["(", comments.printDanglingComments(path, options,
    /* sameIndent */
    true), ")"]);
  }

  var anyArgEmptyLine = false;
  var hasEmptyLineFollowingFirstArg = false;
  var lastArgIndex = args.length - 1;
  var printedArguments = path.map(function (argPath, index) {
    var arg = argPath.getNode();
    var parts = [print(argPath)];

    if (index === lastArgIndex) {// do nothing
    } else if (isNextLineEmpty$2(options.originalText, arg, options)) {
      if (index === 0) {
        hasEmptyLineFollowingFirstArg = true;
      }

      anyArgEmptyLine = true;
      parts.push(",", hardline$3, hardline$3);
    } else {
      parts.push(",", line$3);
    }

    return concat$4(parts);
  }, "arguments");
  var maybeTrailingComma = shouldPrintComma(options, "all") ? "," : "";

  function allArgsBrokenOut() {
    return group$1(concat$4(["(", indent$2(concat$4([line$3, concat$4(printedArguments)])), maybeTrailingComma, line$3, ")"]), {
      shouldBreak: true
    });
  } // We want to get
  //    pipe(
  //      x => x + 1,
  //      x => x - 1
  //    )
  // here, but not
  //    process.stdout.pipe(socket)


  if (isFunctionCompositionFunction(node.callee) && args.length > 1) {
    return allArgsBrokenOut();
  }

  var shouldGroupFirst = shouldGroupFirstArg(args);
  var shouldGroupLast = shouldGroupLastArg(args);

  if (shouldGroupFirst || shouldGroupLast) {
    var shouldBreak = (shouldGroupFirst ? printedArguments.slice(1).some(willBreak$1) : printedArguments.slice(0, -1).some(willBreak$1)) || anyArgEmptyLine; // We want to print the last argument with a special flag

    var printedExpanded;
    var i = 0;
    path.each(function (argPath) {
      if (shouldGroupFirst && i === 0) {
        printedExpanded = [concat$4([argPath.call(function (p) {
          return print(p, {
            expandFirstArg: true
          });
        }), printedArguments.length > 1 ? "," : "", hasEmptyLineFollowingFirstArg ? hardline$3 : line$3, hasEmptyLineFollowingFirstArg ? hardline$3 : ""])].concat(printedArguments.slice(1));
      }

      if (shouldGroupLast && i === args.length - 1) {
        printedExpanded = printedArguments.slice(0, -1).concat(argPath.call(function (p) {
          return print(p, {
            expandLastArg: true
          });
        }));
      }

      i++;
    }, "arguments");
    var somePrintedArgumentsWillBreak = printedArguments.some(willBreak$1);
    return concat$4([somePrintedArgumentsWillBreak ? breakParent$2 : "", conditionalGroup$1([concat$4([ifBreak$1(indent$2(concat$4(["(", softline$1, concat$4(printedExpanded)])), concat$4(["(", concat$4(printedExpanded)])), somePrintedArgumentsWillBreak ? concat$4([ifBreak$1(maybeTrailingComma), softline$1]) : "", ")"]), shouldGroupFirst ? concat$4(["(", group$1(printedExpanded[0], {
      shouldBreak: true
    }), concat$4(printedExpanded.slice(1)), ")"]) : concat$4(["(", concat$4(printedArguments.slice(0, -1)), group$1(getLast$4(printedExpanded), {
      shouldBreak: true
    }), ")"]), allArgsBrokenOut()], {
      shouldBreak: shouldBreak
    })]);
  }

  return group$1(concat$4(["(", indent$2(concat$4([softline$1, concat$4(printedArguments)])), ifBreak$1(shouldPrintComma(options, "all") ? "," : ""), softline$1, ")"]), {
    shouldBreak: printedArguments.some(willBreak$1) || anyArgEmptyLine
  });
}

function printTypeAnnotation(path, options, print) {
  var node = path.getValue();

  if (!node.typeAnnotation) {
    return "";
  }

  var parentNode = path.getParentNode();
  var isDefinite = node.definite || parentNode && parentNode.type === "VariableDeclarator" && parentNode.definite;
  var isFunctionDeclarationIdentifier = parentNode.type === "DeclareFunction" && parentNode.id === node;

  if (isFlowAnnotationComment(options.originalText, node.typeAnnotation, options)) {
    return concat$4([" /*: ", path.call(print, "typeAnnotation"), " */"]);
  }

  return concat$4([isFunctionDeclarationIdentifier ? "" : isDefinite ? "!: " : ": ", path.call(print, "typeAnnotation")]);
}

function printFunctionTypeParameters(path, options, print) {
  var fun = path.getValue();

  if (fun.typeArguments) {
    return path.call(print, "typeArguments");
  }

  if (fun.typeParameters) {
    return path.call(print, "typeParameters");
  }

  return "";
}

function printFunctionParams(path, print, options, expandArg, printTypeParams) {
  var fun = path.getValue();
  var paramsField = fun.parameters ? "parameters" : "params";
  var typeParams = printTypeParams ? printFunctionTypeParameters(path, options, print) : "";
  var printed = [];

  if (fun[paramsField]) {
    printed = path.map(print, paramsField);
  }

  if (fun.rest) {
    printed.push(concat$4(["...", path.call(print, "rest")]));
  }

  if (printed.length === 0) {
    return concat$4([typeParams, "(", comments.printDanglingComments(path, options,
    /* sameIndent */
    true, function (comment) {
      return getNextNonSpaceNonCommentCharacter$1(options.originalText, comment, options.locEnd) === ")";
    }), ")"]);
  }

  var lastParam = getLast$4(fun[paramsField]); // If the parent is a call with the first/last argument expansion and this is the
  // params of the first/last argument, we dont want the arguments to break and instead
  // want the whole expression to be on a new line.
  //
  // Good:                 Bad:
  //   verylongcall(         verylongcall((
  //     (a, b) => {           a,
  //     }                     b,
  //   })                    ) => {
  //                         })

  if (expandArg && !(fun[paramsField] && fun[paramsField].some(function (n) {
    return n.comments;
  }))) {
    return group$1(concat$4([removeLines$1(typeParams), "(", join$2(", ", printed.map(removeLines$1)), ")"]));
  } // Single object destructuring should hug
  //
  // function({
  //   a,
  //   b,
  //   c
  // }) {}


  if (shouldHugArguments(fun)) {
    return concat$4([typeParams, "(", join$2(", ", printed), ")"]);
  }

  var parent = path.getParentNode(); // don't break in specs, eg; `it("should maintain parens around done even when long", (done) => {})`

  if (isTestCall(parent)) {
    return concat$4([typeParams, "(", join$2(", ", printed), ")"]);
  }

  var flowTypeAnnotations = ["AnyTypeAnnotation", "NullLiteralTypeAnnotation", "GenericTypeAnnotation", "ThisTypeAnnotation", "NumberTypeAnnotation", "VoidTypeAnnotation", "EmptyTypeAnnotation", "MixedTypeAnnotation", "BooleanTypeAnnotation", "BooleanLiteralTypeAnnotation", "StringTypeAnnotation"];
  var isFlowShorthandWithOneArg = (isObjectTypePropertyAFunction(parent, options) || isTypeAnnotationAFunction(parent, options) || parent.type === "TypeAlias" || parent.type === "UnionTypeAnnotation" || parent.type === "TSUnionType" || parent.type === "IntersectionTypeAnnotation" || parent.type === "FunctionTypeAnnotation" && parent.returnType === fun) && fun[paramsField].length === 1 && fun[paramsField][0].name === null && fun[paramsField][0].typeAnnotation && fun.typeParameters === null && flowTypeAnnotations.indexOf(fun[paramsField][0].typeAnnotation.type) !== -1 && !(fun[paramsField][0].typeAnnotation.type === "GenericTypeAnnotation" && fun[paramsField][0].typeAnnotation.typeParameters) && !fun.rest;

  if (isFlowShorthandWithOneArg) {
    if (options.arrowParens === "always") {
      return concat$4(["(", concat$4(printed), ")"]);
    }

    return concat$4(printed);
  }

  var canHaveTrailingComma = !(lastParam && lastParam.type === "RestElement") && !fun.rest;
  return concat$4([typeParams, "(", indent$2(concat$4([softline$1, join$2(concat$4([",", line$3]), printed)])), ifBreak$1(canHaveTrailingComma && shouldPrintComma(options, "all") ? "," : ""), softline$1, ")"]);
}

function shouldPrintParamsWithoutParens(path, options) {
  if (options.arrowParens === "always") {
    return false;
  }

  if (options.arrowParens === "avoid") {
    var node = path.getValue();
    return canPrintParamsWithoutParens(node);
  } // Fallback default; should be unreachable


  return false;
}

function canPrintParamsWithoutParens(node) {
  return node.params.length === 1 && !node.rest && !node.typeParameters && !hasDanglingComments(node) && node.params[0].type === "Identifier" && !node.params[0].typeAnnotation && !node.params[0].comments && !node.params[0].optional && !node.predicate && !node.returnType;
}

function printFunctionDeclaration(path, print, options) {
  var n = path.getValue();
  var parts = [];

  if (n.async) {
    parts.push("async ");
  }

  parts.push("function");

  if (n.generator) {
    parts.push("*");
  }

  if (n.id) {
    parts.push(" ", path.call(print, "id"));
  }

  parts.push(printFunctionTypeParameters(path, options, print), group$1(concat$4([printFunctionParams(path, print, options), printReturnType(path, print, options)])), n.body ? " " : "", path.call(print, "body"));
  return concat$4(parts);
}

function printObjectMethod(path, options, print) {
  var objMethod = path.getValue();
  var parts = [];

  if (objMethod.async) {
    parts.push("async ");
  }

  if (objMethod.generator) {
    parts.push("*");
  }

  if (objMethod.method || objMethod.kind === "get" || objMethod.kind === "set") {
    return printMethod(path, options, print);
  }

  var key = printPropertyKey(path, options, print);

  if (objMethod.computed) {
    parts.push("[", key, "]");
  } else {
    parts.push(key);
  }

  parts.push(printFunctionTypeParameters(path, options, print), group$1(concat$4([printFunctionParams(path, print, options), printReturnType(path, print, options)])), " ", path.call(print, "body"));
  return concat$4(parts);
}

function printReturnType(path, print, options) {
  var n = path.getValue();
  var returnType = path.call(print, "returnType");

  if (n.returnType && isFlowAnnotationComment(options.originalText, n.returnType, options)) {
    return concat$4([" /*: ", returnType, " */"]);
  }

  var parts = [returnType]; // prepend colon to TypeScript type annotation

  if (n.returnType && n.returnType.typeAnnotation) {
    parts.unshift(": ");
  }

  if (n.predicate) {
    // The return type will already add the colon, but otherwise we
    // need to do it ourselves
    parts.push(n.returnType ? " " : ": ", path.call(print, "predicate"));
  }

  return concat$4(parts);
}

function printExportDeclaration(path, options, print) {
  var decl = path.getValue();
  var semi = options.semi ? ";" : "";
  var parts = ["export "];
  var isDefault = decl["default"] || decl.type === "ExportDefaultDeclaration";

  if (isDefault) {
    parts.push("default ");
  }

  parts.push(comments.printDanglingComments(path, options,
  /* sameIndent */
  true));

  if (needsHardlineAfterDanglingComment(decl)) {
    parts.push(hardline$3);
  }

  if (decl.declaration) {
    parts.push(path.call(print, "declaration"));

    if (isDefault && decl.declaration.type !== "ClassDeclaration" && decl.declaration.type !== "FunctionDeclaration" && decl.declaration.type !== "TSAbstractClassDeclaration" && decl.declaration.type !== "TSInterfaceDeclaration" && decl.declaration.type !== "DeclareClass" && decl.declaration.type !== "DeclareFunction") {
      parts.push(semi);
    }
  } else {
    if (decl.specifiers && decl.specifiers.length > 0) {
      var specifiers = [];
      var defaultSpecifiers = [];
      var namespaceSpecifiers = [];
      path.each(function (specifierPath) {
        var specifierType = path.getValue().type;

        if (specifierType === "ExportSpecifier") {
          specifiers.push(print(specifierPath));
        } else if (specifierType === "ExportDefaultSpecifier") {
          defaultSpecifiers.push(print(specifierPath));
        } else if (specifierType === "ExportNamespaceSpecifier") {
          namespaceSpecifiers.push(concat$4(["* as ", print(specifierPath)]));
        }
      }, "specifiers");
      var isNamespaceFollowed = namespaceSpecifiers.length !== 0 && specifiers.length !== 0;
      var isDefaultFollowed = defaultSpecifiers.length !== 0 && (namespaceSpecifiers.length !== 0 || specifiers.length !== 0);
      parts.push(decl.exportKind === "type" ? "type " : "", concat$4(defaultSpecifiers), concat$4([isDefaultFollowed ? ", " : ""]), concat$4(namespaceSpecifiers), concat$4([isNamespaceFollowed ? ", " : ""]), specifiers.length !== 0 ? group$1(concat$4(["{", indent$2(concat$4([options.bracketSpacing ? line$3 : softline$1, join$2(concat$4([",", line$3]), specifiers)])), ifBreak$1(shouldPrintComma(options) ? "," : ""), options.bracketSpacing ? line$3 : softline$1, "}"])) : "");
    } else {
      parts.push("{}");
    }

    if (decl.source) {
      parts.push(" from ", path.call(print, "source"));
    }

    parts.push(semi);
  }

  return concat$4(parts);
}

function printFlowDeclaration(path, parts) {
  var parentExportDecl = getParentExportDeclaration$1(path);

  if (parentExportDecl) {
    assert$3.strictEqual(parentExportDecl.type, "DeclareExportDeclaration");
  } else {
    // If the parent node has type DeclareExportDeclaration, then it
    // will be responsible for printing the "declare" token. Otherwise
    // it needs to be printed with this non-exported declaration node.
    parts.unshift("declare ");
  }

  return concat$4(parts);
}

function getFlowVariance(path) {
  if (!path.variance) {
    return null;
  } // Babylon 7.0 currently uses variance node type, and flow should
  // follow suit soon:
  // https://github.com/babel/babel/issues/4722


  var variance = path.variance.kind || path.variance;

  switch (variance) {
    case "plus":
      return "+";

    case "minus":
      return "-";

    default:
      /* istanbul ignore next */
      return variance;
  }
}

function printTypeScriptModifiers(path, options, print) {
  var n = path.getValue();

  if (!n.modifiers || !n.modifiers.length) {
    return "";
  }

  return concat$4([join$2(" ", path.map(print, "modifiers")), " "]);
}

function printTypeParameters(path, options, print, paramsKey) {
  var n = path.getValue();

  if (!n[paramsKey]) {
    return "";
  } // for TypeParameterDeclaration typeParameters is a single node


  if (!Array.isArray(n[paramsKey])) {
    return path.call(print, paramsKey);
  }

  var grandparent = path.getNode(2);
  var isParameterInTestCall = grandparent != null && isTestCall(grandparent);
  var shouldInline = isParameterInTestCall || n[paramsKey].length === 0 || n[paramsKey].length === 1 && (shouldHugType(n[paramsKey][0]) || n[paramsKey][0].type === "GenericTypeAnnotation" && shouldHugType(n[paramsKey][0].id) || n[paramsKey][0].type === "TSTypeReference" && shouldHugType(n[paramsKey][0].typeName) || n[paramsKey][0].type === "NullableTypeAnnotation");

  if (shouldInline) {
    return concat$4(["<", join$2(", ", path.map(print, paramsKey)), ">"]);
  }

  return group$1(concat$4(["<", indent$2(concat$4([softline$1, join$2(concat$4([",", line$3]), path.map(print, paramsKey))])), ifBreak$1(options.parser !== "typescript" && shouldPrintComma(options, "all") ? "," : ""), softline$1, ">"]));
}

function printClass(path, options, print) {
  var n = path.getValue();
  var parts = [];

  if (n.type === "TSAbstractClassDeclaration") {
    parts.push("abstract ");
  }

  parts.push("class");

  if (n.id) {
    parts.push(" ", path.call(print, "id"));
  }

  parts.push(path.call(print, "typeParameters"));
  var partsGroup = [];

  if (n.superClass) {
    var printed = concat$4(["extends ", path.call(print, "superClass"), path.call(print, "superTypeParameters")]); // Keep old behaviour of extends in same line
    // If there is only on extends and there are not comments

    if ((!n.implements || n.implements.length === 0) && (!n.superClass.comments || n.superClass.comments.length === 0)) {
      parts.push(concat$4([" ", path.call(function (superClass) {
        return comments.printComments(superClass, function () {
          return printed;
        }, options);
      }, "superClass")]));
    } else {
      partsGroup.push(group$1(concat$4([line$3, path.call(function (superClass) {
        return comments.printComments(superClass, function () {
          return printed;
        }, options);
      }, "superClass")])));
    }
  } else if (n.extends && n.extends.length > 0) {
    parts.push(" extends ", join$2(", ", path.map(print, "extends")));
  }

  if (n["mixins"] && n["mixins"].length > 0) {
    partsGroup.push(line$3, "mixins ", group$1(indent$2(join$2(concat$4([",", line$3]), path.map(print, "mixins")))));
  }

  if (n["implements"] && n["implements"].length > 0) {
    partsGroup.push(line$3, "implements", group$1(indent$2(concat$4([line$3, join$2(concat$4([",", line$3]), path.map(print, "implements"))]))));
  }

  if (partsGroup.length > 0) {
    parts.push(group$1(indent$2(concat$4(partsGroup))));
  }

  if (n.body && n.body.comments && hasLeadingOwnLineComment(options.originalText, n.body, options)) {
    parts.push(hardline$3);
  } else {
    parts.push(" ");
  }

  parts.push(path.call(print, "body"));
  return parts;
}

function printOptionalToken(path) {
  var node = path.getValue();

  if (!node.optional) {
    return "";
  }

  if (node.type === "OptionalCallExpression" || node.type === "OptionalMemberExpression" && node.computed) {
    return "?.";
  }

  return "?";
}

function printMemberLookup(path, options, print) {
  var property = path.call(print, "property");
  var n = path.getValue();
  var optional = printOptionalToken(path);

  if (!n.computed) {
    return concat$4([optional, ".", property]);
  }

  if (!n.property || isNumericLiteral(n.property)) {
    return concat$4([optional, "[", property, "]"]);
  }

  return group$1(concat$4([optional, "[", indent$2(concat$4([softline$1, property])), softline$1, "]"]));
}

function printBindExpressionCallee(path, options, print) {
  return concat$4(["::", path.call(print, "callee")]);
} // We detect calls on member expressions specially to format a
// common pattern better. The pattern we are looking for is this:
//
// arr
//   .map(x => x + 1)
//   .filter(x => x > 10)
//   .some(x => x % 2)
//
// The way it is structured in the AST is via a nested sequence of
// MemberExpression and CallExpression. We need to traverse the AST
// and make groups out of it to print it in the desired way.


function printMemberChain(path, options, print) {
  // The first phase is to linearize the AST by traversing it down.
  //
  //   a().b()
  // has the following AST structure:
  //   CallExpression(MemberExpression(CallExpression(Identifier)))
  // and we transform it into
  //   [Identifier, CallExpression, MemberExpression, CallExpression]
  var printedNodes = []; // Here we try to retain one typed empty line after each call expression or
  // the first group whether it is in parentheses or not

  function shouldInsertEmptyLineAfter(node) {
    var originalText = options.originalText;
    var nextCharIndex = getNextNonSpaceNonCommentCharacterIndex$2(originalText, node, options);
    var nextChar = originalText.charAt(nextCharIndex); // if it is cut off by a parenthesis, we only account for one typed empty
    // line after that parenthesis

    if (nextChar == ")") {
      return isNextLineEmptyAfterIndex$1(originalText, nextCharIndex + 1, options);
    }

    return isNextLineEmpty$2(originalText, node, options);
  }

  function rec(path) {
    var node = path.getValue();

    if ((node.type === "CallExpression" || node.type === "OptionalCallExpression") && (isMemberish(node.callee) || node.callee.type === "CallExpression" || node.callee.type === "OptionalCallExpression")) {
      printedNodes.unshift({
        node: node,
        printed: concat$4([comments.printComments(path, function () {
          return concat$4([printOptionalToken(path), printFunctionTypeParameters(path, options, print), printArgumentsList(path, options, print)]);
        }, options), shouldInsertEmptyLineAfter(node) ? hardline$3 : ""])
      });
      path.call(function (callee) {
        return rec(callee);
      }, "callee");
    } else if (isMemberish(node)) {
      printedNodes.unshift({
        node: node,
        needsParens: needsParens_1(path, options),
        printed: comments.printComments(path, function () {
          return node.type === "OptionalMemberExpression" || node.type === "MemberExpression" ? printMemberLookup(path, options, print) : printBindExpressionCallee(path, options, print);
        }, options)
      });
      path.call(function (object) {
        return rec(object);
      }, "object");
    } else if (node.type === "TSNonNullExpression") {
      printedNodes.unshift({
        node: node,
        printed: comments.printComments(path, function () {
          return "!";
        }, options)
      });
      path.call(function (expression) {
        return rec(expression);
      }, "expression");
    } else {
      printedNodes.unshift({
        node: node,
        printed: path.call(print)
      });
    }
  } // Note: the comments of the root node have already been printed, so we
  // need to extract this first call without printing them as they would
  // if handled inside of the recursive call.


  var node = path.getValue();
  printedNodes.unshift({
    node: node,
    printed: concat$4([printOptionalToken(path), printFunctionTypeParameters(path, options, print), printArgumentsList(path, options, print)])
  });
  path.call(function (callee) {
    return rec(callee);
  }, "callee"); // Once we have a linear list of printed nodes, we want to create groups out
  // of it.
  //
  //   a().b.c().d().e
  // will be grouped as
  //   [
  //     [Identifier, CallExpression],
  //     [MemberExpression, MemberExpression, CallExpression],
  //     [MemberExpression, CallExpression],
  //     [MemberExpression],
  //   ]
  // so that we can print it as
  //   a()
  //     .b.c()
  //     .d()
  //     .e
  // The first group is the first node followed by
  //   - as many CallExpression as possible
  //       < fn()()() >.something()
  //   - as many array acessors as possible
  //       < fn()[0][1][2] >.something()
  //   - then, as many MemberExpression as possible but the last one
  //       < this.items >.something()

  var groups = [];
  var currentGroup = [printedNodes[0]];
  var i = 1;

  for (; i < printedNodes.length; ++i) {
    if (printedNodes[i].node.type === "TSNonNullExpression" || printedNodes[i].node.type === "OptionalCallExpression" || printedNodes[i].node.type === "CallExpression" || (printedNodes[i].node.type === "MemberExpression" || printedNodes[i].node.type === "OptionalMemberExpression") && printedNodes[i].node.computed && isNumericLiteral(printedNodes[i].node.property)) {
      currentGroup.push(printedNodes[i]);
    } else {
      break;
    }
  }

  if (printedNodes[0].node.type !== "CallExpression" && printedNodes[0].node.type !== "OptionalCallExpression") {
    for (; i + 1 < printedNodes.length; ++i) {
      if (isMemberish(printedNodes[i].node) && isMemberish(printedNodes[i + 1].node)) {
        currentGroup.push(printedNodes[i]);
      } else {
        break;
      }
    }
  }

  groups.push(currentGroup);
  currentGroup = []; // Then, each following group is a sequence of MemberExpression followed by
  // a sequence of CallExpression. To compute it, we keep adding things to the
  // group until we has seen a CallExpression in the past and reach a
  // MemberExpression

  var hasSeenCallExpression = false;

  for (; i < printedNodes.length; ++i) {
    if (hasSeenCallExpression && isMemberish(printedNodes[i].node)) {
      // [0] should be appended at the end of the group instead of the
      // beginning of the next one
      if (printedNodes[i].node.computed && isNumericLiteral(printedNodes[i].node.property)) {
        currentGroup.push(printedNodes[i]);
        continue;
      }

      groups.push(currentGroup);
      currentGroup = [];
      hasSeenCallExpression = false;
    }

    if (printedNodes[i].node.type === "CallExpression" || printedNodes[i].node.type === "OptionalCallExpression") {
      hasSeenCallExpression = true;
    }

    currentGroup.push(printedNodes[i]);

    if (printedNodes[i].node.comments && printedNodes[i].node.comments.some(function (comment) {
      return comment.trailing;
    })) {
      groups.push(currentGroup);
      currentGroup = [];
      hasSeenCallExpression = false;
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  } // There are cases like Object.keys(), Observable.of(), _.values() where
  // they are the subject of all the chained calls and therefore should
  // be kept on the same line:
  //
  //   Object.keys(items)
  //     .filter(x => x)
  //     .map(x => x)
  //
  // In order to detect those cases, we use an heuristic: if the first
  // node is an identifier with the name starting with a capital
  // letter or just a sequence of _$. The rationale is that they are
  // likely to be factories.


  function isFactory(name) {
    return /^[A-Z]|^[_$]+$/.test(name);
  } // In case the Identifier is shorter than tab width, we can keep the
  // first call in a single line, if it's an ExpressionStatement.
  //
  //   d3.scaleLinear()
  //     .domain([0, 100])
  //     .range([0, width]);
  //


  function isShort(name) {
    return name.length <= options.tabWidth;
  }

  function shouldNotWrap(groups) {
    var parent = path.getParentNode();
    var isExpression = parent && parent.type === "ExpressionStatement";
    var hasComputed = groups[1].length && groups[1][0].node.computed;

    if (groups[0].length === 1) {
      var firstNode = groups[0][0].node;
      return firstNode.type === "ThisExpression" || firstNode.type === "Identifier" && (isFactory(firstNode.name) || isExpression && isShort(firstNode.name) || hasComputed);
    }

    var lastNode = getLast$4(groups[0]).node;
    return (lastNode.type === "MemberExpression" || lastNode.type === "OptionalMemberExpression") && lastNode.property.type === "Identifier" && (isFactory(lastNode.property.name) || hasComputed);
  }

  var shouldMerge = groups.length >= 2 && !groups[1][0].node.comments && shouldNotWrap(groups);

  function printGroup(printedGroup) {
    var result = [];

    for (var _i3 = 0; _i3 < printedGroup.length; _i3++) {
      // Checks if the next node (i.e. the parent node) needs parens
      // and print accordingl y
      if (printedGroup[_i3 + 1] && printedGroup[_i3 + 1].needsParens) {
        result.push("(", printedGroup[_i3].printed, printedGroup[_i3 + 1].printed, ")");
        _i3++;
      } else {
        result.push(printedGroup[_i3].printed);
      }
    }

    return concat$4(result);
  }

  function printIndentedGroup(groups) {
    if (groups.length === 0) {
      return "";
    }

    return indent$2(group$1(concat$4([hardline$3, join$2(hardline$3, groups.map(printGroup))])));
  }

  var printedGroups = groups.map(printGroup);
  var oneLine = concat$4(printedGroups);
  var cutoff = shouldMerge ? 3 : 2;
  var flatGroups = groups.slice(0, cutoff).reduce(function (res, group) {
    return res.concat(group);
  }, []);
  var hasComment = flatGroups.slice(1, -1).some(function (node) {
    return hasLeadingComment(node.node);
  }) || flatGroups.slice(0, -1).some(function (node) {
    return hasTrailingComment(node.node);
  }) || groups[cutoff] && hasLeadingComment(groups[cutoff][0].node); // If we only have a single `.`, we shouldn't do anything fancy and just
  // render everything concatenated together.

  if (groups.length <= cutoff && !hasComment) {
    return group$1(oneLine);
  } // Find out the last node in the first group and check if it has an
  // empty line after


  var lastNodeBeforeIndent = getLast$4(shouldMerge ? groups.slice(1, 2)[0] : groups[0]).node;
  var shouldHaveEmptyLineBeforeIndent = lastNodeBeforeIndent.type !== "CallExpression" && lastNodeBeforeIndent.type !== "OptionalCallExpression" && shouldInsertEmptyLineAfter(lastNodeBeforeIndent);
  var expanded = concat$4([printGroup(groups[0]), shouldMerge ? concat$4(groups.slice(1, 2).map(printGroup)) : "", shouldHaveEmptyLineBeforeIndent ? hardline$3 : "", printIndentedGroup(groups.slice(shouldMerge ? 2 : 1))]);
  var callExpressionCount = printedNodes.filter(function (tuple) {
    return tuple.node.type === "CallExpression" || tuple.node.type === "OptionalCallExpression";
  }).length; // We don't want to print in one line if there's:
  //  * A comment.
  //  * 3 or more chained calls.
  //  * Any group but the last one has a hard line.
  // If the last group is a function it's okay to inline if it fits.

  if (hasComment || callExpressionCount >= 3 || printedGroups.slice(0, -1).some(willBreak$1)) {
    return group$1(expanded);
  }

  return concat$4([// We only need to check `oneLine` because if `expanded` is chosen
  // that means that the parent group has already been broken
  // naturally
  willBreak$1(oneLine) || shouldHaveEmptyLineBeforeIndent ? breakParent$2 : "", conditionalGroup$1([oneLine, expanded])]);
}

function isJSXNode(node) {
  return node.type === "JSXElement" || node.type === "JSXFragment" || node.type === "TSJsxFragment";
}

function isEmptyJSXElement(node) {
  if (node.children.length === 0) {
    return true;
  }

  if (node.children.length > 1) {
    return false;
  } // if there is one text child and does not contain any meaningful text
  // we can treat the element as empty.


  var child = node.children[0];
  return isLiteral(child) && !isMeaningfulJSXText(child);
} // Only space, newline, carriage return, and tab are treated as whitespace
// inside JSX.


var jsxWhitespaceChars = " \n\r\t";
var containsNonJsxWhitespaceRegex = new RegExp("[^" + jsxWhitespaceChars + "]");
var matchJsxWhitespaceRegex = new RegExp("([" + jsxWhitespaceChars + "]+)"); // Meaningful if it contains non-whitespace characters,
// or it contains whitespace without a new line.

function isMeaningfulJSXText(node) {
  return isLiteral(node) && (containsNonJsxWhitespaceRegex.test(rawText(node)) || !/\n/.test(rawText(node)));
}

function conditionalExpressionChainContainsJSX(node) {
  return Boolean(getConditionalChainContents(node).find(isJSXNode));
} // If we have nested conditional expressions, we want to print them in JSX mode
// if there's at least one JSXElement somewhere in the tree.
//
// A conditional expression chain like this should be printed in normal mode,
// because there aren't JSXElements anywhere in it:
//
// isA ? "A" : isB ? "B" : isC ? "C" : "Unknown";
//
// But a conditional expression chain like this should be printed in JSX mode,
// because there is a JSXElement in the last ConditionalExpression:
//
// isA ? "A" : isB ? "B" : isC ? "C" : <span className="warning">Unknown</span>;
//
// This type of ConditionalExpression chain is structured like this in the AST:
//
// ConditionalExpression {
//   test: ...,
//   consequent: ...,
//   alternate: ConditionalExpression {
//     test: ...,
//     consequent: ...,
//     alternate: ConditionalExpression {
//       test: ...,
//       consequent: ...,
//       alternate: ...,
//     }
//   }
// }
//
// We want to traverse over that shape and convert it into a flat structure so
// that we can find if there's a JSXElement somewhere inside.


function getConditionalChainContents(node) {
  // Given this code:
  //
  // // Using a ConditionalExpression as the consequent is uncommon, but should
  // // be handled.
  // A ? B : C ? D : E ? F ? G : H : I
  //
  // which has this AST:
  //
  // ConditionalExpression {
  //   test: Identifier(A),
  //   consequent: Identifier(B),
  //   alternate: ConditionalExpression {
  //     test: Identifier(C),
  //     consequent: Identifier(D),
  //     alternate: ConditionalExpression {
  //       test: Identifier(E),
  //       consequent: ConditionalExpression {
  //         test: Identifier(F),
  //         consequent: Identifier(G),
  //         alternate: Identifier(H),
  //       },
  //       alternate: Identifier(I),
  //     }
  //   }
  // }
  //
  // we should return this Array:
  //
  // [
  //   Identifier(A),
  //   Identifier(B),
  //   Identifier(C),
  //   Identifier(D),
  //   Identifier(E),
  //   Identifier(F),
  //   Identifier(G),
  //   Identifier(H),
  //   Identifier(I)
  // ];
  //
  // This loses the information about whether each node was the test,
  // consequent, or alternate, but we don't care about that here- we are only
  // flattening this structure to find if there's any JSXElements inside.
  var nonConditionalExpressions = [];

  function recurse(node) {
    if (node.type === "ConditionalExpression") {
      recurse(node.test);
      recurse(node.consequent);
      recurse(node.alternate);
    } else {
      nonConditionalExpressions.push(node);
    }
  }

  recurse(node);
  return nonConditionalExpressions;
} // Detect an expression node representing `{" "}`


function isJSXWhitespaceExpression(node) {
  return node.type === "JSXExpressionContainer" && isLiteral(node.expression) && node.expression.value === " " && !node.expression.comments;
}

function separatorNoWhitespace(isFacebookTranslationTag, child) {
  if (isFacebookTranslationTag) {
    return "";
  }

  if (child.length === 1) {
    return softline$1;
  }

  return hardline$3;
}

function separatorWithWhitespace(isFacebookTranslationTag, child) {
  if (isFacebookTranslationTag) {
    return hardline$3;
  }

  if (child.length === 1) {
    return softline$1;
  }

  return hardline$3;
} // JSX Children are strange, mostly for two reasons:
// 1. JSX reads newlines into string values, instead of skipping them like JS
// 2. up to one whitespace between elements within a line is significant,
//    but not between lines.
//
// Leading, trailing, and lone whitespace all need to
// turn themselves into the rather ugly `{' '}` when breaking.
//
// We print JSX using the `fill` doc primitive.
// This requires that we give it an array of alternating
// content and whitespace elements.
// To ensure this we add dummy `""` content elements as needed.


function printJSXChildren(path, options, print, jsxWhitespace, isFacebookTranslationTag) {
  var n = path.getValue();
  var children = []; // using `map` instead of `each` because it provides `i`

  path.map(function (childPath, i) {
    var child = childPath.getValue();

    if (isLiteral(child)) {
      var text = rawText(child); // Contains a non-whitespace character

      if (isMeaningfulJSXText(child)) {
        var words = text.split(matchJsxWhitespaceRegex); // Starts with whitespace

        if (words[0] === "") {
          children.push("");
          words.shift();

          if (/\n/.test(words[0])) {
            children.push(separatorWithWhitespace(isFacebookTranslationTag, words[1]));
          } else {
            children.push(jsxWhitespace);
          }

          words.shift();
        }

        var endWhitespace; // Ends with whitespace

        if (getLast$4(words) === "") {
          words.pop();
          endWhitespace = words.pop();
        } // This was whitespace only without a new line.


        if (words.length === 0) {
          return;
        }

        words.forEach(function (word, i) {
          if (i % 2 === 1) {
            children.push(line$3);
          } else {
            children.push(word);
          }
        });

        if (endWhitespace !== undefined) {
          if (/\n/.test(endWhitespace)) {
            children.push(separatorWithWhitespace(isFacebookTranslationTag, getLast$4(children)));
          } else {
            children.push(jsxWhitespace);
          }
        } else {
          children.push(separatorNoWhitespace(isFacebookTranslationTag, getLast$4(children)));
        }
      } else if (/\n/.test(text)) {
        // Keep (up to one) blank line between tags/expressions/text.
        // Note: We don't keep blank lines between text elements.
        if (text.match(/\n/g).length > 1) {
          children.push("");
          children.push(hardline$3);
        }
      } else {
        children.push("");
        children.push(jsxWhitespace);
      }
    } else {
      var printedChild = print(childPath);
      children.push(printedChild);
      var next = n.children[i + 1];
      var directlyFollowedByMeaningfulText = next && isMeaningfulJSXText(next);

      if (directlyFollowedByMeaningfulText) {
        var firstWord = rawText(next).trim().split(matchJsxWhitespaceRegex)[0];
        children.push(separatorNoWhitespace(isFacebookTranslationTag, firstWord));
      } else {
        children.push(hardline$3);
      }
    }
  }, "children");
  return children;
} // JSX expands children from the inside-out, instead of the outside-in.
// This is both to break children before attributes,
// and to ensure that when children break, their parents do as well.
//
// Any element that is written without any newlines and fits on a single line
// is left that way.
// Not only that, any user-written-line containing multiple JSX siblings
// should also be kept on one line if possible,
// so each user-written-line is wrapped in its own group.
//
// Elements that contain newlines or don't fit on a single line (recursively)
// are fully-split, using hardline and shouldBreak: true.
//
// To support that case properly, all leading and trailing spaces
// are stripped from the list of children, and replaced with a single hardline.


function printJSXElement(path, options, print) {
  var n = path.getValue(); // Turn <div></div> into <div />

  if (n.type === "JSXElement" && isEmptyJSXElement(n)) {
    n.openingElement.selfClosing = true;
    return path.call(print, "openingElement");
  }

  var openingLines = n.type === "JSXElement" ? path.call(print, "openingElement") : path.call(print, "openingFragment");
  var closingLines = n.type === "JSXElement" ? path.call(print, "closingElement") : path.call(print, "closingFragment");

  if (n.children.length === 1 && n.children[0].type === "JSXExpressionContainer" && (n.children[0].expression.type === "TemplateLiteral" || n.children[0].expression.type === "TaggedTemplateExpression")) {
    return concat$4([openingLines, concat$4(path.map(print, "children")), closingLines]);
  } // Convert `{" "}` to text nodes containing a space.
  // This makes it easy to turn them into `jsxWhitespace` which
  // can then print as either a space or `{" "}` when breaking.


  n.children = n.children.map(function (child) {
    if (isJSXWhitespaceExpression(child)) {
      return {
        type: "JSXText",
        value: " ",
        raw: " "
      };
    }

    return child;
  });
  var containsTag = n.children.filter(isJSXNode).length > 0;
  var containsMultipleExpressions = n.children.filter(function (child) {
    return child.type === "JSXExpressionContainer";
  }).length > 1;
  var containsMultipleAttributes = n.type === "JSXElement" && n.openingElement.attributes.length > 1; // Record any breaks. Should never go from true to false, only false to true.

  var forcedBreak = willBreak$1(openingLines) || containsTag || containsMultipleAttributes || containsMultipleExpressions;
  var rawJsxWhitespace = options.singleQuote ? "{' '}" : '{" "}';
  var jsxWhitespace = ifBreak$1(concat$4([rawJsxWhitespace, softline$1]), " ");
  var isFacebookTranslationTag = n.openingElement && n.openingElement.name && n.openingElement.name.name === "fbt";
  var children = printJSXChildren(path, options, print, jsxWhitespace, isFacebookTranslationTag);
  var containsText = n.children.filter(function (child) {
    return isMeaningfulJSXText(child);
  }).length > 0; // We can end up we multiple whitespace elements with empty string
  // content between them.
  // We need to remove empty whitespace and softlines before JSX whitespace
  // to get the correct output.

  for (var i = children.length - 2; i >= 0; i--) {
    var isPairOfEmptyStrings = children[i] === "" && children[i + 1] === "";
    var isPairOfHardlines = children[i] === hardline$3 && children[i + 1] === "" && children[i + 2] === hardline$3;
    var isLineFollowedByJSXWhitespace = (children[i] === softline$1 || children[i] === hardline$3) && children[i + 1] === "" && children[i + 2] === jsxWhitespace;
    var isJSXWhitespaceFollowedByLine = children[i] === jsxWhitespace && children[i + 1] === "" && (children[i + 2] === softline$1 || children[i + 2] === hardline$3);
    var isDoubleJSXWhitespace = children[i] === jsxWhitespace && children[i + 1] === "" && children[i + 2] === jsxWhitespace;

    if (isPairOfHardlines && containsText || isPairOfEmptyStrings || isLineFollowedByJSXWhitespace || isDoubleJSXWhitespace) {
      children.splice(i, 2);
    } else if (isJSXWhitespaceFollowedByLine) {
      children.splice(i + 1, 2);
    }
  } // Trim trailing lines (or empty strings)


  while (children.length && (isLineNext$1(getLast$4(children)) || isEmpty$1(getLast$4(children)))) {
    children.pop();
  } // Trim leading lines (or empty strings)


  while (children.length && (isLineNext$1(children[0]) || isEmpty$1(children[0])) && (isLineNext$1(children[1]) || isEmpty$1(children[1]))) {
    children.shift();
    children.shift();
  } // Tweak how we format children if outputting this element over multiple lines.
  // Also detect whether we will force this element to output over multiple lines.


  var multilineChildren = [];
  children.forEach(function (child, i) {
    // There are a number of situations where we need to ensure we display
    // whitespace as `{" "}` when outputting this element over multiple lines.
    if (child === jsxWhitespace) {
      if (i === 1 && children[i - 1] === "") {
        if (children.length === 2) {
          // Solitary whitespace
          multilineChildren.push(rawJsxWhitespace);
          return;
        } // Leading whitespace


        multilineChildren.push(concat$4([rawJsxWhitespace, hardline$3]));
        return;
      } else if (i === children.length - 1) {
        // Trailing whitespace
        multilineChildren.push(rawJsxWhitespace);
        return;
      } else if (children[i - 1] === "" && children[i - 2] === hardline$3) {
        // Whitespace after line break
        multilineChildren.push(rawJsxWhitespace);
        return;
      }
    }

    multilineChildren.push(child);

    if (willBreak$1(child)) {
      forcedBreak = true;
    }
  }); // If there is text we use `fill` to fit as much onto each line as possible.
  // When there is no text (just tags and expressions) we use `group`
  // to output each on a separate line.

  var content = containsText ? fill$2(multilineChildren) : group$1(concat$4(multilineChildren), {
    shouldBreak: true
  });
  var multiLineElem = group$1(concat$4([openingLines, indent$2(concat$4([hardline$3, content])), hardline$3, closingLines]));

  if (forcedBreak) {
    return multiLineElem;
  }

  return conditionalGroup$1([group$1(concat$4([openingLines, concat$4(children), closingLines])), multiLineElem]);
}

function maybeWrapJSXElementInParens(path, elem) {
  var parent = path.getParentNode();

  if (!parent) {
    return elem;
  }

  var NO_WRAP_PARENTS = {
    ArrayExpression: true,
    JSXAttribute: true,
    JSXElement: true,
    JSXExpressionContainer: true,
    JSXFragment: true,
    TSJsxFragment: true,
    ExpressionStatement: true,
    CallExpression: true,
    OptionalCallExpression: true,
    ConditionalExpression: true
  };

  if (NO_WRAP_PARENTS[parent.type]) {
    return elem;
  }

  var shouldBreak = matchAncestorTypes$1(path, ["ArrowFunctionExpression", "CallExpression", "JSXExpressionContainer"]);
  return group$1(concat$4([ifBreak$1("("), indent$2(concat$4([softline$1, elem])), softline$1, ifBreak$1(")")]), {
    shouldBreak: shouldBreak
  });
}

function isBinaryish(node) {
  return node.type === "BinaryExpression" || node.type === "LogicalExpression";
}

function isMemberish(node) {
  return node.type === "MemberExpression" || node.type === "OptionalMemberExpression" || node.type === "BindExpression" && node.object;
}

function shouldInlineLogicalExpression(node) {
  if (node.type !== "LogicalExpression") {
    return false;
  }

  if (node.right.type === "ObjectExpression" && node.right.properties.length !== 0) {
    return true;
  }

  if (node.right.type === "ArrayExpression" && node.right.elements.length !== 0) {
    return true;
  }

  if (isJSXNode(node.right)) {
    return true;
  }

  return false;
} // For binary expressions to be consistent, we need to group
// subsequent operators with the same precedence level under a single
// group. Otherwise they will be nested such that some of them break
// onto new lines but not all. Operators with the same precedence
// level should either all break or not. Because we group them by
// precedence level and the AST is structured based on precedence
// level, things are naturally broken up correctly, i.e. `&&` is
// broken before `+`.


function printBinaryishExpressions(path, print, options, isNested, isInsideParenthesis) {
  var parts = [];
  var node = path.getValue(); // We treat BinaryExpression and LogicalExpression nodes the same.

  if (isBinaryish(node)) {
    // Put all operators with the same precedence level in the same
    // group. The reason we only need to do this with the `left`
    // expression is because given an expression like `1 + 2 - 3`, it
    // is always parsed like `((1 + 2) - 3)`, meaning the `left` side
    // is where the rest of the expression will exist. Binary
    // expressions on the right side mean they have a difference
    // precedence level and should be treated as a separate group, so
    // print them normally. (This doesn't hold for the `**` operator,
    // which is unique in that it is right-associative.)
    if (shouldFlatten$1(node.operator, node.left.operator)) {
      // Flatten them out by recursively calling this function.
      parts = parts.concat(path.call(function (left) {
        return printBinaryishExpressions(left, print, options,
        /* isNested */
        true, isInsideParenthesis);
      }, "left"));
    } else {
      parts.push(path.call(print, "left"));
    }

    var shouldInline = shouldInlineLogicalExpression(node);
    var lineBeforeOperator = node.operator === "|>";
    var right = shouldInline ? concat$4([node.operator, " ", path.call(print, "right")]) : concat$4([lineBeforeOperator ? softline$1 : "", node.operator, lineBeforeOperator ? " " : line$3, path.call(print, "right")]); // If there's only a single binary expression, we want to create a group
    // in order to avoid having a small right part like -1 be on its own line.

    var parent = path.getParentNode();
    var shouldGroup = !(isInsideParenthesis && node.type === "LogicalExpression") && parent.type !== node.type && node.left.type !== node.type && node.right.type !== node.type;
    parts.push(" ", shouldGroup ? group$1(right) : right); // The root comments are already printed, but we need to manually print
    // the other ones since we don't call the normal print on BinaryExpression,
    // only for the left and right parts

    if (isNested && node.comments) {
      parts = comments.printComments(path, function () {
        return concat$4(parts);
      }, options);
    }
  } else {
    // Our stopping case. Simply print the node normally.
    parts.push(path.call(print));
  }

  return parts;
}

function printAssignmentRight(leftNode, rightNode, printedRight, options) {
  if (hasLeadingOwnLineComment(options.originalText, rightNode, options)) {
    return indent$2(concat$4([hardline$3, printedRight]));
  }

  var canBreak = isBinaryish(rightNode) && !shouldInlineLogicalExpression(rightNode) || rightNode.type === "ConditionalExpression" && isBinaryish(rightNode.test) && !shouldInlineLogicalExpression(rightNode.test) || rightNode.type === "StringLiteralTypeAnnotation" || (leftNode.type === "Identifier" || isStringLiteral(leftNode) || leftNode.type === "MemberExpression") && (isStringLiteral(rightNode) || isMemberExpressionChain(rightNode)) && // do not put values on a separate line from the key in json
  options.parser !== "json" && options.parser !== "json5";

  if (canBreak) {
    return group$1(indent$2(concat$4([line$3, printedRight])));
  }

  return concat$4([" ", printedRight]);
}

function printAssignment(leftNode, printedLeft, operator, rightNode, printedRight, options) {
  if (!rightNode) {
    return printedLeft;
  }

  var printed = printAssignmentRight(leftNode, rightNode, printedRight, options);
  return group$1(concat$4([printedLeft, operator, printed]));
}

function adjustClause(node, clause, forceSpace) {
  if (node.type === "EmptyStatement") {
    return ";";
  }

  if (node.type === "BlockStatement" || forceSpace) {
    return concat$4([" ", clause]);
  }

  return indent$2(concat$4([line$3, clause]));
}

function nodeStr(node, options, isFlowOrTypeScriptDirectiveLiteral) {
  var raw = rawText(node);
  var isDirectiveLiteral = isFlowOrTypeScriptDirectiveLiteral || node.type === "DirectiveLiteral";
  return printString$1(raw, options, isDirectiveLiteral);
}

function printRegex(node) {
  var flags = node.flags.split("").sort().join("");
  return "/".concat(node.pattern, "/").concat(flags);
}

function isLastStatement(path) {
  var parent = path.getParentNode();

  if (!parent) {
    return true;
  }

  var node = path.getValue();
  var body = (parent.body || parent.consequent).filter(function (stmt) {
    return stmt.type !== "EmptyStatement";
  });
  return body && body[body.length - 1] === node;
}

function hasLeadingComment(node) {
  return node.comments && node.comments.some(function (comment) {
    return comment.leading;
  });
}

function hasTrailingComment(node) {
  return node.comments && node.comments.some(function (comment) {
    return comment.trailing;
  });
}

function hasLeadingOwnLineComment(text, node, options) {
  if (isJSXNode(node)) {
    return hasNodeIgnoreComment$1(node);
  }

  var res = node.comments && node.comments.some(function (comment) {
    return comment.leading && hasNewline$2(text, options.locEnd(comment));
  });
  return res;
}

function hasNakedLeftSide(node) {
  return node.type === "AssignmentExpression" || node.type === "BinaryExpression" || node.type === "LogicalExpression" || node.type === "ConditionalExpression" || node.type === "CallExpression" || node.type === "OptionalCallExpression" || node.type === "MemberExpression" || node.type === "OptionalMemberExpression" || node.type === "SequenceExpression" || node.type === "TaggedTemplateExpression" || node.type === "BindExpression" && !node.object || node.type === "UpdateExpression" && !node.prefix;
}

function isFlowAnnotationComment(text, typeAnnotation, options) {
  var start = options.locStart(typeAnnotation);
  var end = skipWhitespace$1(text, options.locEnd(typeAnnotation));
  return text.substr(start, 2) === "/*" && text.substr(end, 2) === "*/";
}

function getLeftSide(node) {
  if (node.expressions) {
    return node.expressions[0];
  }

  return node.left || node.test || node.callee || node.object || node.tag || node.argument || node.expression;
}

function getLeftSidePathName(path, node) {
  if (node.expressions) {
    return ["expressions", 0];
  }

  if (node.left) {
    return ["left"];
  }

  if (node.test) {
    return ["test"];
  }

  if (node.callee) {
    return ["callee"];
  }

  if (node.object) {
    return ["object"];
  }

  if (node.tag) {
    return ["tag"];
  }

  if (node.argument) {
    return ["argument"];
  }

  if (node.expression) {
    return ["expression"];
  }

  throw new Error("Unexpected node has no left side", node);
}

function exprNeedsASIProtection(path, options) {
  var node = path.getValue();
  var maybeASIProblem = needsParens_1(path, options) || node.type === "ParenthesizedExpression" || node.type === "TypeCastExpression" || node.type === "ArrowFunctionExpression" && !shouldPrintParamsWithoutParens(path, options) || node.type === "ArrayExpression" || node.type === "ArrayPattern" || node.type === "UnaryExpression" && node.prefix && (node.operator === "+" || node.operator === "-") || node.type === "TemplateLiteral" || node.type === "TemplateElement" || isJSXNode(node) || node.type === "BindExpression" || node.type === "RegExpLiteral" || node.type === "Literal" && node.pattern || node.type === "Literal" && node.regex;

  if (maybeASIProblem) {
    return true;
  }

  if (!hasNakedLeftSide(node)) {
    return false;
  }

  return path.call.apply(path, [function (childPath) {
    return exprNeedsASIProtection(childPath, options);
  }].concat(getLeftSidePathName(path, node)));
}

function stmtNeedsASIProtection(path, options) {
  var node = path.getNode();

  if (node.type !== "ExpressionStatement") {
    return false;
  }

  return path.call(function (childPath) {
    return exprNeedsASIProtection(childPath, options);
  }, "expression");
}

function classPropMayCauseASIProblems(path) {
  var node = path.getNode();

  if (node.type !== "ClassProperty") {
    return false;
  }

  var name = node.key && node.key.name; // this isn't actually possible yet with most parsers available today
  // so isn't properly tested yet.

  if ((name === "static" || name === "get" || name === "set") && !node.value && !node.typeAnnotation) {
    return true;
  }
}

function classChildNeedsASIProtection(node) {
  if (!node) {
    return;
  }

  if (!node.computed) {
    var name = node.key && node.key.name;

    if (name === "in" || name === "instanceof") {
      return true;
    }
  }

  switch (node.type) {
    case "ClassProperty":
    case "TSAbstractClassProperty":
      return node.computed;

    case "MethodDefinition": // Flow

    case "TSAbstractMethodDefinition": // TypeScript

    case "ClassMethod":
      {
        // Babylon
        var isAsync = node.value ? node.value.async : node.async;
        var isGenerator = node.value ? node.value.generator : node.generator;

        if (isAsync || node.static || node.kind === "get" || node.kind === "set") {
          return false;
        }

        if (node.computed || isGenerator) {
          return true;
        }

        return false;
      }

    default:
      /* istanbul ignore next */
      return false;
  }
} // This recurses the return argument, looking for the first token
// (the leftmost leaf node) and, if it (or its parents) has any
// leadingComments, returns true (so it can be wrapped in parens).


function returnArgumentHasLeadingComment(options, argument) {
  if (hasLeadingOwnLineComment(options.originalText, argument, options)) {
    return true;
  }

  if (hasNakedLeftSide(argument)) {
    var leftMost = argument;
    var newLeftMost;

    while (newLeftMost = getLeftSide(leftMost)) {
      leftMost = newLeftMost;

      if (hasLeadingOwnLineComment(options.originalText, leftMost, options)) {
        return true;
      }
    }
  }

  return false;
}

function isMemberExpressionChain(node) {
  if (node.type !== "MemberExpression" && node.type !== "OptionalMemberExpression") {
    return false;
  }

  if (node.object.type === "Identifier") {
    return true;
  }

  return isMemberExpressionChain(node.object);
} // Hack to differentiate between the following two which have the same ast
// type T = { method: () => void };
// type T = { method(): void };


function isObjectTypePropertyAFunction(node, options) {
  return (node.type === "ObjectTypeProperty" || node.type === "ObjectTypeInternalSlot") && node.value.type === "FunctionTypeAnnotation" && !node.static && !isFunctionNotation(node, options);
} // TODO: This is a bad hack and we need a better way to distinguish between
// arrow functions and otherwise


function isFunctionNotation(node, options) {
  return isGetterOrSetter(node) || sameLocStart(node, node.value, options);
}

function isGetterOrSetter(node) {
  return node.kind === "get" || node.kind === "set";
}

function sameLocStart(nodeA, nodeB, options) {
  return options.locStart(nodeA) === options.locStart(nodeB);
} // Hack to differentiate between the following two which have the same ast
// declare function f(a): void;
// var f: (a) => void;


function isTypeAnnotationAFunction(node, options) {
  return (node.type === "TypeAnnotation" || node.type === "TSTypeAnnotation") && node.typeAnnotation.type === "FunctionTypeAnnotation" && !node.static && !sameLocStart(node, node.typeAnnotation, options);
}

function isNodeStartingWithDeclare(node, options) {
  if (!(options.parser === "flow" || options.parser === "typescript")) {
    return false;
  }

  return options.originalText.slice(0, options.locStart(node)).match(/declare[ \t]*$/) || options.originalText.slice(node.range[0], node.range[1]).startsWith("declare ");
}

function shouldHugType(node) {
  if (isObjectType(node)) {
    return true;
  }

  if (node.type === "UnionTypeAnnotation" || node.type === "TSUnionType") {
    var voidCount = node.types.filter(function (n) {
      return n.type === "VoidTypeAnnotation" || n.type === "TSVoidKeyword" || n.type === "NullLiteralTypeAnnotation" || n.type === "TSNullKeyword";
    }).length;
    var objectCount = node.types.filter(function (n) {
      return n.type === "ObjectTypeAnnotation" || n.type === "TSTypeLiteral" || // This is a bit aggressive but captures Array<{x}>
      n.type === "GenericTypeAnnotation" || n.type === "TSTypeReference";
    }).length;

    if (node.types.length - 1 === voidCount && objectCount > 0) {
      return true;
    }
  }

  return false;
}

function shouldHugArguments(fun) {
  return fun && fun.params && fun.params.length === 1 && !fun.params[0].comments && (fun.params[0].type === "ObjectPattern" || fun.params[0].type === "ArrayPattern" || fun.params[0].type === "Identifier" && fun.params[0].typeAnnotation && (fun.params[0].typeAnnotation.type === "TypeAnnotation" || fun.params[0].typeAnnotation.type === "TSTypeAnnotation") && isObjectType(fun.params[0].typeAnnotation.typeAnnotation) || fun.params[0].type === "FunctionTypeParam" && isObjectType(fun.params[0].typeAnnotation) || fun.params[0].type === "AssignmentPattern" && (fun.params[0].left.type === "ObjectPattern" || fun.params[0].left.type === "ArrayPattern") && (fun.params[0].right.type === "Identifier" || fun.params[0].right.type === "ObjectExpression" && fun.params[0].right.properties.length === 0 || fun.params[0].right.type === "ArrayExpression" && fun.params[0].right.elements.length === 0)) && !fun.rest;
}

function templateLiteralHasNewLines(template) {
  return template.quasis.some(function (quasi) {
    return quasi.value.raw.includes("\n");
  });
}

function isTemplateOnItsOwnLine(n, text, options) {
  return (n.type === "TemplateLiteral" && templateLiteralHasNewLines(n) || n.type === "TaggedTemplateExpression" && templateLiteralHasNewLines(n.quasi)) && !hasNewline$2(text, options.locStart(n), {
    backwards: true
  });
}

function printArrayItems(path, options, printPath, print) {
  var printedElements = [];
  var separatorParts = [];
  path.each(function (childPath) {
    printedElements.push(concat$4(separatorParts));
    printedElements.push(group$1(print(childPath)));
    separatorParts = [",", line$3];

    if (childPath.getValue() && isNextLineEmpty$2(options.originalText, childPath.getValue(), options)) {
      separatorParts.push(softline$1);
    }
  }, printPath);
  return concat$4(printedElements);
}

function hasDanglingComments(node) {
  return node.comments && node.comments.some(function (comment) {
    return !comment.leading && !comment.trailing;
  });
}

function needsHardlineAfterDanglingComment(node) {
  if (!node.comments) {
    return false;
  }

  var lastDanglingComment = getLast$4(node.comments.filter(function (comment) {
    return !comment.leading && !comment.trailing;
  }));
  return lastDanglingComment && !comments$3.isBlockComment(lastDanglingComment);
}

function isLiteral(node) {
  return node.type === "BooleanLiteral" || node.type === "DirectiveLiteral" || node.type === "Literal" || node.type === "NullLiteral" || node.type === "NumericLiteral" || node.type === "RegExpLiteral" || node.type === "StringLiteral" || node.type === "TemplateLiteral" || node.type === "TSTypeLiteral" || node.type === "JSXText";
}

function isNumericLiteral(node) {
  return node.type === "NumericLiteral" || node.type === "Literal" && typeof node.value === "number";
}

function isStringLiteral(node) {
  return node.type === "StringLiteral" || node.type === "Literal" && typeof node.value === "string";
}

function isObjectType(n) {
  return n.type === "ObjectTypeAnnotation" || n.type === "TSTypeLiteral";
}

var unitTestRe = /^(skip|[fx]?(it|describe|test))$/; // eg; `describe("some string", (done) => {})`

function isTestCall(n, parent) {
  if (n.type !== "CallExpression") {
    return false;
  }

  if (n.arguments.length === 1) {
    if (isAngularTestWrapper(n) && parent && isTestCall(parent)) {
      return isFunctionOrArrowExpression(n.arguments[0].type);
    }

    if (isUnitTestSetUp(n)) {
      return isFunctionOrArrowExpression(n.arguments[0].type) || isAngularTestWrapper(n.arguments[0]);
    }
  } else if (n.arguments.length === 2) {
    if ((n.callee.type === "Identifier" && unitTestRe.test(n.callee.name) || isSkipOrOnlyBlock(n)) && (isTemplateLiteral(n.arguments[0]) || isStringLiteral(n.arguments[0]))) {
      return isFunctionOrArrowExpression(n.arguments[1].type) && n.arguments[1].params.length <= 1 || isAngularTestWrapper(n.arguments[1]);
    }
  }

  return false;
}

function isSkipOrOnlyBlock(node) {
  return (node.callee.type === "MemberExpression" || node.callee.type === "OptionalMemberExpression") && node.callee.object.type === "Identifier" && node.callee.property.type === "Identifier" && unitTestRe.test(node.callee.object.name) && (node.callee.property.name === "only" || node.callee.property.name === "skip");
}

function isTemplateLiteral(node) {
  return node.type === "TemplateLiteral";
} // `inject` is used in AngularJS 1.x, `async` in Angular 2+
// example: https://docs.angularjs.org/guide/unit-testing#using-beforeall-


function isAngularTestWrapper(node) {
  return (node.type === "CallExpression" || node.type === "OptionalCallExpression") && node.callee.type === "Identifier" && (node.callee.name === "async" || node.callee.name === "inject" || node.callee.name === "fakeAsync");
}

function isFunctionOrArrowExpression(type) {
  return type === "FunctionExpression" || type === "ArrowFunctionExpression";
}

function isUnitTestSetUp(n) {
  var unitTestSetUpRe = /^(before|after)(Each|All)$/;
  return n.callee.type === "Identifier" && unitTestSetUpRe.test(n.callee.name) && n.arguments.length === 1;
}

function isTheOnlyJSXElementInMarkdown(options, path) {
  if (options.parentParser !== "markdown") {
    return false;
  }

  var node = path.getNode();

  if (!node.expression || !isJSXNode(node.expression)) {
    return false;
  }

  var parent = path.getParentNode();
  return parent.type === "Program" && parent.body.length == 1;
}

function willPrintOwnComments(path) {
  var node = path.getValue();
  var parent = path.getParentNode();
  return (node && isJSXNode(node) || parent && (parent.type === "JSXSpreadAttribute" || parent.type === "JSXSpreadChild" || parent.type === "UnionTypeAnnotation" || parent.type === "TSUnionType" || (parent.type === "ClassDeclaration" || parent.type === "ClassExpression") && parent.superClass === node)) && !hasIgnoreComment$1(path);
}

function canAttachComment(node) {
  return node.type && node.type !== "CommentBlock" && node.type !== "CommentLine" && node.type !== "Line" && node.type !== "Block" && node.type !== "EmptyStatement" && node.type !== "TemplateElement" && node.type !== "Import" && !(node.callee && node.callee.type === "Import");
}

function printComment$1(commentPath, options) {
  var comment = commentPath.getValue();

  switch (comment.type) {
    case "CommentBlock":
    case "Block":
      {
        if (isJsDocComment(comment)) {
          var printed = printJsDocComment(comment); // We need to prevent an edge case of a previous trailing comment
          // printed as a `lineSuffix` which causes the comments to be
          // interleaved. See https://github.com/prettier/prettier/issues/4412

          if (comment.trailing && !hasNewline$2(options.originalText, options.locStart(comment), {
            backwards: true
          })) {
            return concat$4([hardline$3, printed]);
          }

          return printed;
        }

        var isInsideFlowComment = options.originalText.substr(options.locEnd(comment) - 3, 3) === "*-/";
        return "/*" + comment.value + (isInsideFlowComment ? "*-/" : "*/");
      }

    case "CommentLine":
    case "Line":
      // Print shebangs with the proper comment characters
      if (options.originalText.slice(options.locStart(comment)).startsWith("#!")) {
        return "#!" + comment.value.trimRight();
      }

      return "//" + comment.value.trimRight();

    default:
      throw new Error("Not a comment: " + JSON.stringify(comment));
  }
}

function isJsDocComment(comment) {
  var lines = comment.value.split("\n");
  return lines.length > 1 && lines.slice(0, lines.length - 1).every(function (line) {
    return line.trim()[0] === "*";
  });
}

function printJsDocComment(comment) {
  var lines = comment.value.split("\n");
  return concat$4(["/*", join$2(hardline$3, lines.map(function (line, index) {
    return (index > 0 ? " " : "") + (index < lines.length - 1 ? line.trim() : line.trimLeft());
  })), "*/"]);
}

function rawText(node) {
  return node.extra ? node.extra.raw : node.raw;
}

var printerEstree = {
  print: genericPrint$1,
  embed: embed_1,
  insertPragma: insertPragma,
  massageAstNode: clean_1,
  hasPrettierIgnore: hasPrettierIgnore,
  willPrintOwnComments: willPrintOwnComments,
  canAttachComment: canAttachComment,
  printComment: printComment$1,
  isBlockComment: comments$3.isBlockComment,
  handleComments: {
    ownLine: comments$3.handleOwnLineComment,
    endOfLine: comments$3.handleEndOfLineComment,
    remaining: comments$3.handleRemainingComment
  }
};

var _require$$0$builders$2 = doc.builders;
var concat$6 = _require$$0$builders$2.concat;
var hardline$5 = _require$$0$builders$2.hardline;
var indent$4 = _require$$0$builders$2.indent;
var join$4 = _require$$0$builders$2.join;

function genericPrint$2(path, options, print) {
  var node = path.getValue();

  switch (node.type) {
    case "ArrayExpression":
      return node.elements.length === 0 ? "[]" : concat$6(["[", indent$4(concat$6([hardline$5, join$4(concat$6([",", hardline$5]), path.map(print, "elements"))])), hardline$5, "]"]);

    case "ObjectExpression":
      return node.properties.length === 0 ? "{}" : concat$6(["{", indent$4(concat$6([hardline$5, join$4(concat$6([",", hardline$5]), path.map(print, "properties"))])), hardline$5, "}"]);

    case "ObjectProperty":
      return concat$6([path.call(print, "key"), ": ", path.call(print, "value")]);

    case "UnaryExpression":
      return concat$6([node.operator === "+" ? "" : node.operator, path.call(print, "argument")]);

    case "NullLiteral":
      return "null";

    case "BooleanLiteral":
      return node.value ? "true" : "false";

    case "StringLiteral":
    case "NumericLiteral":
      return JSON.stringify(node.value);

    case "Identifier":
      return JSON.stringify(node.name);

    default:
      /* istanbul ignore next */
      throw new Error("unknown type: " + JSON.stringify(node.type));
  }
}

function clean$2(node, newNode
/*, parent*/
) {
  delete newNode.start;
  delete newNode.end;
  delete newNode.extra;
  delete newNode.loc;
  delete newNode.comments;

  if (node.type === "Identifier") {
    return {
      type: "StringLiteral",
      value: node.name
    };
  }

  if (node.type === "UnaryExpression" && node.operator === "+") {
    return newNode.argument;
  }
}

var printerEstreeJson = {
  print: genericPrint$2,
  massageAstNode: clean$2
};

var CATEGORY_COMMON = "Common"; // format based on https://github.com/prettier/prettier/blob/master/src/main/core-options.js

var commonOptions = {
  bracketSpacing: {
    since: "0.0.0",
    category: CATEGORY_COMMON,
    type: "boolean",
    default: true,
    description: "Print spaces between brackets.",
    oppositeDescription: "Do not print spaces between brackets."
  },
  singleQuote: {
    since: "0.0.0",
    category: CATEGORY_COMMON,
    type: "boolean",
    default: false,
    description: "Use single quotes instead of double quotes."
  },
  proseWrap: {
    since: "1.8.2",
    category: CATEGORY_COMMON,
    type: "choice",
    default: [{
      since: "1.8.2",
      value: true
    }, {
      since: "1.9.0",
      value: "preserve"
    }],
    description: "How to wrap prose.",
    choices: [{
      since: "1.9.0",
      value: "always",
      description: "Wrap prose if it exceeds the print width."
    }, {
      since: "1.9.0",
      value: "never",
      description: "Do not wrap prose."
    }, {
      since: "1.9.0",
      value: "preserve",
      description: "Wrap prose as-is."
    }, {
      value: false,
      deprecated: "1.9.0",
      redirect: "never"
    }, {
      value: true,
      deprecated: "1.9.0",
      redirect: "always"
    }]
  }
};

var CATEGORY_JAVASCRIPT = "JavaScript"; // format based on https://github.com/prettier/prettier/blob/master/src/main/core-options.js

var options$3 = {
  arrowParens: {
    since: "1.9.0",
    category: CATEGORY_JAVASCRIPT,
    type: "choice",
    default: "avoid",
    description: "Include parentheses around a sole arrow function parameter.",
    choices: [{
      value: "avoid",
      description: "Omit parens when possible. Example: `x => x`"
    }, {
      value: "always",
      description: "Always include parens. Example: `(x) => x`"
    }]
  },
  bracketSpacing: commonOptions.bracketSpacing,
  jsxBracketSameLine: {
    since: "0.17.0",
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description: "Put > on the last line instead of at a new line."
  },
  semi: {
    since: "1.0.0",
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: true,
    description: "Print semicolons.",
    oppositeDescription: "Do not print semicolons, except at the beginning of lines which may need them."
  },
  singleQuote: commonOptions.singleQuote,
  trailingComma: {
    since: "0.0.0",
    category: CATEGORY_JAVASCRIPT,
    type: "choice",
    default: [{
      since: "0.0.0",
      value: false
    }, {
      since: "0.19.0",
      value: "none"
    }],
    description: "Print trailing commas wherever possible when multi-line.",
    choices: [{
      value: "none",
      description: "No trailing commas."
    }, {
      value: "es5",
      description: "Trailing commas where valid in ES5 (objects, arrays, etc.)"
    }, {
      value: "all",
      description: "Trailing commas wherever possible (including function arguments)."
    }, {
      value: true,
      deprecated: "0.19.0",
      redirect: "es5"
    }, {
      value: false,
      deprecated: "0.19.0",
      redirect: "none"
    }]
  }
};

var languageExtend = function languageExtend() {
  var _arguments = arguments;
  var main = arguments[0];

  var _loop = function _loop(i) {
    var arg = _arguments[i];
    Object.keys(arg).forEach(function (key) {
      var newKey = key === "languageId" ? "linguistLanguageId" : key;
      var value = arg[key];

      if (Array.isArray(main[newKey])) {
        main[newKey] = main[newKey].concat(value);
      } else {
        main[newKey] = value;
      }
    });
  };

  for (var i = 1; i < arguments.length; i++) {
    _loop(i);
  }

  return main;
};

var name$1 = "JavaScript";
var type = "programming";
var tmScope = "source.js";
var aceMode = "javascript";
var codemirrorMode = "javascript";
var codemirrorMimeType = "text/javascript";
var color = "#f1e05a";
var aliases = ["js", "node"];
var extensions = [".js", "._js", ".bones", ".es", ".es6", ".frag", ".gs", ".jake", ".jsb", ".jscad", ".jsfl", ".jsm", ".jss", ".mjs", ".njs", ".pac", ".sjs", ".ssjs", ".xsjs", ".xsjslib"];
var filenames = ["Jakefile"];
var interpreters = ["node"];
var languageId = 183;
var javascript = {
  name: name$1,
  type: type,
  tmScope: tmScope,
  aceMode: aceMode,
  codemirrorMode: codemirrorMode,
  codemirrorMimeType: codemirrorMimeType,
  color: color,
  aliases: aliases,
  extensions: extensions,
  filenames: filenames,
  interpreters: interpreters,
  languageId: languageId
};

var javascript$1 = Object.freeze({
	name: name$1,
	type: type,
	tmScope: tmScope,
	aceMode: aceMode,
	codemirrorMode: codemirrorMode,
	codemirrorMimeType: codemirrorMimeType,
	color: color,
	aliases: aliases,
	extensions: extensions,
	filenames: filenames,
	interpreters: interpreters,
	languageId: languageId,
	default: javascript
});

var name$2 = "JSX";
var type$1 = "programming";
var group$2 = "JavaScript";
var extensions$1 = [".jsx"];
var tmScope$1 = "source.js.jsx";
var aceMode$1 = "javascript";
var codemirrorMode$1 = "jsx";
var codemirrorMimeType$1 = "text/jsx";
var languageId$1 = 178;
var jsx = {
  name: name$2,
  type: type$1,
  group: group$2,
  extensions: extensions$1,
  tmScope: tmScope$1,
  aceMode: aceMode$1,
  codemirrorMode: codemirrorMode$1,
  codemirrorMimeType: codemirrorMimeType$1,
  languageId: languageId$1
};

var jsx$1 = Object.freeze({
	name: name$2,
	type: type$1,
	group: group$2,
	extensions: extensions$1,
	tmScope: tmScope$1,
	aceMode: aceMode$1,
	codemirrorMode: codemirrorMode$1,
	codemirrorMimeType: codemirrorMimeType$1,
	languageId: languageId$1,
	default: jsx
});

var name$3 = "TypeScript";
var type$2 = "programming";
var color$1 = "#2b7489";
var aliases$1 = ["ts"];
var extensions$2 = [".ts", ".tsx"];
var tmScope$2 = "source.ts";
var aceMode$2 = "typescript";
var codemirrorMode$2 = "javascript";
var codemirrorMimeType$2 = "application/typescript";
var languageId$2 = 378;
var typescript = {
  name: name$3,
  type: type$2,
  color: color$1,
  aliases: aliases$1,
  extensions: extensions$2,
  tmScope: tmScope$2,
  aceMode: aceMode$2,
  codemirrorMode: codemirrorMode$2,
  codemirrorMimeType: codemirrorMimeType$2,
  languageId: languageId$2
};

var typescript$1 = Object.freeze({
	name: name$3,
	type: type$2,
	color: color$1,
	aliases: aliases$1,
	extensions: extensions$2,
	tmScope: tmScope$2,
	aceMode: aceMode$2,
	codemirrorMode: codemirrorMode$2,
	codemirrorMimeType: codemirrorMimeType$2,
	languageId: languageId$2,
	default: typescript
});

var name$4 = "JSON";
var type$3 = "data";
var tmScope$3 = "source.json";
var group$3 = "JavaScript";
var aceMode$3 = "json";
var codemirrorMode$3 = "javascript";
var codemirrorMimeType$3 = "application/json";
var searchable = false;
var extensions$3 = [".json", ".avsc", ".geojson", ".gltf", ".JSON-tmLanguage", ".jsonl", ".tfstate", ".tfstate.backup", ".topojson", ".webapp", ".webmanifest"];
var filenames$1 = [".arcconfig", ".htmlhintrc", ".tern-config", ".tern-project", "composer.lock", "mcmod.info"];
var languageId$3 = 174;
var json$2 = {
  name: name$4,
  type: type$3,
  tmScope: tmScope$3,
  group: group$3,
  aceMode: aceMode$3,
  codemirrorMode: codemirrorMode$3,
  codemirrorMimeType: codemirrorMimeType$3,
  searchable: searchable,
  extensions: extensions$3,
  filenames: filenames$1,
  languageId: languageId$3
};

var json$3 = Object.freeze({
	name: name$4,
	type: type$3,
	tmScope: tmScope$3,
	group: group$3,
	aceMode: aceMode$3,
	codemirrorMode: codemirrorMode$3,
	codemirrorMimeType: codemirrorMimeType$3,
	searchable: searchable,
	extensions: extensions$3,
	filenames: filenames$1,
	languageId: languageId$3,
	default: json$2
});

var name$5 = "JSON with Comments";
var type$4 = "data";
var group$4 = "JSON";
var tmScope$4 = "source.js";
var aceMode$4 = "javascript";
var codemirrorMode$4 = "javascript";
var codemirrorMimeType$4 = "text/javascript";
var aliases$2 = ["jsonc"];
var extensions$4 = [".sublime-build", ".sublime-commands", ".sublime-completions", ".sublime-keymap", ".sublime-macro", ".sublime-menu", ".sublime-mousemap", ".sublime-project", ".sublime-settings", ".sublime-theme", ".sublime-workspace", ".sublime_metrics", ".sublime_session"];
var filenames$2 = [".babelrc", ".eslintrc.json", ".jscsrc", ".jshintrc", ".jslintrc", "tsconfig.json"];
var languageId$4 = 423;
var jsonWithComments = {
  name: name$5,
  type: type$4,
  group: group$4,
  tmScope: tmScope$4,
  aceMode: aceMode$4,
  codemirrorMode: codemirrorMode$4,
  codemirrorMimeType: codemirrorMimeType$4,
  aliases: aliases$2,
  extensions: extensions$4,
  filenames: filenames$2,
  languageId: languageId$4
};

var jsonWithComments$1 = Object.freeze({
	name: name$5,
	type: type$4,
	group: group$4,
	tmScope: tmScope$4,
	aceMode: aceMode$4,
	codemirrorMode: codemirrorMode$4,
	codemirrorMimeType: codemirrorMimeType$4,
	aliases: aliases$2,
	extensions: extensions$4,
	filenames: filenames$2,
	languageId: languageId$4,
	default: jsonWithComments
});

var name$6 = "JSON5";
var type$5 = "data";
var extensions$5 = [".json5"];
var tmScope$5 = "source.js";
var aceMode$5 = "javascript";
var codemirrorMode$5 = "javascript";
var codemirrorMimeType$5 = "application/json";
var languageId$5 = 175;
var json5 = {
  name: name$6,
  type: type$5,
  extensions: extensions$5,
  tmScope: tmScope$5,
  aceMode: aceMode$5,
  codemirrorMode: codemirrorMode$5,
  codemirrorMimeType: codemirrorMimeType$5,
  languageId: languageId$5
};

var json5$1 = Object.freeze({
	name: name$6,
	type: type$5,
	extensions: extensions$5,
	tmScope: tmScope$5,
	aceMode: aceMode$5,
	codemirrorMode: codemirrorMode$5,
	codemirrorMimeType: codemirrorMimeType$5,
	languageId: languageId$5,
	default: json5
});

var require$$0$10 = ( javascript$1 && javascript ) || javascript$1;

var require$$1$6 = ( jsx$1 && jsx ) || jsx$1;

var require$$2$6 = ( typescript$1 && typescript ) || typescript$1;

var require$$3$1 = ( json$3 && json$2 ) || json$3;

var require$$4 = ( jsonWithComments$1 && jsonWithComments ) || jsonWithComments$1;

var require$$5 = ( json5$1 && json5 ) || json5$1;

var languages = [languageExtend({}, require$$0$10, {
  since: "0.0.0",
  parsers: ["babylon", "flow"],
  vscodeLanguageIds: ["javascript"]
}), Object.assign(languageExtend({}, require$$0$10, {
  name: "Flow",
  since: "0.0.0",
  parsers: ["babylon", "flow"],
  vscodeLanguageIds: ["javascript"]
}), // overwrite
{
  aliases: [],
  filenames: [],
  extensions: [".js.flow"]
}), languageExtend({}, require$$1$6, {
  since: "0.0.0",
  parsers: ["babylon", "flow"],
  vscodeLanguageIds: ["javascriptreact"]
}), languageExtend({}, require$$2$6, {
  since: "1.4.0",
  parsers: ["typescript-eslint"],
  vscodeLanguageIds: ["typescript", "typescriptreact"]
}), Object.assign(languageExtend({}, require$$3$1, {
  name: "JSON.stringify",
  since: "1.13.0",
  parsers: ["json-stringify"],
  vscodeLanguageIds: ["json"]
}), // overwrite
{
  extensions: [],
  // .json file defaults to json instead of json-stringify
  filenames: ["package.json", "package-lock.json", "composer.json"]
}), languageExtend({}, require$$3$1, {
  since: "1.5.0",
  parsers: ["json"],
  filenames: [".prettierrc"],
  vscodeLanguageIds: ["json"]
}), languageExtend({}, require$$4, {
  since: "1.5.0",
  parsers: ["json"],
  filenames: [".eslintrc"],
  vscodeLanguageIds: ["jsonc"]
}), languageExtend({}, require$$5, {
  since: "1.13.0",
  parsers: ["json5"],
  vscodeLanguageIds: ["json5"]
})];
var printers = {
  estree: printerEstree,
  "estree-json": printerEstreeJson
};
var languageJs = {
  languages: languages,
  options: options$3,
  printers: printers
};

var index$5 = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "bgsound", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "content", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "image", "img", "input", "ins", "isindex", "kbd", "keygen", "label", "legend", "li", "link", "listing", "main", "map", "mark", "marquee", "math", "menu", "menuitem", "meta", "meter", "multicol", "nav", "nextid", "nobr", "noembed", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "plaintext", "pre", "progress", "q", "rb", "rbc", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr", "xmp"];

var htmlTagNames = Object.freeze({
	default: index$5
});

var htmlTagNames$1 = ( htmlTagNames && index$5 ) || htmlTagNames;

function clean$3(ast, newObj, parent) {
  ["raw", // front-matter
  "raws", "sourceIndex", "source", "before", "after", "trailingComma"].forEach(function (name) {
    delete newObj[name];
  });

  if (ast.type === "yaml") {
    delete newObj.value;
  } // --insert-pragma


  if (ast.type === "css-comment" && parent.type === "css-root" && parent.nodes.length !== 0 && ( // first non-front-matter comment
  parent.nodes[0] === ast || (parent.nodes[0].type === "yaml" || parent.nodes[0].type === "toml") && parent.nodes[1] === ast)) {
    /**
     * something
     *
     * @format
     */
    delete newObj.text; // standalone pragma

    if (/^\*\s*@(format|prettier)\s*$/.test(ast.text)) {
      return null;
    }
  }

  if (ast.type === "media-query" || ast.type === "media-query-list" || ast.type === "media-feature-expression") {
    delete newObj.value;
  }

  if (ast.type === "css-rule") {
    delete newObj.params;
  }

  if (ast.type === "selector-combinator") {
    newObj.value = newObj.value.replace(/\s+/g, " ");
  }

  if (ast.type === "media-feature") {
    newObj.value = newObj.value.replace(/ /g, "");
  }

  if (ast.type === "value-word" && (ast.isColor && ast.isHex || ["initial", "inherit", "unset", "revert"].indexOf(newObj.value.replace().toLowerCase()) !== -1) || ast.type === "media-feature" || ast.type === "selector-root-invalid" || ast.type === "selector-pseudo") {
    newObj.value = newObj.value.toLowerCase();
  }

  if (ast.type === "css-decl") {
    newObj.prop = newObj.prop.toLowerCase();
  }

  if (ast.type === "css-atrule" || ast.type === "css-import") {
    newObj.name = newObj.name.toLowerCase();
  }

  if (ast.type === "value-number") {
    newObj.unit = newObj.unit.toLowerCase();
  }

  if ((ast.type === "media-feature" || ast.type === "media-keyword" || ast.type === "media-type" || ast.type === "media-unknown" || ast.type === "media-url" || ast.type === "media-value" || ast.type === "selector-attribute" || ast.type === "selector-string" || ast.type === "selector-class" || ast.type === "selector-combinator" || ast.type === "value-string") && newObj.value) {
    newObj.value = cleanCSSStrings(newObj.value);
  }

  if (ast.type === "selector-attribute") {
    newObj.attribute = newObj.attribute.trim();

    if (newObj.namespace) {
      if (typeof newObj.namespace === "string") {
        newObj.namespace = newObj.namespace.trim();

        if (newObj.namespace.length === 0) {
          newObj.namespace = true;
        }
      }
    }

    if (newObj.value) {
      newObj.value = newObj.value.trim().replace(/^['"]|['"]$/g, "");
      delete newObj.quoted;
    }
  }

  if ((ast.type === "media-value" || ast.type === "media-type" || ast.type === "value-number" || ast.type === "selector-root-invalid" || ast.type === "selector-class" || ast.type === "selector-combinator" || ast.type === "selector-tag") && newObj.value) {
    newObj.value = newObj.value.replace(/([\d.eE+-]+)([a-zA-Z]*)/g, function (match, numStr, unit) {
      var num = Number(numStr);
      return isNaN(num) ? match : num + unit.toLowerCase();
    });
  }

  if (ast.type === "selector-tag") {
    var lowercasedValue = ast.value.toLowerCase();

    if (htmlTagNames$1.indexOf(lowercasedValue) !== -1) {
      newObj.value = lowercasedValue;
    }

    if (["from", "to"].indexOf(lowercasedValue) !== -1) {
      newObj.value = lowercasedValue;
    }
  } // Workaround when `postcss-values-parser` parse `not`, `and` or `or` keywords as `value-func`


  if (ast.type === "css-atrule" && ast.name.toLowerCase() === "supports") {
    delete newObj.value;
  } // Workaround for SCSS nested properties


  if (ast.type === "selector-unknown") {
    delete newObj.value;
  }
}

function cleanCSSStrings(value) {
  return value.replace(/'/g, '"').replace(/\\([^a-fA-F\d])/g, "$1");
}

var clean_1$2 = clean$3;

var _require$$0$builders$3 = doc.builders;
var hardline$7 = _require$$0$builders$3.hardline;
var literalline$3 = _require$$0$builders$3.literalline;
var concat$8 = _require$$0$builders$3.concat;
var markAsRoot$1 = _require$$0$builders$3.markAsRoot;
var mapDoc$3 = doc.utils.mapDoc;

function embed$2(path, print, textToDoc
/*, options */
) {
  var node = path.getValue();

  if (node.type === "yaml") {
    return markAsRoot$1(concat$8(["---", hardline$7, node.value.trim() ? replaceNewlinesWithLiterallines(textToDoc(node.value, {
      parser: "yaml"
    })) : "", "---", hardline$7]));
  }

  return null;

  function replaceNewlinesWithLiterallines(doc$$2) {
    return mapDoc$3(doc$$2, function (currentDoc) {
      return typeof currentDoc === "string" && currentDoc.includes("\n") ? concat$8(currentDoc.split(/(\n)/g).map(function (v, i) {
        return i % 2 === 0 ? v : literalline$3;
      })) : currentDoc;
    });
  }
}

var embed_1$2 = embed$2;

var DELIMITER_MAP = {
  "---": "yaml",
  "+++": "toml"
};

function parse$3(text) {
  var delimiterRegex = Object.keys(DELIMITER_MAP).map(escapeStringRegexp).join("|");
  var match = text.match(new RegExp("^(".concat(delimiterRegex, ")\\n(?:([\\s\\S]*?)\\n)?\\1(\\n|$)")));

  if (match === null) {
    return {
      frontMatter: null,
      content: text
    };
  }

  var raw = match[0].trimRight();
  var delimiter = match[1];
  var value = match[2];
  return {
    frontMatter: {
      type: DELIMITER_MAP[delimiter],
      value: value,
      raw: raw
    },
    content: text.slice(raw.length)
  };
}

var frontMatter = parse$3;

function hasPragma$1(text) {
  return pragma.hasPragma(frontMatter(text).content);
}

function insertPragma$3(text) {
  var _parseFrontMatter = frontMatter(text),
      frontMatter$$1 = _parseFrontMatter.frontMatter,
      content = _parseFrontMatter.content;

  return (frontMatter$$1 ? frontMatter$$1.raw + "\n\n" : "") + pragma.insertPragma(content);
}

var pragma$2 = {
  hasPragma: hasPragma$1,
  insertPragma: insertPragma$3
};

var colorAdjusterFunctions = ["red", "green", "blue", "alpha", "a", "rgb", "hue", "h", "saturation", "s", "lightness", "l", "whiteness", "w", "blackness", "b", "tint", "shade", "blend", "blenda", "contrast", "hsl", "hsla", "hwb", "hwba"];

function getAncestorCounter(path, typeOrTypes) {
  var types = [].concat(typeOrTypes);
  var counter = -1;
  var ancestorNode;

  while (ancestorNode = path.getParentNode(++counter)) {
    if (types.indexOf(ancestorNode.type) !== -1) {
      return counter;
    }
  }

  return -1;
}

function getAncestorNode$1(path, typeOrTypes) {
  var counter = getAncestorCounter(path, typeOrTypes);
  return counter === -1 ? null : path.getParentNode(counter);
}

function getPropOfDeclNode$1(path) {
  var declAncestorNode = getAncestorNode$1(path, "css-decl");
  return declAncestorNode && declAncestorNode.prop && declAncestorNode.prop.toLowerCase();
}

function isSCSS$1(parser, text) {
  var hasExplicitParserChoice = parser === "less" || parser === "scss";
  var IS_POSSIBLY_SCSS = /(\w\s*: [^}:]+|#){|@import[^\n]+(url|,)/;
  return hasExplicitParserChoice ? parser === "scss" : IS_POSSIBLY_SCSS.test(text);
}

function isWideKeywords$1(value) {
  return ["initial", "inherit", "unset", "revert"].indexOf(value.toLowerCase()) !== -1;
}

function isKeyframeAtRuleKeywords$1(path, value) {
  var atRuleAncestorNode = getAncestorNode$1(path, "css-atrule");
  return atRuleAncestorNode && atRuleAncestorNode.name && atRuleAncestorNode.name.toLowerCase().endsWith("keyframes") && ["from", "to"].indexOf(value.toLowerCase()) !== -1;
}

function maybeToLowerCase$1(value) {
  return value.includes("$") || value.includes("@") || value.includes("#") || value.startsWith("%") || value.startsWith("--") || value.startsWith(":--") || value.includes("(") && value.includes(")") ? value : value.toLowerCase();
}

function insideValueFunctionNode$1(path, functionName) {
  var funcAncestorNode = getAncestorNode$1(path, "value-func");
  return funcAncestorNode && funcAncestorNode.value && funcAncestorNode.value.toLowerCase() === functionName;
}

function insideICSSRuleNode$1(path) {
  var ruleAncestorNode = getAncestorNode$1(path, "css-rule");
  return ruleAncestorNode && ruleAncestorNode.raws && ruleAncestorNode.raws.selector && (ruleAncestorNode.raws.selector.startsWith(":import") || ruleAncestorNode.raws.selector.startsWith(":export"));
}

function insideAtRuleNode$1(path, atRuleNameOrAtRuleNames) {
  var atRuleNames = [].concat(atRuleNameOrAtRuleNames);
  var atRuleAncestorNode = getAncestorNode$1(path, "css-atrule");
  return atRuleAncestorNode && atRuleNames.indexOf(atRuleAncestorNode.name.toLowerCase()) !== -1;
}

function insideURLFunctionInImportAtRuleNode$1(path) {
  var node = path.getValue();
  var atRuleAncestorNode = getAncestorNode$1(path, "css-atrule");
  return atRuleAncestorNode && atRuleAncestorNode.name === "import" && node.groups[0].value === "url" && node.groups.length === 2;
}

function isURLFunctionNode$1(node) {
  return node.type === "value-func" && node.value.toLowerCase() === "url";
}

function isLastNode$1(path, node) {
  var parentNode = path.getParentNode();

  if (!parentNode) {
    return false;
  }

  var nodes = parentNode.nodes;
  return nodes && nodes.indexOf(node) === nodes.length - 1;
}

function isHTMLTag$1(value) {
  return htmlTagNames$1.indexOf(value.toLowerCase()) !== -1;
}

function isDetachedRulesetDeclarationNode$1(node) {
  // If a Less file ends up being parsed with the SCSS parser, Less
  // variable declarations will be parsed as atrules with names ending
  // with a colon, so keep the original case then.
  if (!node.selector) {
    return false;
  }

  return typeof node.selector === "string" && /^@.+:.*$/.test(node.selector) || node.selector.value && /^@.+:.*$/.test(node.selector.value);
}

function isForKeywordNode$1(node) {
  return node.type === "value-word" && ["from", "through", "end"].indexOf(node.value) !== -1;
}

function isIfElseKeywordNode$1(node) {
  return node.type === "value-word" && ["and", "or", "not"].indexOf(node.value) !== -1;
}

function isEachKeywordNode$1(node) {
  return node.type === "value-word" && node.value === "in";
}

function isMultiplicationNode$1(node) {
  return node.type === "value-operator" && node.value === "*";
}

function isDivisionNode$1(node) {
  return node.type === "value-operator" && node.value === "/";
}

function isAdditionNode$1(node) {
  return node.type === "value-operator" && node.value === "+";
}

function isSubtractionNode$1(node) {
  return node.type === "value-operator" && node.value === "-";
}

function isModuloNode(node) {
  return node.type === "value-operator" && node.value === "%";
}

function isMathOperatorNode$1(node) {
  return isMultiplicationNode$1(node) || isDivisionNode$1(node) || isAdditionNode$1(node) || isSubtractionNode$1(node) || isModuloNode(node);
}

function isEqualityOperatorNode$1(node) {
  return node.type === "value-word" && ["==", "!="].indexOf(node.value) !== -1;
}

function isRelationalOperatorNode$1(node) {
  return node.type === "value-word" && ["<", ">", "<=", ">="].indexOf(node.value) !== -1;
}

function isSCSSControlDirectiveNode$1(node) {
  return node.type === "css-atrule" && ["if", "else", "for", "each", "while"].indexOf(node.name) !== -1;
}

function isSCSSNestedPropertyNode(node) {
  if (!node.selector) {
    return false;
  }

  return node.selector.replace(/\/\*.*?\*\//, "").replace(/\/\/.*?\n/, "").trim().endsWith(":");
}

function isDetachedRulesetCallNode$1(node) {
  return node.raws && node.raws.params && /^\(\s*\)$/.test(node.raws.params);
}

function isPostcssSimpleVarNode$1(currentNode, nextNode) {
  return currentNode.value === "$$" && currentNode.type === "value-func" && nextNode && nextNode.type === "value-word" && !nextNode.raws.before;
}

function hasComposesNode$1(node) {
  return node.value && node.value.type === "value-root" && node.value.group && node.value.group.type === "value-value" && node.prop.toLowerCase() === "composes";
}

function hasParensAroundNode$1(node) {
  return node.value && node.value.group && node.value.group.group && node.value.group.group.type === "value-paren_group" && node.value.group.group.open !== null && node.value.group.group.close !== null;
}

function hasEmptyRawBefore$1(node) {
  return node.raws && node.raws.before === "";
}

function isKeyValuePairNode$1(node) {
  return node.type === "value-comma_group" && node.groups && node.groups[1] && node.groups[1].type === "value-colon";
}

function isKeyValuePairInParenGroupNode(node) {
  return node.type === "value-paren_group" && node.groups && node.groups[0] && isKeyValuePairNode$1(node.groups[0]);
}

function isSCSSMapItemNode$1(path) {
  var node = path.getValue(); // Ignore empty item (i.e. `$key: ()`)

  if (node.groups.length === 0) {
    return false;
  }

  var parentParentNode = path.getParentNode(1); // Check open parens contain key/value pair (i.e. `(key: value)` and `(key: (value, other-value)`)

  if (!isKeyValuePairInParenGroupNode(node) && !(parentParentNode && isKeyValuePairInParenGroupNode(parentParentNode))) {
    return false;
  }

  var declNode = getAncestorNode$1(path, "css-decl"); // SCSS map declaration (i.e. `$map: (key: value, other-key: other-value)`)

  if (declNode && declNode.prop && declNode.prop.startsWith("$")) {
    return true;
  } // List as value of key inside SCSS map (i.e. `$map: (key: (value other-value other-other-value))`)


  if (isKeyValuePairInParenGroupNode(parentParentNode)) {
    return true;
  } // SCSS Map is argument of function (i.e. `func((key: value, other-key: other-value))`)


  if (parentParentNode.type === "value-func") {
    return true;
  }

  return false;
}

function isInlineValueCommentNode$1(node) {
  return node.type === "value-comment" && node.inline;
}

function isHashNode$1(node) {
  return node.type === "value-word" && node.value === "#";
}

function isLeftCurlyBraceNode$1(node) {
  return node.type === "value-word" && node.value === "{";
}

function isRightCurlyBraceNode$1(node) {
  return node.type === "value-word" && node.value === "}";
}

function isWordNode$1(node) {
  return ["value-word", "value-atword"].indexOf(node.type) !== -1;
}

function isColonNode$1(node) {
  return node.type === "value-colon";
}

function isMediaAndSupportsKeywords$1(node) {
  return node.value && ["not", "and", "or"].indexOf(node.value.toLowerCase()) !== -1;
}

function isColorAdjusterFuncNode$1(node) {
  if (node.type !== "value-func") {
    return false;
  }

  return colorAdjusterFunctions.indexOf(node.value.toLowerCase()) !== -1;
}

var utils$4 = {
  getAncestorCounter: getAncestorCounter,
  getAncestorNode: getAncestorNode$1,
  getPropOfDeclNode: getPropOfDeclNode$1,
  maybeToLowerCase: maybeToLowerCase$1,
  insideValueFunctionNode: insideValueFunctionNode$1,
  insideICSSRuleNode: insideICSSRuleNode$1,
  insideAtRuleNode: insideAtRuleNode$1,
  insideURLFunctionInImportAtRuleNode: insideURLFunctionInImportAtRuleNode$1,
  isKeyframeAtRuleKeywords: isKeyframeAtRuleKeywords$1,
  isHTMLTag: isHTMLTag$1,
  isWideKeywords: isWideKeywords$1,
  isSCSS: isSCSS$1,
  isLastNode: isLastNode$1,
  isSCSSControlDirectiveNode: isSCSSControlDirectiveNode$1,
  isDetachedRulesetDeclarationNode: isDetachedRulesetDeclarationNode$1,
  isRelationalOperatorNode: isRelationalOperatorNode$1,
  isEqualityOperatorNode: isEqualityOperatorNode$1,
  isMultiplicationNode: isMultiplicationNode$1,
  isDivisionNode: isDivisionNode$1,
  isAdditionNode: isAdditionNode$1,
  isSubtractionNode: isSubtractionNode$1,
  isModuloNode: isModuloNode,
  isMathOperatorNode: isMathOperatorNode$1,
  isEachKeywordNode: isEachKeywordNode$1,
  isForKeywordNode: isForKeywordNode$1,
  isURLFunctionNode: isURLFunctionNode$1,
  isIfElseKeywordNode: isIfElseKeywordNode$1,
  hasComposesNode: hasComposesNode$1,
  hasParensAroundNode: hasParensAroundNode$1,
  hasEmptyRawBefore: hasEmptyRawBefore$1,
  isSCSSNestedPropertyNode: isSCSSNestedPropertyNode,
  isDetachedRulesetCallNode: isDetachedRulesetCallNode$1,
  isPostcssSimpleVarNode: isPostcssSimpleVarNode$1,
  isKeyValuePairNode: isKeyValuePairNode$1,
  isKeyValuePairInParenGroupNode: isKeyValuePairInParenGroupNode,
  isSCSSMapItemNode: isSCSSMapItemNode$1,
  isInlineValueCommentNode: isInlineValueCommentNode$1,
  isHashNode: isHashNode$1,
  isLeftCurlyBraceNode: isLeftCurlyBraceNode$1,
  isRightCurlyBraceNode: isRightCurlyBraceNode$1,
  isWordNode: isWordNode$1,
  isColonNode: isColonNode$1,
  isMediaAndSupportsKeywords: isMediaAndSupportsKeywords$1,
  isColorAdjusterFuncNode: isColorAdjusterFuncNode$1
};

var insertPragma$2 = pragma$2.insertPragma;
var printNumber$2 = util.printNumber;
var printString$2 = util.printString;
var hasIgnoreComment$2 = util.hasIgnoreComment;
var hasNewline$3 = util.hasNewline;
var isNextLineEmpty$3 = utilShared.isNextLineEmpty;
var _require$$3$builders = doc.builders;
var concat$7 = _require$$3$builders.concat;
var join$5 = _require$$3$builders.join;
var line$4 = _require$$3$builders.line;
var hardline$6 = _require$$3$builders.hardline;
var softline$3 = _require$$3$builders.softline;
var group$5 = _require$$3$builders.group;
var fill$3 = _require$$3$builders.fill;
var indent$5 = _require$$3$builders.indent;
var dedent$3 = _require$$3$builders.dedent;
var ifBreak$2 = _require$$3$builders.ifBreak;
var removeLines$2 = doc.utils.removeLines;
var getAncestorNode = utils$4.getAncestorNode;
var getPropOfDeclNode = utils$4.getPropOfDeclNode;
var maybeToLowerCase = utils$4.maybeToLowerCase;
var insideValueFunctionNode = utils$4.insideValueFunctionNode;
var insideICSSRuleNode = utils$4.insideICSSRuleNode;
var insideAtRuleNode = utils$4.insideAtRuleNode;
var insideURLFunctionInImportAtRuleNode = utils$4.insideURLFunctionInImportAtRuleNode;
var isKeyframeAtRuleKeywords = utils$4.isKeyframeAtRuleKeywords;
var isHTMLTag = utils$4.isHTMLTag;
var isWideKeywords = utils$4.isWideKeywords;
var isSCSS = utils$4.isSCSS;
var isLastNode = utils$4.isLastNode;
var isSCSSControlDirectiveNode = utils$4.isSCSSControlDirectiveNode;
var isDetachedRulesetDeclarationNode = utils$4.isDetachedRulesetDeclarationNode;
var isRelationalOperatorNode = utils$4.isRelationalOperatorNode;
var isEqualityOperatorNode = utils$4.isEqualityOperatorNode;
var isMultiplicationNode = utils$4.isMultiplicationNode;
var isDivisionNode = utils$4.isDivisionNode;
var isAdditionNode = utils$4.isAdditionNode;
var isSubtractionNode = utils$4.isSubtractionNode;
var isMathOperatorNode = utils$4.isMathOperatorNode;
var isEachKeywordNode = utils$4.isEachKeywordNode;
var isForKeywordNode = utils$4.isForKeywordNode;
var isURLFunctionNode = utils$4.isURLFunctionNode;
var isIfElseKeywordNode = utils$4.isIfElseKeywordNode;
var hasComposesNode = utils$4.hasComposesNode;
var hasParensAroundNode = utils$4.hasParensAroundNode;
var hasEmptyRawBefore = utils$4.hasEmptyRawBefore;
var isKeyValuePairNode = utils$4.isKeyValuePairNode;
var isDetachedRulesetCallNode = utils$4.isDetachedRulesetCallNode;
var isPostcssSimpleVarNode = utils$4.isPostcssSimpleVarNode;
var isSCSSMapItemNode = utils$4.isSCSSMapItemNode;
var isInlineValueCommentNode = utils$4.isInlineValueCommentNode;
var isHashNode = utils$4.isHashNode;
var isLeftCurlyBraceNode = utils$4.isLeftCurlyBraceNode;
var isRightCurlyBraceNode = utils$4.isRightCurlyBraceNode;
var isWordNode = utils$4.isWordNode;
var isColonNode = utils$4.isColonNode;
var isMediaAndSupportsKeywords = utils$4.isMediaAndSupportsKeywords;
var isColorAdjusterFuncNode = utils$4.isColorAdjusterFuncNode;

function shouldPrintComma$1(options) {
  switch (options.trailingComma) {
    case "all":
    case "es5":
      return true;

    case "none":
    default:
      return false;
  }
}

function genericPrint$3(path, options, print) {
  var node = path.getValue();
  /* istanbul ignore if */

  if (!node) {
    return "";
  }

  if (typeof node === "string") {
    return node;
  }

  switch (node.type) {
    case "yaml":
    case "toml":
      return concat$7([node.raw, hardline$6]);

    case "css-root":
      {
        var nodes = printNodeSequence(path, options, print);

        if (nodes.parts.length) {
          return concat$7([nodes, hardline$6]);
        }

        return nodes;
      }

    case "css-comment":
      {
        if (node.raws.content) {
          return node.raws.content;
        }

        var text = options.originalText.slice(options.locStart(node), options.locEnd(node));
        var rawText = node.raws.text || node.text; // Workaround a bug where the location is off.
        // https://github.com/postcss/postcss-scss/issues/63

        if (text.indexOf(rawText) === -1) {
          if (node.raws.inline) {
            return concat$7(["// ", rawText]);
          }

          return concat$7(["/* ", rawText, " */"]);
        }

        return text;
      }

    case "css-rule":
      {
        return concat$7([path.call(print, "selector"), node.important ? " !important" : "", node.nodes ? concat$7([" {", node.nodes.length > 0 ? indent$5(concat$7([hardline$6, printNodeSequence(path, options, print)])) : "", hardline$6, "}", isDetachedRulesetDeclarationNode(node) ? ";" : ""]) : ";"]);
      }

    case "css-decl":
      {
        return concat$7([node.raws.before.replace(/[\s;]/g, ""), insideICSSRuleNode(path) ? node.prop : maybeToLowerCase(node.prop), node.raws.between.trim() === ":" ? ":" : node.raws.between.trim(), node.extend ? "" : " ", hasComposesNode(node) ? removeLines$2(path.call(print, "value")) : path.call(print, "value"), node.raws.important ? node.raws.important.replace(/\s*!\s*important/i, " !important") : node.important ? " !important" : "", node.raws.scssDefault ? node.raws.scssDefault.replace(/\s*!default/i, " !default") : node.scssDefault ? " !default" : "", node.raws.scssGlobal ? node.raws.scssGlobal.replace(/\s*!global/i, " !global") : node.scssGlobal ? " !global" : "", node.nodes ? concat$7([" {", indent$5(concat$7([softline$3, printNodeSequence(path, options, print)])), softline$3, "}"]) : ";"]);
      }

    case "css-atrule":
      {
        return concat$7(["@", // If a Less file ends up being parsed with the SCSS parser, Less
        // variable declarations will be parsed as at-rules with names ending
        // with a colon, so keep the original case then.
        isDetachedRulesetCallNode(node) || node.name.endsWith(":") ? node.name : maybeToLowerCase(node.name), node.params ? concat$7([isDetachedRulesetCallNode(node) ? "" : " ", path.call(print, "params")]) : "", node.selector ? indent$5(concat$7([" ", path.call(print, "selector")])) : "", node.value ? group$5(concat$7([" ", path.call(print, "value"), isSCSSControlDirectiveNode(node) ? hasParensAroundNode(node) ? " " : line$4 : ""])) : node.name === "else" ? " " : "", node.nodes ? concat$7([isSCSSControlDirectiveNode(node) ? "" : " ", "{", indent$5(concat$7([node.nodes.length > 0 ? softline$3 : "", printNodeSequence(path, options, print)])), softline$3, "}"]) : ";"]);
      }
    // postcss-media-query-parser

    case "media-query-list":
      {
        var parts = [];
        path.each(function (childPath) {
          var node = childPath.getValue();

          if (node.type === "media-query" && node.value === "") {
            return;
          }

          parts.push(childPath.call(print));
        }, "nodes");
        return group$5(indent$5(join$5(line$4, parts)));
      }

    case "media-query":
      {
        return concat$7([join$5(" ", path.map(print, "nodes")), isLastNode(path, node) ? "" : ","]);
      }

    case "media-type":
      {
        return adjustNumbers(adjustStrings(node.value, options));
      }

    case "media-feature-expression":
      {
        if (!node.nodes) {
          return node.value;
        }

        return concat$7(["(", concat$7(path.map(print, "nodes")), ")"]);
      }

    case "media-feature":
      {
        return maybeToLowerCase(adjustStrings(node.value.replace(/ +/g, " "), options));
      }

    case "media-colon":
      {
        return concat$7([node.value, " "]);
      }

    case "media-value":
      {
        return adjustNumbers(adjustStrings(node.value, options));
      }

    case "media-keyword":
      {
        return adjustStrings(node.value, options);
      }

    case "media-url":
      {
        return adjustStrings(node.value.replace(/^url\(\s+/gi, "url(").replace(/\s+\)$/gi, ")"), options);
      }

    case "media-unknown":
      {
        return node.value;
      }
    // postcss-selector-parser

    case "selector-root":
      {
        return group$5(concat$7([insideAtRuleNode(path, "custom-selector") ? concat$7([getAncestorNode(path, "css-atrule").customSelector, line$4]) : "", join$5(concat$7([",", insideAtRuleNode(path, ["extend", "custom-selector", "nest"]) ? line$4 : hardline$6]), path.map(print, "nodes"))]));
      }

    case "selector-selector":
      {
        return group$5(indent$5(concat$7(path.map(print, "nodes"))));
      }

    case "selector-comment":
      {
        return node.value;
      }

    case "selector-string":
      {
        return adjustStrings(node.value, options);
      }

    case "selector-tag":
      {
        var parentNode = path.getParentNode();
        var index = parentNode && parentNode.nodes.indexOf(node);
        var prevNode = index && parentNode.nodes[index - 1];
        return concat$7([node.namespace ? concat$7([node.namespace === true ? "" : node.namespace.trim(), "|"]) : "", prevNode.type === "selector-nesting" ? node.value : adjustNumbers(isHTMLTag(node.value) || isKeyframeAtRuleKeywords(path, node.value) ? node.value.toLowerCase() : node.value)]);
      }

    case "selector-id":
      {
        return concat$7(["#", node.value]);
      }

    case "selector-class":
      {
        return concat$7([".", adjustNumbers(adjustStrings(node.value, options))]);
      }

    case "selector-attribute":
      {
        return concat$7(["[", node.namespace ? concat$7([node.namespace === true ? "" : node.namespace.trim(), "|"]) : "", node.attribute.trim(), node.operator ? node.operator : "", node.value ? quoteAttributeValue(adjustStrings(node.value.trim(), options), options) : "", node.insensitive ? " i" : "", "]"]);
      }

    case "selector-combinator":
      {
        if (node.value === "+" || node.value === ">" || node.value === "~" || node.value === ">>>") {
          var _parentNode = path.getParentNode();

          var _leading = _parentNode.type === "selector-selector" && _parentNode.nodes[0] === node ? "" : line$4;

          return concat$7([_leading, node.value, isLastNode(path, node) ? "" : " "]);
        }

        var leading = node.value.trim().startsWith("(") ? line$4 : "";
        var value = adjustNumbers(adjustStrings(node.value.trim(), options)) || line$4;
        return concat$7([leading, value]);
      }

    case "selector-universal":
      {
        return concat$7([node.namespace ? concat$7([node.namespace === true ? "" : node.namespace.trim(), "|"]) : "", node.value]);
      }

    case "selector-pseudo":
      {
        return concat$7([maybeToLowerCase(node.value), node.nodes && node.nodes.length > 0 ? concat$7(["(", join$5(", ", path.map(print, "nodes")), ")"]) : ""]);
      }

    case "selector-nesting":
      {
        return node.value;
      }

    case "selector-unknown":
      {
        var ruleAncestorNode = getAncestorNode(path, "css-rule"); // Nested SCSS property

        if (ruleAncestorNode && ruleAncestorNode.isSCSSNesterProperty) {
          return adjustNumbers(adjustStrings(maybeToLowerCase(node.value), options));
        }

        return node.value;
      }
    // postcss-values-parser

    case "value-value":
    case "value-root":
      {
        return path.call(print, "group");
      }

    case "value-comment":
      {
        return concat$7([node.inline ? "//" : "/*", node.value, node.inline ? "" : "*/"]);
      }

    case "value-comma_group":
      {
        var _parentNode2 = path.getParentNode();

        var parentParentNode = path.getParentNode(1);
        var declAncestorProp = getPropOfDeclNode(path);
        var isGridValue = declAncestorProp && _parentNode2.type === "value-value" && (declAncestorProp === "grid" || declAncestorProp.startsWith("grid-template"));
        var atRuleAncestorNode = getAncestorNode(path, "css-atrule");
        var isControlDirective = atRuleAncestorNode && isSCSSControlDirectiveNode(atRuleAncestorNode);
        var printed = path.map(print, "groups");
        var _parts = [];
        var insideURLFunction = insideValueFunctionNode(path, "url");
        var insideSCSSInterpolationInString = false;
        var didBreak = false;

        for (var i = 0; i < node.groups.length; ++i) {
          _parts.push(printed[i]); // Ignore value inside `url()`


          if (insideURLFunction) {
            continue;
          }

          var iPrevNode = node.groups[i - 1];
          var iNode = node.groups[i];
          var iNextNode = node.groups[i + 1];
          var iNextNextNode = node.groups[i + 2]; // Ignore after latest node (i.e. before semicolon)

          if (!iNextNode) {
            continue;
          } // Ignore spaces before/after string interpolation (i.e. `"#{my-fn("_")}"`)


          var isStartSCSSinterpolationInString = iNode.type === "value-string" && iNode.value.startsWith("#{");
          var isEndingSCSSinterpolationInString = insideSCSSInterpolationInString && iNextNode.type === "value-string" && iNextNode.value.endsWith("}");

          if (isStartSCSSinterpolationInString || isEndingSCSSinterpolationInString) {
            insideSCSSInterpolationInString = !insideSCSSInterpolationInString;
            continue;
          }

          if (insideSCSSInterpolationInString) {
            continue;
          } // Ignore colon (i.e. `:`)


          if (isColonNode(iNode) || isColonNode(iNextNode)) {
            continue;
          } // Ignore `@` in Less (i.e. `@@var;`)


          if (iNode.type === "value-atword" && iNode.value === "") {
            continue;
          } // Ignore `~` in Less (i.e. `content: ~"^//* some horrible but needed css hack";`)


          if (iNode.value === "~") {
            continue;
          } // Ignore `\` (i.e. `$variable: \@small;`)


          if (iNode.value === "\\") {
            continue;
          } // Ignore `$$` (i.e. `background-color: $$(style)Color;`)


          if (isPostcssSimpleVarNode(iNode, iNextNode)) {
            continue;
          } // Ignore spaces after `#` and after `{` and before `}` in SCSS interpolation (i.e. `#{variable}`)


          if (isHashNode(iNode) || isLeftCurlyBraceNode(iNode) || isRightCurlyBraceNode(iNextNode) || isLeftCurlyBraceNode(iNextNode) && hasEmptyRawBefore(iNextNode) || isRightCurlyBraceNode(iNode) && hasEmptyRawBefore(iNextNode)) {
            continue;
          } // Ignore css variables and interpolation in SCSS (i.e. `--#{$var}`)


          if (iNode.value === "--" && isHashNode(iNextNode)) {
            continue;
          } // Formatting math operations


          var isMathOperator = isMathOperatorNode(iNode);
          var isNextMathOperator = isMathOperatorNode(iNextNode); // Print spaces before and after math operators beside SCSS interpolation as is
          // (i.e. `#{$var}+5`, `#{$var} +5`, `#{$var}+ 5`, `#{$var} + 5`)
          // (i.e. `5+#{$var}`, `5 +#{$var}`, `5+ #{$var}`, `5 + #{$var}`)

          if ((isMathOperator && isHashNode(iNextNode) || isNextMathOperator && isRightCurlyBraceNode(iNode)) && hasEmptyRawBefore(iNextNode)) {
            continue;
          } // Print spaces before and after addition and subtraction math operators as is in `calc` function
          // due to the fact that it is not valid syntax
          // (i.e. `calc(1px+1px)`, `calc(1px+ 1px)`, `calc(1px +1px)`, `calc(1px + 1px)`)


          if (insideValueFunctionNode(path, "calc") && (isAdditionNode(iNode) || isAdditionNode(iNextNode) || isSubtractionNode(iNode) || isSubtractionNode(iNextNode)) && hasEmptyRawBefore(iNextNode)) {
            continue;
          } // Print spaces after `+` and `-` in color adjuster functions as is (e.g. `color(red l(+ 20%))`)
          // Adjusters with signed numbers (e.g. `color(red l(+20%))`) output as-is.


          var isColorAdjusterNode = (isAdditionNode(iNode) || isSubtractionNode(iNode)) && i === 0 && (iNextNode.type === "value-number" || iNextNode.isHex) && parentParentNode && isColorAdjusterFuncNode(parentParentNode) && !hasEmptyRawBefore(iNextNode);
          var requireSpaceBeforeOperator = iNextNextNode && iNextNextNode.type === "value-func" || iNextNextNode && isWordNode(iNextNextNode) || iNode.type === "value-func" || isWordNode(iNode);
          var requireSpaceAfterOperator = iNextNode.type === "value-func" || isWordNode(iNextNode) || iPrevNode && iPrevNode.type === "value-func" || iPrevNode && isWordNode(iPrevNode); // Formatting `/`, `+`, `-` sign

          if (!(isMultiplicationNode(iNextNode) || isMultiplicationNode(iNode)) && !insideValueFunctionNode(path, "calc") && !isColorAdjusterNode && (isDivisionNode(iNextNode) && !requireSpaceBeforeOperator || isDivisionNode(iNode) && !requireSpaceAfterOperator || isAdditionNode(iNextNode) && !requireSpaceBeforeOperator || isAdditionNode(iNode) && !requireSpaceAfterOperator || isSubtractionNode(iNextNode) || isSubtractionNode(iNode)) && (hasEmptyRawBefore(iNextNode) || isMathOperator && (!iPrevNode || iPrevNode && isMathOperatorNode(iPrevNode)))) {
            continue;
          } // Ignore inline comment, they already contain newline at end (i.e. `// Comment`)
          // Add `hardline` after inline comment (i.e. `// comment\n foo: bar;`)


          var isInlineComment = isInlineValueCommentNode(iNode);

          if (iPrevNode && isInlineValueCommentNode(iPrevNode) || isInlineComment || isInlineValueCommentNode(iNextNode)) {
            if (isInlineComment) {
              _parts.push(hardline$6);
            }

            continue;
          } // Handle keywords in SCSS control directive


          if (isControlDirective && (isEqualityOperatorNode(iNextNode) || isRelationalOperatorNode(iNextNode) || isIfElseKeywordNode(iNextNode) || isEachKeywordNode(iNode) || isForKeywordNode(iNode))) {
            _parts.push(" ");

            continue;
          } // At-rule `namespace` should be in one line


          if (atRuleAncestorNode && atRuleAncestorNode.name.toLowerCase() === "namespace") {
            _parts.push(" ");

            continue;
          } // Formatting `grid` property


          if (isGridValue) {
            if (iNode.source.start.line !== iNextNode.source.start.line) {
              _parts.push(hardline$6);

              didBreak = true;
            } else {
              _parts.push(" ");
            }

            continue;
          } // Add `space` before next math operation
          // Note: `grip` property have `/` delimiter and it is not math operation, so
          // `grid` property handles above


          if (isNextMathOperator) {
            _parts.push(" ");

            continue;
          } // Be default all values go through `line`


          _parts.push(line$4);
        }

        if (didBreak) {
          _parts.unshift(hardline$6);
        }

        if (isControlDirective) {
          return group$5(indent$5(concat$7(_parts)));
        } // Indent is not needed for import url when url is very long
        // and node has two groups
        // when type is value-comma_group
        // example @import url("verylongurl") projection,tv


        if (insideURLFunctionInImportAtRuleNode(path)) {
          return group$5(fill$3(_parts));
        }

        return group$5(indent$5(fill$3(_parts)));
      }

    case "value-paren_group":
      {
        var _parentNode3 = path.getParentNode();

        if (_parentNode3 && isURLFunctionNode(_parentNode3) && (node.groups.length === 1 || node.groups.length > 0 && node.groups[0].type === "value-comma_group" && node.groups[0].groups.length > 0 && node.groups[0].groups[0].type === "value-word" && node.groups[0].groups[0].value.startsWith("data:"))) {
          return concat$7([node.open ? path.call(print, "open") : "", join$5(",", path.map(print, "groups")), node.close ? path.call(print, "close") : ""]);
        }

        if (!node.open) {
          var _printed = path.map(print, "groups");

          var res = [];

          for (var _i = 0; _i < _printed.length; _i++) {
            if (_i !== 0) {
              res.push(concat$7([",", line$4]));
            }

            res.push(_printed[_i]);
          }

          return group$5(indent$5(fill$3(res)));
        }

        var isSCSSMapItem = isSCSSMapItemNode(path);
        return group$5(concat$7([node.open ? path.call(print, "open") : "", indent$5(concat$7([softline$3, join$5(concat$7([",", line$4]), path.map(function (childPath) {
          var node = childPath.getValue();
          var printed = print(childPath); // Key/Value pair in open paren already indented

          if (isKeyValuePairNode(node) && node.type === "value-comma_group" && node.groups && node.groups[2] && node.groups[2].type === "value-paren_group") {
            printed.contents.contents.parts[1] = group$5(printed.contents.contents.parts[1]);
            return group$5(dedent$3(printed));
          }

          return printed;
        }, "groups"))])), ifBreak$2(isSCSS(options.parser, options.originalText) && isSCSSMapItem && shouldPrintComma$1(options) ? "," : ""), softline$3, node.close ? path.call(print, "close") : ""]), {
          shouldBreak: isSCSSMapItem
        });
      }

    case "value-func":
      {
        return concat$7([node.value, insideAtRuleNode(path, "supports") && isMediaAndSupportsKeywords(node) ? " " : "", path.call(print, "group")]);
      }

    case "value-paren":
      {
        return node.value;
      }

    case "value-number":
      {
        return concat$7([printCssNumber(node.value), maybeToLowerCase(node.unit)]);
      }

    case "value-operator":
      {
        return node.value;
      }

    case "value-word":
      {
        if (node.isColor && node.isHex || isWideKeywords(node.value)) {
          return node.value.toLowerCase();
        }

        return node.value;
      }

    case "value-colon":
      {
        return concat$7([node.value, // Don't add spaces on `:` in `url` function (i.e. `url(fbglyph: cross-outline, fig-white)`)
        insideValueFunctionNode(path, "url") ? "" : line$4]);
      }

    case "value-comma":
      {
        return concat$7([node.value, " "]);
      }

    case "value-string":
      {
        return printString$2(node.raws.quote + node.value + node.raws.quote, options);
      }

    case "value-atword":
      {
        return concat$7(["@", node.value]);
      }

    case "value-unicode-range":
      {
        return node.value;
      }

    case "value-unknown":
      {
        return node.value;
      }

    default:
      /* istanbul ignore next */
      throw new Error("Unknown postcss type ".concat(JSON.stringify(node.type)));
  }
}

function printNodeSequence(path, options, print) {
  var node = path.getValue();
  var parts = [];
  var i = 0;
  path.map(function (pathChild) {
    var prevNode = node.nodes[i - 1];

    if (prevNode && prevNode.type === "css-comment" && prevNode.text.trim() === "prettier-ignore") {
      var childNode = pathChild.getValue();
      parts.push(options.originalText.slice(options.locStart(childNode), options.locEnd(childNode)));
    } else {
      parts.push(pathChild.call(print));
    }

    if (i !== node.nodes.length - 1) {
      if (node.nodes[i + 1].type === "css-comment" && !hasNewline$3(options.originalText, options.locStart(node.nodes[i + 1]), {
        backwards: true
      }) && node.nodes[i].type !== "yaml" && node.nodes[i].type !== "toml" || node.nodes[i + 1].type === "css-atrule" && node.nodes[i + 1].name === "else" && node.nodes[i].type !== "css-comment") {
        parts.push(" ");
      } else {
        parts.push(hardline$6);

        if (isNextLineEmpty$3(options.originalText, pathChild.getValue(), options) && node.nodes[i].type !== "yaml" && node.nodes[i].type !== "toml") {
          parts.push(hardline$6);
        }
      }
    }

    i++;
  }, "nodes");
  return concat$7(parts);
}

var STRING_REGEX = /(['"])(?:(?!\1)[^\\]|\\[\s\S])*\1/g;
var NUMBER_REGEX = /(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g;
var STANDARD_UNIT_REGEX = /[a-zA-Z]+/g;
var WORD_PART_REGEX = /[$@]?[a-zA-Z_\u0080-\uFFFF][\w\-\u0080-\uFFFF]*/g;
var ADJUST_NUMBERS_REGEX = RegExp(STRING_REGEX.source + "|" + "(".concat(WORD_PART_REGEX.source, ")?") + "(".concat(NUMBER_REGEX.source, ")") + "(".concat(STANDARD_UNIT_REGEX.source, ")?"), "g");

function adjustStrings(value, options) {
  return value.replace(STRING_REGEX, function (match) {
    return printString$2(match, options);
  });
}

function quoteAttributeValue(value, options) {
  var quote = options.singleQuote ? "'" : '"';
  return value.includes('"') || value.includes("'") ? value : quote + value + quote;
}

function adjustNumbers(value) {
  return value.replace(ADJUST_NUMBERS_REGEX, function (match, quote, wordPart, number, unit) {
    return !wordPart && number ? (wordPart || "") + printCssNumber(number) + maybeToLowerCase(unit || "") : match;
  });
}

function printCssNumber(rawNumber) {
  return printNumber$2(rawNumber) // Remove trailing `.0`.
  .replace(/\.0(?=$|e)/, "");
}

var printerPostcss = {
  print: genericPrint$3,
  embed: embed_1$2,
  insertPragma: insertPragma$2,
  hasPrettierIgnore: hasIgnoreComment$2,
  massageAstNode: clean_1$2
};

var options$6 = {
  singleQuote: commonOptions.singleQuote
};

var name$7 = "CSS";
var type$6 = "markup";
var tmScope$6 = "source.css";
var aceMode$6 = "css";
var codemirrorMode$6 = "css";
var codemirrorMimeType$6 = "text/css";
var color$2 = "#563d7c";
var extensions$6 = [".css"];
var languageId$6 = 50;
var css$2 = {
  name: name$7,
  type: type$6,
  tmScope: tmScope$6,
  aceMode: aceMode$6,
  codemirrorMode: codemirrorMode$6,
  codemirrorMimeType: codemirrorMimeType$6,
  color: color$2,
  extensions: extensions$6,
  languageId: languageId$6
};

var css$3 = Object.freeze({
	name: name$7,
	type: type$6,
	tmScope: tmScope$6,
	aceMode: aceMode$6,
	codemirrorMode: codemirrorMode$6,
	codemirrorMimeType: codemirrorMimeType$6,
	color: color$2,
	extensions: extensions$6,
	languageId: languageId$6,
	default: css$2
});

var name$8 = "PostCSS";
var type$7 = "markup";
var tmScope$7 = "source.postcss";
var group$6 = "CSS";
var extensions$7 = [".pcss"];
var aceMode$7 = "text";
var languageId$7 = 262764437;
var postcss = {
  name: name$8,
  type: type$7,
  tmScope: tmScope$7,
  group: group$6,
  extensions: extensions$7,
  aceMode: aceMode$7,
  languageId: languageId$7
};

var postcss$1 = Object.freeze({
	name: name$8,
	type: type$7,
	tmScope: tmScope$7,
	group: group$6,
	extensions: extensions$7,
	aceMode: aceMode$7,
	languageId: languageId$7,
	default: postcss
});

var name$9 = "Less";
var type$8 = "markup";
var group$7 = "CSS";
var extensions$8 = [".less"];
var tmScope$8 = "source.css.less";
var aceMode$8 = "less";
var codemirrorMode$7 = "css";
var codemirrorMimeType$7 = "text/css";
var languageId$8 = 198;
var less = {
  name: name$9,
  type: type$8,
  group: group$7,
  extensions: extensions$8,
  tmScope: tmScope$8,
  aceMode: aceMode$8,
  codemirrorMode: codemirrorMode$7,
  codemirrorMimeType: codemirrorMimeType$7,
  languageId: languageId$8
};

var less$1 = Object.freeze({
	name: name$9,
	type: type$8,
	group: group$7,
	extensions: extensions$8,
	tmScope: tmScope$8,
	aceMode: aceMode$8,
	codemirrorMode: codemirrorMode$7,
	codemirrorMimeType: codemirrorMimeType$7,
	languageId: languageId$8,
	default: less
});

var name$10 = "SCSS";
var type$9 = "markup";
var tmScope$9 = "source.scss";
var group$8 = "CSS";
var aceMode$9 = "scss";
var codemirrorMode$8 = "css";
var codemirrorMimeType$8 = "text/x-scss";
var extensions$9 = [".scss"];
var languageId$9 = 329;
var scss = {
  name: name$10,
  type: type$9,
  tmScope: tmScope$9,
  group: group$8,
  aceMode: aceMode$9,
  codemirrorMode: codemirrorMode$8,
  codemirrorMimeType: codemirrorMimeType$8,
  extensions: extensions$9,
  languageId: languageId$9
};

var scss$1 = Object.freeze({
	name: name$10,
	type: type$9,
	tmScope: tmScope$9,
	group: group$8,
	aceMode: aceMode$9,
	codemirrorMode: codemirrorMode$8,
	codemirrorMimeType: codemirrorMimeType$8,
	extensions: extensions$9,
	languageId: languageId$9,
	default: scss
});

var require$$0$12 = ( css$3 && css$2 ) || css$3;

var require$$1$7 = ( postcss$1 && postcss ) || postcss$1;

var require$$2$7 = ( less$1 && less ) || less$1;

var require$$3$2 = ( scss$1 && scss ) || scss$1;

var languages$1 = [languageExtend({}, require$$0$12, {
  since: "1.4.0",
  parsers: ["css"],
  vscodeLanguageIds: ["css"]
}), languageExtend({}, require$$1$7, {
  since: "1.4.0",
  parsers: ["css"],
  extensions: [".postcss"],
  vscodeLanguageIds: ["postcss"]
}), languageExtend({}, require$$2$7, {
  since: "1.4.0",
  parsers: ["less"],
  vscodeLanguageIds: ["less"]
}), languageExtend({}, require$$3$2, {
  since: "1.4.0",
  parsers: ["scss"],
  vscodeLanguageIds: ["scss"]
})];
var printers$1 = {
  postcss: printerPostcss
};
var languageCss = {
  languages: languages$1,
  options: options$6,
  printers: printers$1
};

function hasPragma$2(text) {
  return /^\s*#[^\n\S]*@(format|prettier)\s*(\n|$)/.test(text);
}

function insertPragma$5(text) {
  return "# @format\n\n" + text;
}

var pragma$4 = {
  hasPragma: hasPragma$2,
  insertPragma: insertPragma$5
};

var _require$$0$builders$4 = doc.builders;
var concat$9 = _require$$0$builders$4.concat;
var join$6 = _require$$0$builders$4.join;
var hardline$8 = _require$$0$builders$4.hardline;
var line$5 = _require$$0$builders$4.line;
var softline$4 = _require$$0$builders$4.softline;
var group$9 = _require$$0$builders$4.group;
var indent$6 = _require$$0$builders$4.indent;
var ifBreak$3 = _require$$0$builders$4.ifBreak;
var hasIgnoreComment$3 = util.hasIgnoreComment;
var isNextLineEmpty$4 = utilShared.isNextLineEmpty;
var insertPragma$4 = pragma$4.insertPragma;

function genericPrint$4(path, options, print) {
  var n = path.getValue();

  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  switch (n.kind) {
    case "Document":
      {
        var parts = [];
        path.map(function (pathChild, index) {
          parts.push(concat$9([pathChild.call(print)]));

          if (index !== n.definitions.length - 1) {
            parts.push(hardline$8);

            if (isNextLineEmpty$4(options.originalText, pathChild.getValue(), options)) {
              parts.push(hardline$8);
            }
          }
        }, "definitions");
        return concat$9([concat$9(parts), hardline$8]);
      }

    case "OperationDefinition":
      {
        var hasOperation = options.originalText[options.locStart(n)] !== "{";
        var hasName = !!n.name;
        return concat$9([hasOperation ? n.operation : "", hasOperation && hasName ? concat$9([" ", path.call(print, "name")]) : "", n.variableDefinitions && n.variableDefinitions.length ? group$9(concat$9(["(", indent$6(concat$9([softline$4, join$6(concat$9([ifBreak$3("", ", "), softline$4]), path.map(print, "variableDefinitions"))])), softline$4, ")"])) : "", printDirectives(path, print, n), n.selectionSet ? !hasOperation && !hasName ? "" : " " : "", path.call(print, "selectionSet")]);
      }

    case "FragmentDefinition":
      {
        return concat$9(["fragment ", path.call(print, "name"), " on ", path.call(print, "typeCondition"), printDirectives(path, print, n), " ", path.call(print, "selectionSet")]);
      }

    case "SelectionSet":
      {
        return concat$9(["{", indent$6(concat$9([hardline$8, join$6(hardline$8, path.call(function (selectionsPath) {
          return printSequence(selectionsPath, options, print);
        }, "selections"))])), hardline$8, "}"]);
      }

    case "Field":
      {
        return group$9(concat$9([n.alias ? concat$9([path.call(print, "alias"), ": "]) : "", path.call(print, "name"), n.arguments.length > 0 ? group$9(concat$9(["(", indent$6(concat$9([softline$4, join$6(concat$9([ifBreak$3("", ", "), softline$4]), path.call(function (argsPath) {
          return printSequence(argsPath, options, print);
        }, "arguments"))])), softline$4, ")"])) : "", printDirectives(path, print, n), n.selectionSet ? " " : "", path.call(print, "selectionSet")]));
      }

    case "Name":
      {
        return n.value;
      }

    case "StringValue":
      {
        if (n.block) {
          return concat$9(['"""', hardline$8, join$6(hardline$8, n.value.replace(/"""/g, "\\$&").split("\n")), hardline$8, '"""']);
        }

        return concat$9(['"', n.value.replace(/["\\]/g, "\\$&").replace(/\n/g, "\\n"), '"']);
      }

    case "IntValue":
    case "FloatValue":
    case "EnumValue":
      {
        return n.value;
      }

    case "BooleanValue":
      {
        return n.value ? "true" : "false";
      }

    case "NullValue":
      {
        return "null";
      }

    case "Variable":
      {
        return concat$9(["$", path.call(print, "name")]);
      }

    case "ListValue":
      {
        return group$9(concat$9(["[", indent$6(concat$9([softline$4, join$6(concat$9([ifBreak$3("", ", "), softline$4]), path.map(print, "values"))])), softline$4, "]"]));
      }

    case "ObjectValue":
      {
        return group$9(concat$9(["{", options.bracketSpacing && n.fields.length > 0 ? " " : "", indent$6(concat$9([softline$4, join$6(concat$9([ifBreak$3("", ", "), softline$4]), path.map(print, "fields"))])), softline$4, ifBreak$3("", options.bracketSpacing && n.fields.length > 0 ? " " : ""), "}"]));
      }

    case "ObjectField":
    case "Argument":
      {
        return concat$9([path.call(print, "name"), ": ", path.call(print, "value")]);
      }

    case "Directive":
      {
        return concat$9(["@", path.call(print, "name"), n.arguments.length > 0 ? group$9(concat$9(["(", indent$6(concat$9([softline$4, join$6(concat$9([ifBreak$3("", ", "), softline$4]), path.call(function (argsPath) {
          return printSequence(argsPath, options, print);
        }, "arguments"))])), softline$4, ")"])) : ""]);
      }

    case "NamedType":
      {
        return path.call(print, "name");
      }

    case "VariableDefinition":
      {
        return concat$9([path.call(print, "variable"), ": ", path.call(print, "type"), n.defaultValue ? concat$9([" = ", path.call(print, "defaultValue")]) : ""]);
      }

    case "TypeExtensionDefinition":
      {
        return concat$9(["extend ", path.call(print, "definition")]);
      }

    case "ObjectTypeExtension":
    case "ObjectTypeDefinition":
      {
        return concat$9([path.call(print, "description"), n.description ? hardline$8 : "", n.kind === "ObjectTypeExtension" ? "extend " : "", "type ", path.call(print, "name"), n.interfaces.length > 0 ? concat$9([" implements ", join$6(determineInterfaceSeparator(options.originalText.substr(options.locStart(n), options.locEnd(n))), path.map(print, "interfaces"))]) : "", printDirectives(path, print, n), n.fields.length > 0 ? concat$9([" {", indent$6(concat$9([hardline$8, join$6(hardline$8, path.call(function (fieldsPath) {
          return printSequence(fieldsPath, options, print);
        }, "fields"))])), hardline$8, "}"]) : ""]);
      }

    case "FieldDefinition":
      {
        return concat$9([path.call(print, "description"), n.description ? hardline$8 : "", path.call(print, "name"), n.arguments.length > 0 ? group$9(concat$9(["(", indent$6(concat$9([softline$4, join$6(concat$9([ifBreak$3("", ", "), softline$4]), path.call(function (argsPath) {
          return printSequence(argsPath, options, print);
        }, "arguments"))])), softline$4, ")"])) : "", ": ", path.call(print, "type"), printDirectives(path, print, n)]);
      }

    case "DirectiveDefinition":
      {
        return concat$9([path.call(print, "description"), n.description ? hardline$8 : "", "directive ", "@", path.call(print, "name"), n.arguments.length > 0 ? group$9(concat$9(["(", indent$6(concat$9([softline$4, join$6(concat$9([ifBreak$3("", ", "), softline$4]), path.call(function (argsPath) {
          return printSequence(argsPath, options, print);
        }, "arguments"))])), softline$4, ")"])) : "", concat$9([" on ", join$6(" | ", path.map(print, "locations"))])]);
      }

    case "EnumTypeExtension":
    case "EnumTypeDefinition":
      {
        return concat$9([path.call(print, "description"), n.description ? hardline$8 : "", n.kind === "EnumTypeExtension" ? "extend " : "", "enum ", path.call(print, "name"), printDirectives(path, print, n), n.values.length > 0 ? concat$9([" {", indent$6(concat$9([hardline$8, join$6(hardline$8, path.call(function (valuesPath) {
          return printSequence(valuesPath, options, print);
        }, "values"))])), hardline$8, "}"]) : ""]);
      }

    case "EnumValueDefinition":
      {
        return concat$9([path.call(print, "description"), n.description ? hardline$8 : "", path.call(print, "name"), printDirectives(path, print, n)]);
      }

    case "InputValueDefinition":
      {
        return concat$9([path.call(print, "description"), n.description ? n.description.block ? hardline$8 : line$5 : "", path.call(print, "name"), ": ", path.call(print, "type"), n.defaultValue ? concat$9([" = ", path.call(print, "defaultValue")]) : "", printDirectives(path, print, n)]);
      }

    case "InputObjectTypeExtension":
    case "InputObjectTypeDefinition":
      {
        return concat$9([path.call(print, "description"), n.description ? hardline$8 : "", n.kind === "InputObjectTypeExtension" ? "extend " : "", "input ", path.call(print, "name"), printDirectives(path, print, n), n.fields.length > 0 ? concat$9([" {", indent$6(concat$9([hardline$8, join$6(hardline$8, path.call(function (fieldsPath) {
          return printSequence(fieldsPath, options, print);
        }, "fields"))])), hardline$8, "}"]) : ""]);
      }

    case "SchemaDefinition":
      {
        return concat$9(["schema", printDirectives(path, print, n), " {", n.operationTypes.length > 0 ? indent$6(concat$9([hardline$8, join$6(hardline$8, path.call(function (opsPath) {
          return printSequence(opsPath, options, print);
        }, "operationTypes"))])) : "", hardline$8, "}"]);
      }

    case "OperationTypeDefinition":
      {
        return concat$9([path.call(print, "operation"), ": ", path.call(print, "type")]);
      }

    case "InterfaceTypeExtension":
    case "InterfaceTypeDefinition":
      {
        return concat$9([path.call(print, "description"), n.description ? hardline$8 : "", n.kind === "InterfaceTypeExtension" ? "extend " : "", "interface ", path.call(print, "name"), printDirectives(path, print, n), n.fields.length > 0 ? concat$9([" {", indent$6(concat$9([hardline$8, join$6(hardline$8, path.call(function (fieldsPath) {
          return printSequence(fieldsPath, options, print);
        }, "fields"))])), hardline$8, "}"]) : ""]);
      }

    case "FragmentSpread":
      {
        return concat$9(["...", path.call(print, "name"), printDirectives(path, print, n)]);
      }

    case "InlineFragment":
      {
        return concat$9(["...", n.typeCondition ? concat$9([" on ", path.call(print, "typeCondition")]) : "", printDirectives(path, print, n), " ", path.call(print, "selectionSet")]);
      }

    case "UnionTypeExtension":
    case "UnionTypeDefinition":
      {
        return group$9(concat$9([path.call(print, "description"), n.description ? hardline$8 : "", group$9(concat$9([n.kind === "UnionTypeExtension" ? "extend " : "", "union ", path.call(print, "name"), printDirectives(path, print, n), n.types.length > 0 ? concat$9([" =", ifBreak$3("", " "), indent$6(concat$9([ifBreak$3(concat$9([line$5, "  "])), join$6(concat$9([line$5, "| "]), path.map(print, "types"))]))]) : ""]))]));
      }

    case "ScalarTypeExtension":
    case "ScalarTypeDefinition":
      {
        return concat$9([path.call(print, "description"), n.description ? hardline$8 : "", n.kind === "ScalarTypeExtension" ? "extend " : "", "scalar ", path.call(print, "name"), printDirectives(path, print, n)]);
      }

    case "NonNullType":
      {
        return concat$9([path.call(print, "type"), "!"]);
      }

    case "ListType":
      {
        return concat$9(["[", path.call(print, "type"), "]"]);
      }

    default:
      /* istanbul ignore next */
      throw new Error("unknown graphql type: " + JSON.stringify(n.kind));
  }
}

function printDirectives(path, print, n) {
  if (n.directives.length === 0) {
    return "";
  }

  return concat$9([" ", group$9(indent$6(concat$9([softline$4, join$6(concat$9([ifBreak$3("", " "), softline$4]), path.map(print, "directives"))])))]);
}

function printSequence(sequencePath, options, print) {
  var count = sequencePath.getValue().length;
  return sequencePath.map(function (path, i) {
    var printed = print(path);

    if (isNextLineEmpty$4(options.originalText, path.getValue(), options) && i < count - 1) {
      return concat$9([printed, hardline$8]);
    }

    return printed;
  });
}

function canAttachComment$1(node) {
  return node.kind && node.kind !== "Comment";
}

function printComment$2(commentPath) {
  var comment = commentPath.getValue();

  if (comment.kind === "Comment") {
    return "#" + comment.value.trimRight();
  }

  throw new Error("Not a comment: " + JSON.stringify(comment));
}

function determineInterfaceSeparator(originalSource) {
  var start = originalSource.indexOf("implements");

  if (start === -1) {
    throw new Error("Must implement interfaces: " + originalSource);
  }

  var end = originalSource.indexOf("{");

  if (end === -1) {
    end = originalSource.length;
  }

  return originalSource.substr(start, end).includes("&") ? " & " : ", ";
}

function clean$5(node, newNode
/*, parent*/
) {
  delete newNode.loc;
  delete newNode.comments;
}

var printerGraphql = {
  print: genericPrint$4,
  massageAstNode: clean$5,
  hasPrettierIgnore: hasIgnoreComment$3,
  insertPragma: insertPragma$4,
  printComment: printComment$2,
  canAttachComment: canAttachComment$1
};

var options$9 = {
  bracketSpacing: commonOptions.bracketSpacing
};

var name$11 = "GraphQL";
var type$10 = "data";
var extensions$10 = [".graphql", ".gql"];
var tmScope$10 = "source.graphql";
var aceMode$10 = "text";
var languageId$10 = 139;
var graphql = {
  name: name$11,
  type: type$10,
  extensions: extensions$10,
  tmScope: tmScope$10,
  aceMode: aceMode$10,
  languageId: languageId$10
};

var graphql$1 = Object.freeze({
	name: name$11,
	type: type$10,
	extensions: extensions$10,
	tmScope: tmScope$10,
	aceMode: aceMode$10,
	languageId: languageId$10,
	default: graphql
});

var require$$0$13 = ( graphql$1 && graphql ) || graphql$1;

var languages$2 = [languageExtend({}, require$$0$13, {
  since: "1.5.0",
  parsers: ["graphql"],
  vscodeLanguageIds: ["graphql"]
})];
var printers$2 = {
  graphql: printerGraphql
};
var languageGraphql = {
  languages: languages$2,
  options: options$9,
  printers: printers$2
};

var _require$$0$builders$5 = doc.builders;
var concat$10 = _require$$0$builders$5.concat;
var join$7 = _require$$0$builders$5.join;
var softline$5 = _require$$0$builders$5.softline;
var hardline$9 = _require$$0$builders$5.hardline;
var line$6 = _require$$0$builders$5.line;
var group$10 = _require$$0$builders$5.group;
var indent$7 = _require$$0$builders$5.indent;
var ifBreak$4 = _require$$0$builders$5.ifBreak; // http://w3c.github.io/html/single-page.html#void-elements

var voidTags = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]; // Formatter based on @glimmerjs/syntax's built-in test formatter:
// https://github.com/glimmerjs/glimmer-vm/blob/master/packages/%40glimmer/syntax/lib/generation/print.ts

function print(path, options, print) {
  var n = path.getValue();
  /* istanbul ignore if*/

  if (!n) {
    return "";
  }

  switch (n.type) {
    case "Program":
      {
        return group$10(join$7(softline$5, path.map(print, "body").filter(function (text) {
          return text !== "";
        })));
      }

    case "ElementNode":
      {
        var tagFirstChar = n.tag[0];
        var isLocal = n.tag.indexOf(".") !== -1;
        var isGlimmerComponent = tagFirstChar.toUpperCase() === tagFirstChar || isLocal;
        var hasChildren = n.children.length > 0;
        var isVoid = isGlimmerComponent && !hasChildren || voidTags.indexOf(n.tag) !== -1;
        var closeTag = isVoid ? concat$10([" />", softline$5]) : ">";

        var _getParams = function _getParams(path, print) {
          return indent$7(concat$10([n.attributes.length ? line$6 : "", join$7(line$6, path.map(print, "attributes")), n.modifiers.length ? line$6 : "", join$7(line$6, path.map(print, "modifiers")), n.comments.length ? line$6 : "", join$7(line$6, path.map(print, "comments"))]));
        }; // The problem here is that I want to not break at all if the children
        // would not break but I need to force an indent, so I use a hardline.

        /**
         * What happens now:
         * <div>
         *   Hello
         * </div>
         * ==>
         * <div>Hello</div>
         * This is due to me using hasChildren to decide to put the hardline in.
         * I would rather use a {DOES THE WHOLE THING NEED TO BREAK}
         */


        return concat$10([group$10(concat$10(["<", n.tag, _getParams(path, print), n.blockParams.length ? " as |".concat(n.blockParams.join(" "), "|") : "", ifBreak$4(softline$5, ""), closeTag])), group$10(concat$10([indent$7(join$7(softline$5, [""].concat(path.map(print, "children")))), ifBreak$4(hasChildren ? hardline$9 : "", ""), !isVoid ? concat$10(["</", n.tag, ">"]) : ""]))]);
      }

    case "BlockStatement":
      {
        var pp = path.getParentNode(1);
        var isElseIf = pp && pp.inverse && pp.inverse.body[0] === n && pp.inverse.body[0].path.parts[0] === "if";
        var hasElseIf = n.inverse && n.inverse.body[0] && n.inverse.body[0].type === "BlockStatement" && n.inverse.body[0].path.parts[0] === "if";
        var indentElse = hasElseIf ? function (a) {
          return a;
        } : indent$7;

        if (n.inverse) {
          return concat$10([isElseIf ? concat$10(["{{else ", printPathParams(path, print), "}}"]) : printOpenBlock(path, print), indent$7(concat$10([hardline$9, path.call(print, "program")])), n.inverse && !hasElseIf ? concat$10([hardline$9, "{{else}}"]) : "", n.inverse ? indentElse(concat$10([hardline$9, path.call(print, "inverse")])) : "", isElseIf ? "" : concat$10([hardline$9, printCloseBlock(path, print)])]);
        } else if (isElseIf) {
          return concat$10([concat$10(["{{else ", printPathParams(path, print), "}}"]), indent$7(concat$10([hardline$9, path.call(print, "program")]))]);
        }
        /**
         * I want this boolean to be: if params are going to cause a break,
         * not that it has params.
         */


        var hasParams = n.params.length > 0 || n.hash.pairs.length > 0;

        var _hasChildren = n.program.body.length > 0;

        return concat$10([printOpenBlock(path, print), group$10(concat$10([indent$7(concat$10([softline$5, path.call(print, "program")])), hasParams && _hasChildren ? hardline$9 : softline$5, printCloseBlock(path, print)]))]);
      }

    case "ElementModifierStatement":
    case "MustacheStatement":
      {
        var _pp = path.getParentNode(1);

        var isConcat = _pp && _pp.type === "ConcatStatement";
        return group$10(concat$10([n.escaped === false ? "{{{" : "{{", printPathParams(path, print), isConcat ? "" : softline$5, n.escaped === false ? "}}}" : "}}"]));
      }

    case "SubExpression":
      {
        var params = getParams(path, print);
        var printedParams = params.length > 0 ? indent$7(concat$10([line$6, group$10(join$7(line$6, params))])) : "";
        return group$10(concat$10(["(", printPath(path, print), printedParams, softline$5, ")"]));
      }

    case "AttrNode":
      {
        var isText = n.value.type === "TextNode";

        if (isText && n.value.loc.start.column === n.value.loc.end.column) {
          return concat$10([n.name]);
        }

        var quote = isText ? '"' : "";
        return concat$10([n.name, "=", quote, path.call(print, "value"), quote]);
      }

    case "ConcatStatement":
      {
        return concat$10(['"', group$10(indent$7(join$7(softline$5, path.map(function (partPath) {
          return print(partPath);
        }, "parts").filter(function (a) {
          return a !== "";
        })))), '"']);
      }

    case "Hash":
      {
        return concat$10([join$7(line$6, path.map(print, "pairs"))]);
      }

    case "HashPair":
      {
        return concat$10([n.key, "=", path.call(print, "value")]);
      }

    case "TextNode":
      {
        var leadingSpace = "";
        var trailingSpace = ""; // preserve a space inside of an attribute node where whitespace present, when next to mustache statement.

        var inAttrNode = path.stack.indexOf("attributes") >= 0;

        if (inAttrNode) {
          var parentNode = path.getParentNode(0);

          var _isConcat = parentNode.type === "ConcatStatement";

          if (_isConcat) {
            var parts = parentNode.parts;
            var partIndex = parts.indexOf(n);

            if (partIndex > 0) {
              var partType = parts[partIndex - 1].type;
              var isMustache = partType === "MustacheStatement";

              if (isMustache) {
                leadingSpace = " ";
              }
            }

            if (partIndex < parts.length - 1) {
              var _partType = parts[partIndex + 1].type;

              var _isMustache = _partType === "MustacheStatement";

              if (_isMustache) {
                trailingSpace = " ";
              }
            }
          }
        }

        return n.chars.replace(/^\s+/, leadingSpace).replace(/\s+$/, trailingSpace);
      }

    case "MustacheCommentStatement":
      {
        var dashes = n.value.indexOf("}}") > -1 ? "--" : "";
        return concat$10(["{{!", dashes, n.value, dashes, "}}"]);
      }

    case "PathExpression":
      {
        return n.original;
      }

    case "BooleanLiteral":
      {
        return String(n.value);
      }

    case "CommentStatement":
      {
        return concat$10(["<!--", n.value, "-->"]);
      }

    case "StringLiteral":
      {
        return "\"".concat(n.value, "\"");
      }

    case "NumberLiteral":
      {
        return String(n.value);
      }

    case "UndefinedLiteral":
      {
        return "undefined";
      }

    case "NullLiteral":
      {
        return "null";
      }

    /* istanbul ignore next */

    default:
      throw new Error("unknown glimmer type: " + JSON.stringify(n.type));
  }
}

function printPath(path, print) {
  return path.call(print, "path");
}

function getParams(path, print) {
  var node = path.getValue();
  var parts = [];

  if (node.params.length > 0) {
    parts = parts.concat(path.map(print, "params"));
  }

  if (node.hash && node.hash.pairs.length > 0) {
    parts.push(path.call(print, "hash"));
  }

  return parts;
}

function printPathParams(path, print) {
  var parts = [];
  parts.push(printPath(path, print));
  parts = parts.concat(getParams(path, print));
  return indent$7(group$10(join$7(line$6, parts)));
}

function printBlockParams(path) {
  var block = path.getValue();

  if (!block.program || !block.program.blockParams.length) {
    return "";
  }

  return concat$10([" as |", block.program.blockParams.join(" "), "|"]);
}

function printOpenBlock(path, print) {
  return group$10(concat$10(["{{#", printPathParams(path, print), printBlockParams(path), softline$5, "}}"]));
}

function printCloseBlock(path, print) {
  return concat$10(["{{/", path.call(print, "path"), "}}"]);
}

function clean$6(ast, newObj) {
  delete newObj.loc; // (Glimmer/HTML) ignore TextNode whitespace

  if (ast.type === "TextNode") {
    if (ast.chars.replace(/\s+/, "") === "") {
      return null;
    }

    newObj.chars = ast.chars.replace(/^\s+/, "").replace(/\s+$/, "");
  }
}

var printerGlimmer = {
  print: print,
  massageAstNode: clean$6
};

var name$12 = "Handlebars";
var type$11 = "markup";
var group$11 = "HTML";
var aliases$3 = ["hbs", "htmlbars"];
var extensions$11 = [".handlebars", ".hbs"];
var tmScope$11 = "text.html.handlebars";
var aceMode$11 = "handlebars";
var languageId$11 = 155;
var handlebars = {
  name: name$12,
  type: type$11,
  group: group$11,
  aliases: aliases$3,
  extensions: extensions$11,
  tmScope: tmScope$11,
  aceMode: aceMode$11,
  languageId: languageId$11
};

var handlebars$1 = Object.freeze({
	name: name$12,
	type: type$11,
	group: group$11,
	aliases: aliases$3,
	extensions: extensions$11,
	tmScope: tmScope$11,
	aceMode: aceMode$11,
	languageId: languageId$11,
	default: handlebars
});

var require$$0$14 = ( handlebars$1 && handlebars ) || handlebars$1;

var languages$3 = [languageExtend({}, require$$0$14, {
  since: null,
  // unreleased
  parsers: ["glimmer"],
  vscodeLanguageIds: ["handlebars"]
})];
var printers$3 = {
  glimmer: printerGlimmer
};
var languageHandlebars = {
  languages: languages$3,
  printers: printers$3
};

var _require$$0$builders$7 = doc.builders;
var hardline$11 = _require$$0$builders$7.hardline;
var literalline$5 = _require$$0$builders$7.literalline;
var concat$12 = _require$$0$builders$7.concat;
var markAsRoot$3 = _require$$0$builders$7.markAsRoot;
var mapDoc$5 = doc.utils.mapDoc;

function embed$4(path, print, textToDoc, options) {
  var node = path.getValue();

  if (node.type === "code" && node.lang !== null) {
    // only look for the first string so as to support [markdown-preview-enhanced](https://shd101wyy.github.io/markdown-preview-enhanced/#/code-chunk)
    var langMatch = node.lang.match(/^[A-Za-z0-9_-]+/);
    var lang = langMatch ? langMatch[0] : "";
    var parser = getParserName(lang);

    if (parser) {
      var styleUnit = options.__inJsTemplate ? "~" : "`";
      var style = styleUnit.repeat(Math.max(3, util.getMaxContinuousCount(node.value, styleUnit) + 1));
      var doc$$2 = textToDoc(node.value, {
        parser: parser
      });
      return markAsRoot$3(concat$12([style, node.lang, hardline$11, replaceNewlinesWithLiterallines(doc$$2), style]));
    }
  }

  if (node.type === "yaml") {
    return markAsRoot$3(concat$12(["---", hardline$11, node.value.trim() ? replaceNewlinesWithLiterallines(textToDoc(node.value, {
      parser: "yaml"
    })) : "", "---"]));
  }

  return null;

  function getParserName(lang) {
    var supportInfo = support.getSupportInfo(null, {
      plugins: options.plugins
    });
    var language = supportInfo.languages.find(function (language) {
      return language.name.toLowerCase() === lang || language.aliases && language.aliases.indexOf(lang) !== -1 || language.extensions && language.extensions.find(function (ext) {
        return ext.substring(1) === lang;
      });
    });

    if (language) {
      return language.parsers[0];
    }

    return null;
  }

  function replaceNewlinesWithLiterallines(doc$$2) {
    return mapDoc$5(doc$$2, function (currentDoc) {
      return typeof currentDoc === "string" && currentDoc.includes("\n") ? concat$12(currentDoc.split(/(\n)/g).map(function (v, i) {
        return i % 2 === 0 ? v : literalline$5;
      })) : currentDoc;
    });
  }
}

var embed_1$4 = embed$4;

var pragma$6 = createCommonjsModule(function (module) {
  "use strict";

  var pragmas = ["format", "prettier"];

  function startWithPragma(text) {
    var pragma = "@(".concat(pragmas.join("|"), ")");
    var regex = new RegExp(["<!--\\s*".concat(pragma, "\\s*-->"), "<!--.*\n[\\s\\S]*(^|\n)[^\\S\n]*".concat(pragma, "[^\\S\n]*($|\n)[\\s\\S]*\n.*-->")].join("|"), "m");
    var matched = text.match(regex);
    return matched && matched.index === 0;
  }

  module.exports = {
    startWithPragma: startWithPragma,
    hasPragma: function hasPragma(text) {
      return startWithPragma(frontMatter(text).content.trimLeft());
    },
    insertPragma: function insertPragma(text) {
      var extracted = frontMatter(text);
      var pragma = "<!-- @".concat(pragmas[0], " -->");
      return extracted.frontMatter ? "".concat(extracted.frontMatter.raw, "\n\n").concat(pragma, "\n\n").concat(extracted.content) : "".concat(pragma, "\n\n").concat(extracted.content);
    }
  };
});

function getOrderedListItemInfo$1(orderListItem, originalText) {
  var _originalText$slice$m = originalText.slice(orderListItem.position.start.offset, orderListItem.position.end.offset).match(/^\s*(\d+)(\.|\))(\s*)/),
      _originalText$slice$m2 = _slicedToArray(_originalText$slice$m, 4),
      numberText = _originalText$slice$m2[1],
      marker = _originalText$slice$m2[2],
      leadingSpaces = _originalText$slice$m2[3];

  return {
    numberText: numberText,
    marker: marker,
    leadingSpaces: leadingSpaces
  };
}

var utils$6 = {
  getOrderedListItemInfo: getOrderedListItemInfo$1
};

var _require$$0$builders$6 = doc.builders;
var concat$11 = _require$$0$builders$6.concat;
var join$8 = _require$$0$builders$6.join;
var line$7 = _require$$0$builders$6.line;
var literalline$4 = _require$$0$builders$6.literalline;
var markAsRoot$2 = _require$$0$builders$6.markAsRoot;
var hardline$10 = _require$$0$builders$6.hardline;
var softline$6 = _require$$0$builders$6.softline;
var fill$4 = _require$$0$builders$6.fill;
var align$2 = _require$$0$builders$6.align;
var indent$8 = _require$$0$builders$6.indent;
var group$12 = _require$$0$builders$6.group;
var mapDoc$4 = doc.utils.mapDoc;
var printDocToString$2 = doc.printer.printDocToString;
var getOrderedListItemInfo = utils$6.getOrderedListItemInfo;
var SINGLE_LINE_NODE_TYPES = ["heading", "tableCell", "link"];
var SIBLING_NODE_TYPES = ["listItem", "definition", "footnoteDefinition"];
var INLINE_NODE_TYPES = ["liquidNode", "inlineCode", "emphasis", "strong", "delete", "link", "linkReference", "image", "imageReference", "footnote", "footnoteReference", "sentence", "whitespace", "word", "break"];
var INLINE_NODE_WRAPPER_TYPES = INLINE_NODE_TYPES.concat(["tableCell", "paragraph", "heading"]);

function genericPrint$5(path, options, print) {
  var node = path.getValue();

  if (shouldRemainTheSameContent(path)) {
    return concat$11(util.splitText(options.originalText.slice(node.position.start.offset, node.position.end.offset), options).map(function (node) {
      return node.type === "word" ? node.value : node.value === "" ? "" : printLine(path, node.value, options);
    }));
  }

  switch (node.type) {
    case "root":
      if (node.children.length === 0) {
        return "";
      }

      return concat$11([normalizeDoc(printRoot(path, options, print)), hardline$10]);

    case "paragraph":
      return printChildren(path, options, print, {
        postprocessor: fill$4
      });

    case "sentence":
      return printChildren(path, options, print);

    case "word":
      return node.value.replace(/[*]/g, "\\*") // escape all `*`
      .replace(new RegExp(["(^|[".concat(util.punctuationCharRange, "])(_+)"), "(_+)([".concat(util.punctuationCharRange, "]|$)")].join("|"), "g"), function (_, text1, underscore1, underscore2, text2) {
        return (underscore1 ? "".concat(text1).concat(underscore1) : "".concat(underscore2).concat(text2)).replace(/_/g, "\\_");
      });
    // escape all `_` except concating with non-punctuation, e.g. `1_2_3` is not considered emphasis

    case "whitespace":
      {
        var parentNode = path.getParentNode();
        var index = parentNode.children.indexOf(node);
        var nextNode = parentNode.children[index + 1];
        var proseWrap = // leading char that may cause different syntax
        nextNode && /^>|^([-+*]|#{1,6}|[0-9]+[.)])$/.test(nextNode.value) ? "never" : options.proseWrap;
        return printLine(path, node.value, {
          proseWrap: proseWrap
        });
      }

    case "emphasis":
      {
        var _parentNode = path.getParentNode();

        var _index = _parentNode.children.indexOf(node);

        var prevNode = _parentNode.children[_index - 1];
        var _nextNode = _parentNode.children[_index + 1];
        var hasPrevOrNextWord = // `1*2*3` is considered emphais but `1_2_3` is not
        prevNode && prevNode.type === "sentence" && prevNode.children.length > 0 && util.getLast(prevNode.children).type === "word" && !util.getLast(prevNode.children).hasTrailingPunctuation || _nextNode && _nextNode.type === "sentence" && _nextNode.children.length > 0 && _nextNode.children[0].type === "word" && !_nextNode.children[0].hasLeadingPunctuation;
        var style = hasPrevOrNextWord || getAncestorNode$2(path, "emphasis") ? "*" : "_";
        return concat$11([style, printChildren(path, options, print), style]);
      }

    case "strong":
      return concat$11(["**", printChildren(path, options, print), "**"]);

    case "delete":
      return concat$11(["~~", printChildren(path, options, print), "~~"]);

    case "inlineCode":
      {
        var backtickCount = util.getMaxContinuousCount(node.value, "`");

        var _style = backtickCount === 1 ? "``" : "`";

        var gap = backtickCount ? " " : "";
        return concat$11([_style, gap, node.value, gap, _style]);
      }

    case "link":
      switch (options.originalText[node.position.start.offset]) {
        case "<":
          {
            var mailto = "mailto:";
            var url = // <hello@example.com> is parsed as { url: "mailto:hello@example.com" }
            node.url.startsWith(mailto) && options.originalText.slice(node.position.start.offset + 1, node.position.start.offset + 1 + mailto.length) !== mailto ? node.url.slice(mailto.length) : node.url;
            return concat$11(["<", url, ">"]);
          }

        case "[":
          return concat$11(["[", printChildren(path, options, print), "](", printUrl(node.url, ")"), printTitle(node.title, options), ")"]);

        default:
          return options.originalText.slice(node.position.start.offset, node.position.end.offset);
      }

    case "image":
      return concat$11(["![", node.alt || "", "](", printUrl(node.url, ")"), printTitle(node.title, options), ")"]);

    case "blockquote":
      return concat$11(["> ", align$2("> ", printChildren(path, options, print))]);

    case "heading":
      return concat$11(["#".repeat(node.depth) + " ", printChildren(path, options, print)]);

    case "code":
      {
        if (node.isIndented) {
          // indented code block
          var alignment = " ".repeat(4);
          return align$2(alignment, concat$11([alignment, join$8(hardline$10, node.value.split("\n"))]));
        } // fenced code block


        var styleUnit = options.__inJsTemplate ? "~" : "`";

        var _style2 = styleUnit.repeat(Math.max(3, util.getMaxContinuousCount(node.value, styleUnit) + 1));

        return concat$11([_style2, node.lang || "", hardline$10, join$8(hardline$10, node.value.split("\n")), hardline$10, _style2]);
      }

    case "yaml":
    case "toml":
      return options.originalText.slice(node.position.start.offset, node.position.end.offset);

    case "html":
      {
        var _parentNode2 = path.getParentNode();

        var value = _parentNode2.type === "root" && util.getLast(_parentNode2.children) === node ? node.value.trimRight() : node.value;
        var isHtmlComment = /^<!--[\s\S]*-->$/.test(value);
        return replaceNewlinesWith(value, isHtmlComment ? hardline$10 : markAsRoot$2(literalline$4));
      }

    case "list":
      {
        var nthSiblingIndex = getNthListSiblingIndex(node, path.getParentNode());
        var isGitDiffFriendlyOrderedList = node.ordered && node.children.length > 1 && +getOrderedListItemInfo(node.children[1], options.originalText).numberText === 1;
        return printChildren(path, options, print, {
          processor: function processor(childPath, index) {
            var prefix = getPrefix();
            return concat$11([prefix, align$2(" ".repeat(prefix.length), printListItem(childPath, options, print, prefix))]);

            function getPrefix() {
              var rawPrefix = node.ordered ? (index === 0 ? node.start : isGitDiffFriendlyOrderedList ? 1 : node.start + index) + (nthSiblingIndex % 2 === 0 ? ". " : ") ") : nthSiblingIndex % 2 === 0 ? "- " : "* ";
              return node.isAligned ||
              /* workaround for https://github.com/remarkjs/remark/issues/315 */
              node.hasIndentedCodeblock ? alignListPrefix(rawPrefix, options) : rawPrefix;
            }
          }
        });
      }

    case "thematicBreak":
      {
        var counter = getAncestorCounter$1(path, "list");

        if (counter === -1) {
          return "---";
        }

        var _nthSiblingIndex = getNthListSiblingIndex(path.getParentNode(counter), path.getParentNode(counter + 1));

        return _nthSiblingIndex % 2 === 0 ? "***" : "---";
      }

    case "linkReference":
      return concat$11(["[", printChildren(path, options, print), "]", node.referenceType === "full" ? concat$11(["[", node.identifier, "]"]) : node.referenceType === "collapsed" ? "[]" : ""]);

    case "imageReference":
      switch (node.referenceType) {
        case "full":
          return concat$11(["![", node.alt || "", "][", node.identifier, "]"]);

        default:
          return concat$11(["![", node.alt, "]", node.referenceType === "collapsed" ? "[]" : ""]);
      }

    case "definition":
      {
        var lineOrSpace = options.proseWrap === "always" ? line$7 : " ";
        return group$12(concat$11([concat$11(["[", node.identifier, "]:"]), indent$8(concat$11([lineOrSpace, printUrl(node.url), node.title === null ? "" : concat$11([lineOrSpace, printTitle(node.title, options, false)])]))]));
      }

    case "footnote":
      return concat$11(["[^", printChildren(path, options, print), "]"]);

    case "footnoteReference":
      return concat$11(["[^", node.identifier, "]"]);

    case "footnoteDefinition":
      {
        var _nextNode2 = path.getParentNode().children[path.getName() + 1];
        return concat$11(["[^", node.identifier, "]: ", group$12(concat$11([align$2(" ".repeat(options.tabWidth), printChildren(path, options, print, {
          processor: function processor(childPath, index) {
            return index === 0 ? group$12(concat$11([softline$6, softline$6, childPath.call(print)])) : childPath.call(print);
          }
        })), _nextNode2 && _nextNode2.type === "footnoteDefinition" ? softline$6 : ""]))]);
      }

    case "table":
      return printTable(path, options, print);

    case "tableCell":
      return printChildren(path, options, print);

    case "break":
      return /\s/.test(options.originalText[node.position.start.offset]) ? concat$11(["  ", markAsRoot$2(literalline$4)]) : concat$11(["\\", hardline$10]);

    case "liquidNode":
      return replaceNewlinesWith(node.value, hardline$10);

    case "tableRow": // handled in "table"

    case "listItem": // handled in "list"

    default:
      throw new Error("Unknown markdown type ".concat(JSON.stringify(node.type)));
  }
}

function printListItem(path, options, print, listPrefix) {
  var node = path.getValue();
  var prefix = node.checked === null ? "" : node.checked ? "[x] " : "[ ] ";
  return concat$11([prefix, printChildren(path, options, print, {
    processor: function processor(childPath, index) {
      if (index === 0 && childPath.getValue().type !== "list") {
        return align$2(" ".repeat(prefix.length), childPath.call(print));
      }

      var alignment = " ".repeat(clamp(options.tabWidth - listPrefix.length, 0, 3) // 4+ will cause indented code block
      );
      return concat$11([alignment, align$2(alignment, childPath.call(print))]);
    }
  })]);
}

function alignListPrefix(prefix, options) {
  var additionalSpaces = getAdditionalSpaces();
  return prefix + " ".repeat(additionalSpaces >= 4 ? 0 : additionalSpaces // 4+ will cause indented code block
  );

  function getAdditionalSpaces() {
    var restSpaces = prefix.length % options.tabWidth;
    return restSpaces === 0 ? 0 : options.tabWidth - restSpaces;
  }
}

function getNthListSiblingIndex(node, parentNode) {
  return getNthSiblingIndex(node, parentNode, function (siblingNode) {
    return siblingNode.ordered === node.ordered;
  });
}

function replaceNewlinesWith(str, doc$$2) {
  return join$8(doc$$2, str.split("\n"));
}

function getNthSiblingIndex(node, parentNode, condition) {
  condition = condition || function () {
    return true;
  };

  var index = -1;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = parentNode.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var childNode = _step.value;

      if (childNode.type === node.type && condition(childNode)) {
        index++;
      } else {
        index = -1;
      }

      if (childNode === node) {
        return index;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function getAncestorCounter$1(path, typeOrTypes) {
  var types = [].concat(typeOrTypes);
  var counter = -1;
  var ancestorNode;

  while (ancestorNode = path.getParentNode(++counter)) {
    if (types.indexOf(ancestorNode.type) !== -1) {
      return counter;
    }
  }

  return -1;
}

function getAncestorNode$2(path, typeOrTypes) {
  var counter = getAncestorCounter$1(path, typeOrTypes);
  return counter === -1 ? null : path.getParentNode(counter);
}

function printLine(path, value, options) {
  if (options.proseWrap === "preserve" && value === "\n") {
    return hardline$10;
  }

  var isBreakable = options.proseWrap === "always" && !getAncestorNode$2(path, SINGLE_LINE_NODE_TYPES);
  return value !== "" ? isBreakable ? line$7 : " " : isBreakable ? softline$6 : "";
}

function printTable(path, options, print) {
  var node = path.getValue();
  var contents = []; // { [rowIndex: number]: { [columnIndex: number]: string } }

  path.map(function (rowPath) {
    var rowContents = [];
    rowPath.map(function (cellPath) {
      rowContents.push(printDocToString$2(cellPath.call(print), options).formatted);
    }, "children");
    contents.push(rowContents);
  }, "children");
  var columnMaxWidths = contents.reduce(function (currentWidths, rowContents) {
    return currentWidths.map(function (width, columnIndex) {
      return Math.max(width, util.getStringWidth(rowContents[columnIndex]));
    });
  }, contents[0].map(function () {
    return 3;
  }) // minimum width = 3 (---, :--, :-:, --:)
  );
  return join$8(hardline$10, [printRow(contents[0]), printSeparator(), join$8(hardline$10, contents.slice(1).map(printRow))]);

  function printSeparator() {
    return concat$11(["| ", join$8(" | ", columnMaxWidths.map(function (width, index) {
      switch (node.align[index]) {
        case "left":
          return ":" + "-".repeat(width - 1);

        case "right":
          return "-".repeat(width - 1) + ":";

        case "center":
          return ":" + "-".repeat(width - 2) + ":";

        default:
          return "-".repeat(width);
      }
    })), " |"]);
  }

  function printRow(rowContents) {
    return concat$11(["| ", join$8(" | ", rowContents.map(function (rowContent, columnIndex) {
      switch (node.align[columnIndex]) {
        case "right":
          return alignRight(rowContent, columnMaxWidths[columnIndex]);

        case "center":
          return alignCenter(rowContent, columnMaxWidths[columnIndex]);

        default:
          return alignLeft(rowContent, columnMaxWidths[columnIndex]);
      }
    })), " |"]);
  }

  function alignLeft(text, width) {
    return concat$11([text, " ".repeat(width - util.getStringWidth(text))]);
  }

  function alignRight(text, width) {
    return concat$11([" ".repeat(width - util.getStringWidth(text)), text]);
  }

  function alignCenter(text, width) {
    var spaces = width - util.getStringWidth(text);
    var left = Math.floor(spaces / 2);
    var right = spaces - left;
    return concat$11([" ".repeat(left), text, " ".repeat(right)]);
  }
}

function printRoot(path, options, print) {
  /** @typedef {{ index: number, offset: number }} IgnorePosition */

  /** @type {Array<{start: IgnorePosition, end: IgnorePosition}>} */
  var ignoreRanges = [];
  /** @type {IgnorePosition | null} */

  var ignoreStart = null;
  var children = path.getValue().children;
  children.forEach(function (childNode, index) {
    switch (isPrettierIgnore(childNode)) {
      case "start":
        if (ignoreStart === null) {
          ignoreStart = {
            index: index,
            offset: childNode.position.end.offset
          };
        }

        break;

      case "end":
        if (ignoreStart !== null) {
          ignoreRanges.push({
            start: ignoreStart,
            end: {
              index: index,
              offset: childNode.position.start.offset
            }
          });
          ignoreStart = null;
        }

        break;

      default:
        // do nothing
        break;
    }
  });
  return printChildren(path, options, print, {
    processor: function processor(childPath, index) {
      if (ignoreRanges.length !== 0) {
        var ignoreRange = ignoreRanges[0];

        if (index === ignoreRange.start.index) {
          return concat$11([children[ignoreRange.start.index].value, options.originalText.slice(ignoreRange.start.offset, ignoreRange.end.offset), children[ignoreRange.end.index].value]);
        }

        if (ignoreRange.start.index < index && index < ignoreRange.end.index) {
          return false;
        }

        if (index === ignoreRange.end.index) {
          ignoreRanges.shift();
          return false;
        }
      }

      return childPath.call(print);
    }
  });
}

function printChildren(path, options, print, events) {
  events = events || {};
  var postprocessor = events.postprocessor || concat$11;

  var processor = events.processor || function (childPath) {
    return childPath.call(print);
  };

  var node = path.getValue();
  var parts = [];
  var lastChildNode;
  path.map(function (childPath, index) {
    var childNode = childPath.getValue();
    var result = processor(childPath, index);

    if (result !== false) {
      var data = {
        parts: parts,
        prevNode: lastChildNode,
        parentNode: node,
        options: options
      };

      if (!shouldNotPrePrintHardline(childNode, data)) {
        parts.push(hardline$10);

        if (shouldPrePrintDoubleHardline(childNode, data) || shouldPrePrintTripleHardline(childNode, data)) {
          parts.push(hardline$10);
        }

        if (shouldPrePrintTripleHardline(childNode, data)) {
          parts.push(hardline$10);
        }
      }

      parts.push(result);
      lastChildNode = childNode;
    }
  }, "children");
  return postprocessor(parts);
}
/** @return {false | 'next' | 'start' | 'end'} */


function isPrettierIgnore(node) {
  if (node.type !== "html") {
    return false;
  }

  var match = node.value.match(/^<!--\s*prettier-ignore(?:-(start|end))?\s*-->$/);
  return match === null ? false : match[1] ? match[1] : "next";
}

function shouldNotPrePrintHardline(node, data) {
  var isFirstNode = data.parts.length === 0;
  var isInlineNode = INLINE_NODE_TYPES.indexOf(node.type) !== -1;
  var isInlineHTML = node.type === "html" && INLINE_NODE_WRAPPER_TYPES.indexOf(data.parentNode.type) !== -1;
  return isFirstNode || isInlineNode || isInlineHTML;
}

function shouldPrePrintDoubleHardline(node, data) {
  var isSequence = (data.prevNode && data.prevNode.type) === node.type;
  var isSiblingNode = isSequence && SIBLING_NODE_TYPES.indexOf(node.type) !== -1;
  var isInTightListItem = data.parentNode.type === "listItem" && !data.parentNode.loose;
  var isPrevNodeLooseListItem = data.prevNode && data.prevNode.type === "listItem" && data.prevNode.loose;
  var isPrevNodePrettierIgnore = isPrettierIgnore(data.prevNode) === "next";
  var isBlockHtmlWithoutBlankLineBetweenPrevHtml = node.type === "html" && data.prevNode && data.prevNode.type === "html" && data.prevNode.position.end.line + 1 === node.position.start.line;
  return isPrevNodeLooseListItem || !(isSiblingNode || isInTightListItem || isPrevNodePrettierIgnore || isBlockHtmlWithoutBlankLineBetweenPrevHtml);
}

function shouldPrePrintTripleHardline(node, data) {
  var isPrevNodeList = data.prevNode && data.prevNode.type === "list";
  var isIndentedCode = node.type === "code" && node.isIndented;
  return isPrevNodeList && isIndentedCode;
}

function shouldRemainTheSameContent(path) {
  var ancestorNode = getAncestorNode$2(path, ["linkReference", "imageReference"]);
  return ancestorNode && (ancestorNode.type !== "linkReference" || ancestorNode.referenceType !== "full");
}

function normalizeDoc(doc$$2) {
  return mapDoc$4(doc$$2, function (currentDoc) {
    if (!currentDoc.parts) {
      return currentDoc;
    }

    if (currentDoc.type === "concat" && currentDoc.parts.length === 1) {
      return currentDoc.parts[0];
    }

    var parts = [];
    currentDoc.parts.forEach(function (part) {
      if (part.type === "concat") {
        parts.push.apply(parts, part.parts);
      } else if (part !== "") {
        parts.push(part);
      }
    });
    return Object.assign({}, currentDoc, {
      parts: normalizeParts(parts)
    });
  });
}

function printUrl(url, dangerousCharOrChars) {
  var dangerousChars = [" "].concat(dangerousCharOrChars || []);
  return new RegExp(dangerousChars.map(function (x) {
    return "\\".concat(x);
  }).join("|")).test(url) ? "<".concat(url, ">") : url;
}

function printTitle(title, options, printSpace) {
  if (printSpace == null) {
    printSpace = true;
  }

  if (!title) {
    return "";
  }

  if (printSpace) {
    return " " + printTitle(title, options, false);
  }

  if (title.includes('"') && title.includes("'") && !title.includes(")")) {
    return "(".concat(title, ")"); // avoid escaped quotes
  } // faster than using RegExps: https://jsperf.com/performance-of-match-vs-split


  var singleCount = title.split("'").length - 1;
  var doubleCount = title.split('"').length - 1;
  var quote = singleCount > doubleCount ? '"' : doubleCount > singleCount ? "'" : options.singleQuote ? "'" : '"';
  title = title.replace(new RegExp("(".concat(quote, ")"), "g"), "\\$1");
  return "".concat(quote).concat(title).concat(quote);
}

function normalizeParts(parts) {
  return parts.reduce(function (current, part) {
    var lastPart = util.getLast(current);

    if (typeof lastPart === "string" && typeof part === "string") {
      current.splice(-1, 1, lastPart + part);
    } else {
      current.push(part);
    }

    return current;
  }, []);
}

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function clean$7(ast, newObj, parent) {
  delete newObj.position;
  delete newObj.raw; // front-matter
  // for codeblock

  if (ast.type === "code" || ast.type === "yaml") {
    delete newObj.value;
  }

  if (ast.type === "list") {
    delete newObj.isAligned;
  } // for whitespace: "\n" and " " are considered the same


  if (ast.type === "whitespace" && ast.value === "\n") {
    newObj.value = " ";
  } // for insert pragma


  if (parent && parent.type === "root" && parent.children.length > 0 && (parent.children[0] === ast || (parent.children[0].type === "yaml" || parent.children[0].type === "toml") && parent.children[1] === ast) && ast.type === "html" && pragma$6.startWithPragma(ast.value)) {
    return null;
  }
}

function hasPrettierIgnore$1(path) {
  var index = +path.getName();

  if (index === 0) {
    return false;
  }

  var prevNode = path.getParentNode().children[index - 1];
  return isPrettierIgnore(prevNode) === "next";
}

var printerMarkdown = {
  print: genericPrint$5,
  embed: embed_1$4,
  massageAstNode: clean$7,
  hasPrettierIgnore: hasPrettierIgnore$1,
  insertPragma: pragma$6.insertPragma
};

var options$12 = {
  proseWrap: commonOptions.proseWrap,
  singleQuote: commonOptions.singleQuote
};

var name$13 = "Markdown";
var type$12 = "prose";
var aliases$4 = ["pandoc"];
var aceMode$12 = "markdown";
var codemirrorMode$9 = "gfm";
var codemirrorMimeType$9 = "text/x-gfm";
var wrap = true;
var extensions$12 = [".md", ".markdown", ".mdown", ".mdwn", ".mkd", ".mkdn", ".mkdown", ".ronn", ".workbook"];
var tmScope$12 = "source.gfm";
var languageId$12 = 222;
var markdown = {
  name: name$13,
  type: type$12,
  aliases: aliases$4,
  aceMode: aceMode$12,
  codemirrorMode: codemirrorMode$9,
  codemirrorMimeType: codemirrorMimeType$9,
  wrap: wrap,
  extensions: extensions$12,
  tmScope: tmScope$12,
  languageId: languageId$12
};

var markdown$1 = Object.freeze({
	name: name$13,
	type: type$12,
	aliases: aliases$4,
	aceMode: aceMode$12,
	codemirrorMode: codemirrorMode$9,
	codemirrorMimeType: codemirrorMimeType$9,
	wrap: wrap,
	extensions: extensions$12,
	tmScope: tmScope$12,
	languageId: languageId$12,
	default: markdown
});

var require$$0$15 = ( markdown$1 && markdown ) || markdown$1;

var languages$4 = [languageExtend({}, require$$0$15, {
  since: "1.8.0",
  parsers: ["remark"],
  filenames: ["README"],
  vscodeLanguageIds: ["markdown"]
})];
var printers$4 = {
  mdast: printerMarkdown
};
var languageMarkdown = {
  languages: languages$4,
  options: options$12,
  printers: printers$4
};

var _require$$0$builders$9 = doc.builders;
var concat$14 = _require$$0$builders$9.concat;
var hardline$13 = _require$$0$builders$9.hardline;

function embed$6(path, print, textToDoc, options) {
  var node = path.getValue();
  var parent = path.getParentNode();

  if (!parent || parent.tag !== "root" || node.unary) {
    return null;
  }

  var parser;

  if (node.tag === "style") {
    var langAttr = node.attrs.find(function (attr) {
      return attr.name === "lang";
    });

    if (!langAttr || langAttr.value === "postcss") {
      parser = "css";
    } else if (langAttr.value === "scss") {
      parser = "scss";
    } else if (langAttr.value === "less") {
      parser = "less";
    }
  }

  if (node.tag === "script") {
    var _langAttr = node.attrs.find(function (attr) {
      return attr.name === "lang";
    });

    if (!_langAttr) {
      parser = "babylon";
    } else if (_langAttr.value === "ts" || _langAttr.value === "tsx") {
      parser = "typescript";
    }
  }

  if (!parser) {
    return null;
  }

  return concat$14([options.originalText.slice(node.start, node.contentStart), hardline$13, textToDoc(options.originalText.slice(node.contentStart, node.contentEnd), {
    parser: parser
  }), options.originalText.slice(node.contentEnd, node.end)]);
}

var embed_1$6 = embed$6;

function hasPragma$3(text) {
  return /^\s*<!--\s*@(format|prettier)\s*-->/.test(text);
}

function insertPragma$7(text) {
  return "<!-- @format -->\n\n" + text.replace(/^\s*\n/, "");
}

var pragma$9 = {
  hasPragma: hasPragma$3,
  insertPragma: insertPragma$7
};

var _require$$0$builders$8 = doc.builders;
var concat$13 = _require$$0$builders$8.concat;
var hardline$12 = _require$$0$builders$8.hardline;
var insertPragma$6 = pragma$9.insertPragma;

function genericPrint$6(path, options, print) {
  var n = path.getValue();
  var res = [];
  var index = n.start;
  path.each(function (childPath) {
    var child = childPath.getValue();
    res.push(options.originalText.slice(index, child.start));
    res.push(childPath.call(print));
    index = child.end;
  }, "children"); // If there are no children, we just print the node from start to end.
  // Otherwise, index should point to the end of the last child, and we
  // need to print the closing tag.

  res.push(options.originalText.slice(index, n.end)); // Only force a trailing newline if there were any contents.

  if (n.tag === "root" && n.children.length) {
    res.push(hardline$12);
  }

  return concat$13(res);
}

var clean$8 = function clean(ast, newObj) {
  delete newObj.start;
  delete newObj.end;
  delete newObj.contentStart;
  delete newObj.contentEnd;
};

var printerVue = {
  print: genericPrint$6,
  embed: embed_1$6,
  insertPragma: insertPragma$6,
  massageAstNode: clean$8,
  canAttachComment: function canAttachComment(node) {
    return typeof node.tag === "string";
  }
};

var name$14 = "Vue";
var type$13 = "markup";
var color$3 = "#2c3e50";
var extensions$13 = [".vue"];
var tmScope$13 = "text.html.vue";
var aceMode$13 = "html";
var languageId$13 = 391;
var vue = {
  name: name$14,
  type: type$13,
  color: color$3,
  extensions: extensions$13,
  tmScope: tmScope$13,
  aceMode: aceMode$13,
  languageId: languageId$13
};

var vue$1 = Object.freeze({
	name: name$14,
	type: type$13,
	color: color$3,
	extensions: extensions$13,
	tmScope: tmScope$13,
	aceMode: aceMode$13,
	languageId: languageId$13,
	default: vue
});

var require$$0$16 = ( vue$1 && vue ) || vue$1;

var languages$5 = [languageExtend({}, require$$0$16, {
  since: "1.10.0",
  parsers: ["vue"],
  vscodeLanguageIds: ["vue"]
})];
var printers$5 = {
  vue: printerVue
};
var languageVue = {
  languages: languages$5,
  printers: printers$5
};

function isPragma$1(text) {
  return /^\s*@(prettier|format)\s*$/.test(text);
}

function hasPragma$4(text) {
  return /^\s*#[^\n\S]*@(prettier|format)\s*?(\n|$)/.test(text);
}

function insertPragma$9(text) {
  return "# @format\n\n".concat(text);
}

var pragma$11 = {
  isPragma: isPragma$1,
  hasPragma: hasPragma$4,
  insertPragma: insertPragma$9
};

function getLast$6(array) {
  return array[array.length - 1];
}

function getAncestorCount$1(path, filter) {
  var counter = 0;
  var pathStackLength = path.stack.length - 1;

  for (var i = 0; i < pathStackLength; i++) {
    var value = path.stack[i];

    if (isNode$1(value) && filter(value)) {
      counter++;
    }
  }

  return counter;
}

function isNode$1(value) {
  return value && typeof value.type === "string";
}

function mapNode(node, callback, parent) {
  return callback("children" in node ? Object.assign({}, node, {
    children: node.children.map(function (childNode) {
      return mapNode(childNode, callback, node);
    })
  }) : node, parent);
}

function defineShortcut(x, key, getter) {
  Object.defineProperty(x, key, {
    get: getter,
    enumerable: false
  });
}

function createNull() {
  return {
    type: "null",
    position: {
      start: {
        line: -1,
        column: -1,
        offset: -1
      },
      end: {
        line: -1,
        column: -1,
        offset: -1
      }
    }
  };
}

function isNextLineEmpty$6(node, text) {
  var newlineCount = 0;
  var textLength = text.length;

  for (var i = node.position.end.offset - 1; i < textLength; i++) {
    var char = text[i];

    if (char === "\n") {
      newlineCount++;
    }

    if (newlineCount === 1 && /\S/.test(char)) {
      return false;
    }

    if (newlineCount === 2) {
      return true;
    }
  }

  return false;
}

function isLastDescendantNode$1(path) {
  var node = path.getValue();

  switch (node.type) {
    case "comment":
    case "verbatimTag":
    case "shorthandTag":
    case "nonSpecificTag":
      return false;
  }

  var pathStackLength = path.stack.length;

  for (var i = 1; i < pathStackLength; i++) {
    var item = path.stack[i];
    var parentItem = path.stack[i - 1];

    if (Array.isArray(parentItem) && typeof item === "number" && item !== parentItem.length - 1) {
      return false;
    }
  }

  return true;
}

function getLastDescendantNode$1(node) {
  return "children" in node && node.children.length !== 0 ? getLastDescendantNode$1(getLast$6(node.children)) : node;
}

function isPrettierIgnore$1(comment) {
  return comment.value.trim() === "prettier-ignore";
}

function hasPrettierIgnore$3(path) {
  var node = path.getValue();

  if (node.type === "documentBody") {
    var document = path.getParentNode();
    return document.head.children.length !== 0 && function (lastItem) {
      return lastItem.type === "comment" && isPrettierIgnore$1(lastItem);
    }(getLast$6(document.head.children));
  }

  return "leadingComments" in node && node.leadingComments.length !== 0 && isPrettierIgnore$1(getLast$6(node.leadingComments));
}

function hasExplicitDocumentEndMarker$1(document, text) {
  return text.slice(document.position.end.offset - 4, document.position.end.offset) === "\n...";
}

function isBlockValue$1(node) {
  switch (node.type) {
    case "blockFolded":
    case "blockLiteral":
      return true;

    default:
      return false;
  }
}

function hasLeadingComments$1(node) {
  return "leadingComments" in node && node.leadingComments.length !== 0;
}

function hasMiddleComments$1(node) {
  return "middleComments" in node && node.middleComments.length !== 0;
}

function hasTrailingComments$1(node) {
  return "trailingComments" in node && node.trailingComments.length !== 0;
}

function hasEndComments$1(node) {
  return "endComments" in node && node.endComments.length !== 0;
}
/**
 * " a   b c   d e   f " -> [" a   b", "c   d", "e   f "]
 */


function splitWithSingleSpace(text) {
  var parts = [];
  var lastPart = undefined;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = text.split(/( +)/g)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var part = _step.value;

      if (part !== " ") {
        if (lastPart === " ") {
          parts.push(part);
        } else {
          parts.push((parts.pop() || "") + part);
        }
      } else if (lastPart === undefined) {
        parts.unshift("");
      }

      lastPart = part;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (lastPart === " ") {
    parts.push((parts.pop() || "") + " ");
  }

  if (parts[0] === "") {
    parts.shift();
    parts.unshift(" " + (parts.shift() || ""));
  }

  return parts;
}

function getFlowScalarLineContents$1(nodeType, content, options) {
  var rawLineContents = content.split("\n").map(function (lineContent, index, lineContents) {
    return index === 0 && index === lineContents.length - 1 ? lineContent : index !== 0 && index !== lineContents.length - 1 ? lineContent.trim() : index === 0 ? lineContent.trimRight() : lineContent.trimLeft();
  });

  if (options.proseWrap === "preserve") {
    return rawLineContents.map(function (lineContent) {
      return lineContent.length === 0 ? [] : [lineContent];
    });
  }

  return rawLineContents.map(function (lineContent) {
    return lineContent.length === 0 ? [] : splitWithSingleSpace(lineContent);
  }).reduce(function (reduced, lineContentWords, index) {
    return index !== 0 && rawLineContents[index - 1].length !== 0 && lineContentWords.length !== 0 && !( // trailing backslash in quoteDouble should be preserved
    nodeType === "quoteDouble" && getLast$6(getLast$6(reduced)).endsWith("\\")) ? reduced.concat([reduced.pop().concat(lineContentWords)]) : reduced.concat([lineContentWords]);
  }, []).map(function (lineContentWords) {
    return options.proseWrap === "never" ? [lineContentWords.join(" ")] : lineContentWords;
  });
}

function getBlockValueLineContents$1(node, _ref) {
  var parentIndent = _ref.parentIndent,
      isLastDescendant = _ref.isLastDescendant,
      options = _ref.options;
  var content = node.position.start.line === node.position.end.line ? "" : options.originalText.slice(node.position.start.offset, node.position.end.offset) // exclude open line `>` or `|`
  .match(/^[^\n]*?\n([\s\S]*)$/)[1];
  var leadingSpaceCount = node.indent === null ? function (match) {
    return match ? match[1].length : Infinity;
  }(content.match(/^( *)\S/m)) : node.indent - 1 + parentIndent;
  var rawLineContents = content.split("\n").map(function (lineContent) {
    return lineContent.slice(leadingSpaceCount);
  });

  if (options.proseWrap === "preserve" || node.type === "blockLiteral") {
    return removeUnnecessaryTrailingNewlines(rawLineContents.map(function (lineContent) {
      return lineContent.length === 0 ? [] : [lineContent];
    }));
  }

  return removeUnnecessaryTrailingNewlines(rawLineContents.map(function (lineContent) {
    return lineContent.length === 0 ? [] : splitWithSingleSpace(lineContent);
  }).reduce(function (reduced, lineContentWords, index) {
    return index !== 0 && rawLineContents[index - 1].length !== 0 && lineContentWords.length !== 0 && !/^\s/.test(lineContentWords[0]) && !/^\s|\s$/.test(getLast$6(reduced)) ? reduced.concat([reduced.pop().concat(lineContentWords)]) : reduced.concat([lineContentWords]);
  }, []).map(function (lineContentWords) {
    return lineContentWords.reduce(function (reduced, word) {
      return (// disallow trailing spaces
        reduced.length !== 0 && /\s$/.test(getLast$6(reduced)) ? reduced.concat(reduced.pop() + " " + word) : reduced.concat(word)
      );
    }, []);
  }).map(function (lineContentWords) {
    return options.proseWrap === "never" ? [lineContentWords.join(" ")] : lineContentWords;
  }));

  function removeUnnecessaryTrailingNewlines(lineContents) {
    if (node.chomping === "keep") {
      return getLast$6(lineContents).length === 0 ? lineContents.slice(0, -1) : lineContents;
    }

    var trailingNewlineCount = 0;

    for (var i = lineContents.length - 1; i >= 0; i--) {
      if (lineContents[i].length === 0) {
        trailingNewlineCount++;
      } else {
        break;
      }
    }

    return trailingNewlineCount === 0 ? lineContents : trailingNewlineCount >= 2 && !isLastDescendant ? // next empty line
    lineContents.slice(0, -(trailingNewlineCount - 1)) : lineContents.slice(0, -trailingNewlineCount);
  }
}

var utils$8 = {
  getLast: getLast$6,
  getAncestorCount: getAncestorCount$1,
  isNode: isNode$1,
  isBlockValue: isBlockValue$1,
  mapNode: mapNode,
  defineShortcut: defineShortcut,
  createNull: createNull,
  isNextLineEmpty: isNextLineEmpty$6,
  isLastDescendantNode: isLastDescendantNode$1,
  getBlockValueLineContents: getBlockValueLineContents$1,
  getFlowScalarLineContents: getFlowScalarLineContents$1,
  getLastDescendantNode: getLastDescendantNode$1,
  hasPrettierIgnore: hasPrettierIgnore$3,
  hasLeadingComments: hasLeadingComments$1,
  hasMiddleComments: hasMiddleComments$1,
  hasTrailingComments: hasTrailingComments$1,
  hasEndComments: hasEndComments$1,
  hasExplicitDocumentEndMarker: hasExplicitDocumentEndMarker$1
};

var insertPragma$8 = pragma$11.insertPragma;
var isPragma = pragma$11.isPragma;
var getAncestorCount = utils$8.getAncestorCount;
var getBlockValueLineContents = utils$8.getBlockValueLineContents;
var getFlowScalarLineContents = utils$8.getFlowScalarLineContents;
var getLast$5 = utils$8.getLast;
var getLastDescendantNode = utils$8.getLastDescendantNode;
var hasExplicitDocumentEndMarker = utils$8.hasExplicitDocumentEndMarker;
var hasLeadingComments = utils$8.hasLeadingComments;
var hasMiddleComments = utils$8.hasMiddleComments;
var hasTrailingComments = utils$8.hasTrailingComments;
var hasEndComments = utils$8.hasEndComments;
var hasPrettierIgnore$2 = utils$8.hasPrettierIgnore;
var isLastDescendantNode = utils$8.isLastDescendantNode;
var isNextLineEmpty$5 = utils$8.isNextLineEmpty;
var isNode = utils$8.isNode;
var isBlockValue = utils$8.isBlockValue;
var docBuilders$3 = doc.builders;
var conditionalGroup$2 = docBuilders$3.conditionalGroup;
var breakParent$3 = docBuilders$3.breakParent;
var concat$15 = docBuilders$3.concat;
var dedent$4 = docBuilders$3.dedent;
var dedentToRoot$2 = docBuilders$3.dedentToRoot;
var fill$5 = docBuilders$3.fill;
var group$13 = docBuilders$3.group;
var hardline$14 = docBuilders$3.hardline;
var ifBreak$5 = docBuilders$3.ifBreak;
var join$9 = docBuilders$3.join;
var line$8 = docBuilders$3.line;
var lineSuffix$2 = docBuilders$3.lineSuffix;
var literalline$6 = docBuilders$3.literalline;
var markAsRoot$4 = docBuilders$3.markAsRoot;
var softline$7 = docBuilders$3.softline;

function genericPrint$7(path, options, print) {
  var node = path.getValue();
  var parentNode = path.getParentNode();
  var tag = "tag" in node && node.tag.type !== "null" ? path.call(print, "tag") : "";
  var anchor = "anchor" in node && node.anchor.type !== "null" ? path.call(print, "anchor") : "";
  var nextEmptyLine = (node.type === "mapping" || node.type === "sequence" || node.type === "comment" || node.type === "directive" || node.type === "mappingItem" || node.type === "sequenceItem") && !isLastDescendantNode(path) ? printNextEmptyLine(path, options.originalText) : "";
  return concat$15([node.type !== "mappingValue" && hasLeadingComments(node) ? concat$15([join$9(hardline$14, path.map(print, "leadingComments")), hardline$14]) : "", tag, tag && anchor ? " " : "", anchor, (node.type === "sequence" || node.type === "mapping") && node.middleComments.length === 0 ? tag || anchor ? hardline$14 : "" : tag || anchor ? " " : "", hasMiddleComments(node) ? concat$15([node.middleComments.length === 1 ? "" : hardline$14, join$9(hardline$14, path.map(print, "middleComments")), hardline$14]) : "", hasPrettierIgnore$2(path) ? options.originalText.slice(node.position.start.offset, node.position.end.offset) : group$13(_print(node, parentNode, path, options, print)), !isBlockValue(node) && hasTrailingComments(node) // trailing comments for block value are handled themselves
  ? lineSuffix$2(concat$15([" ", parentNode.type === "mappingKey" && path.getParentNode(2).type === "mapping" && isInlineNode(node) ? "" : breakParent$3, join$9(hardline$14, path.map(print, "trailingComments"))])) : "", nextEmptyLine, hasEndComments(node) ? function (endComments) {
    return node.type === "sequenceItem" ? align$3(2, endComments) : endComments;
  }(concat$15([hardline$14, join$9(hardline$14, path.map(print, "endComments"))])) : ""]);
}

function _print(node, parentNode, path, options, print) {
  switch (node.type) {
    case "root":
      return concat$15([concat$15(path.map(function (childPath, index) {
        return index === node.children.length - 1 ? print(childPath) : concat$15([print(childPath), hasTrailingComments(node.children[index]) || childPath.call(hasPrettierIgnore$2, "body") && hasExplicitDocumentEndMarker(node.children[index], options.originalText) ? "" : concat$15([hardline$14, node.children[index + 1].head.children.length === 0 ? "---" : "..."]), hardline$14]);
      }, "children")), node.children.length === 0 || function (lastDescendantNode) {
        return isBlockValue(lastDescendantNode) && lastDescendantNode.chomping === "keep";
      }(getLastDescendantNode(node)) ? "" : hardline$14]);

    case "document":
      return concat$15([node.head.children.length === 0 ? path.call(print, "body") : join$9(hardline$14, [path.call(print, "head"), "---"].concat(node.body.children.length === 0 ? [] : path.call(print, "body"))), hasTrailingComments(node) ? concat$15([hardline$14, "..."]) : ""]);

    case "documentHead":
    case "documentBody":
      return join$9(hardline$14, path.map(print, "children"));

    case "directive":
      return concat$15(["%", join$9(" ", [node.name].concat(node.parameters))]);

    case "comment":
      return concat$15(["#", node.value]);

    case "alias":
      return concat$15(["*", node.value]);

    case "null":
      return "";

    case "verbatimTag":
      return concat$15(["!<", node.value, ">"]);

    case "shorthandTag":
      return concat$15([node.handle, node.suffix]);

    case "nonSpecificTag":
      return "!";

    case "anchor":
      return concat$15(["&", node.value]);

    case "plain":
      return printFlowScalarContent(node.type, options.originalText.slice(node.position.start.offset, node.position.end.offset), options);

    case "quoteDouble":
    case "quoteSingle":
      {
        var singleQuote = "'";
        var doubleQuote = '"';
        var raw = options.originalText.slice(node.position.start.offset + 1, node.position.end.offset - 1);

        if (node.type === "quoteSingle" && raw.includes("\\") || node.type === "quoteDouble" && /\\[^"]/.test(raw)) {
          // only quoteDouble can use escape chars
          // and quoteSingle do not need to escape backslashes
          var originalQuote = node.type === "quoteDouble" ? doubleQuote : singleQuote;
          return concat$15([originalQuote, printFlowScalarContent(node.type, raw, options), originalQuote]);
        } else if (raw.includes(doubleQuote)) {
          return concat$15([singleQuote, printFlowScalarContent(node.type, node.type === "quoteDouble" ? // double quote needs to be escaped by backslash in quoteDouble
          raw.replace(/\\"/g, doubleQuote) : raw, options), singleQuote]);
        }

        if (raw.includes(singleQuote)) {
          return concat$15([doubleQuote, printFlowScalarContent(node.type, node.type === "quoteSingle" ? // single quote needs to be escaped by 2 single quotes in quoteSingle
          raw.replace(/''/g, singleQuote) : raw, options), doubleQuote]);
        }

        var quote = options.singleQuote ? singleQuote : doubleQuote;
        return concat$15([quote, printFlowScalarContent(node.type, raw, options), quote]);
      }

    case "blockFolded":
    case "blockLiteral":
      {
        var parentIndent = getAncestorCount(path, function (ancestorNode) {
          return ancestorNode.type === "sequence" || ancestorNode.type === "mapping";
        });
        var isLastDescendant = isLastDescendantNode(path);
        return concat$15([node.type === "blockFolded" ? ">" : "|", node.indent === null ? "" : node.indent.toString(), node.chomping === "clip" ? "" : node.chomping === "keep" ? "+" : "-", hasTrailingComments(node) ? concat$15([" ", join$9(hardline$14, path.map(print, "trailingComments"))]) : "", (node.indent === null ? dedent$4 : dedentToRoot$2)(align$3(node.indent === null ? options.tabWidth : node.indent - 1 + parentIndent, concat$15(getBlockValueLineContents(node, {
          parentIndent: parentIndent,
          isLastDescendant: isLastDescendant,
          options: options
        }).reduce(function (reduced, lineWords, index, lineContents) {
          return reduced.concat(index === 0 ? hardline$14 : lineContents[index - 1].length === 0 ? hardline$14 : index === lineContents.length - 1 && lineWords.length === 0 ? dedentToRoot$2(literalline$6) : markAsRoot$4(literalline$6), fill$5(join$9(line$8, lineWords).parts), index === lineContents.length - 1 && node.chomping === "keep" && isLastDescendant ? lineWords.length === 0 || !getLast$5(lineWords).endsWith(" ") ? dedentToRoot$2(hardline$14) : dedentToRoot$2(literalline$6) : []);
        }, []))))]);
      }

    case "sequence":
      return join$9(hardline$14, path.map(print, "children"));

    case "sequenceItem":
      return concat$15(["- ", align$3(2, path.call(print, "node"))]);

    case "mappingKey":
      return path.call(print, "node");

    case "mappingValue":
      return path.call(print, "node");

    case "mapping":
      return join$9(hardline$14, path.map(print, "children"));

    case "mappingItem":
    case "flowMappingItem":
      {
        if (node.key.type === "null" && node.value.type === "null") {
          return concat$15([":", line$8]);
        }

        var key = path.call(print, "key");
        var value = path.call(print, "value");

        if (node.value.type === "null") {
          return node.type === "flowMappingItem" && path.getParentNode().type !== "flowSequence" ? key : concat$15(["? ", align$3(2, key)]);
        }

        if (node.key.type === "null") {
          return concat$15([":", node.value.node.type === "null" ? "" : " ", align$3(2, value)]);
        }

        var groupId = Symbol("mappingKey");
        var forceExplicitKey = hasLeadingComments(node.value) || node.key.type !== "null" && !isInlineNode(node.key.node);
        return forceExplicitKey ? concat$15(["? ", align$3(2, key), hardline$14, join$9("", path.map(print, "value", "leadingComments").map(function (comment) {
          return concat$15([comment, hardline$14]);
        })), ": ", align$3(2, value)]) : // force singleline
        isSingleLineNode(node.key.node) && !hasLeadingComments(node.key.node) && !hasMiddleComments(node.key.node) && !hasTrailingComments(node.key.node) && !hasEndComments(node.key) && !hasLeadingComments(node.value.node) && !hasMiddleComments(node.value.node) && !hasEndComments(node.value) && isAbsolutelyPrintedAsSingleLineNode(node.value.node, options) ? concat$15([key, needsSpaceInFrontOfMappingValue(node) ? " " : "", ": ", value]) : conditionalGroup$2([concat$15([group$13(concat$15([ifBreak$5("? "), group$13(align$3(2, key), {
          id: groupId
        })])), ifBreak$5(concat$15([hardline$14, ": ", align$3(2, value)]), indent(concat$15([needsSpaceInFrontOfMappingValue(node) ? " " : "", ":", hasLeadingComments(node.value.node) || hasEndComments(node.value) && node.value.node.type !== "null" || parentNode.type === "mapping" && hasTrailingComments(node.key.node) && isInlineNode(node.value.node) || (node.value.node.type === "mapping" || node.value.node.type === "sequence") && node.value.node.tag.type === "null" && node.value.node.anchor.type === "null" ? hardline$14 : node.value.node.type === "null" ? "" : line$8, value])), {
          groupId: groupId
        })])]);
      }

    case "flowMapping":
    case "flowSequence":
      {
        var openMarker = node.type === "flowMapping" ? "{" : "[";
        var closeMarker = node.type === "flowMapping" ? "}" : "]";
        var bracketSpacing = node.type === "flowMapping" && node.children.length !== 0 && options.bracketSpacing ? line$8 : softline$7;

        var isLastItemEmptyMappingItem = node.children.length !== 0 && function (lastItem) {
          return lastItem.type === "flowMappingItem" && lastItem.key.type === "null" && lastItem.value.type === "null";
        }(getLast$5(node.children));

        return concat$15([openMarker, indent(concat$15([bracketSpacing, concat$15(path.map(function (childPath, index) {
          return concat$15([print(childPath), index === node.children.length - 1 ? "" : concat$15([",", line$8, node.children[index].position.start.line !== node.children[index + 1].position.start.line ? printNextEmptyLine(childPath, options.originalText) : ""])]);
        }, "children")), ifBreak$5(",", "")])), isLastItemEmptyMappingItem ? "" : bracketSpacing, closeMarker]);
      }

    case "flowSequenceItem":
      return path.call(print, "node");
    // istanbul ignore next

    default:
      throw new Error("Unexpected node type ".concat(node.type));
  }

  function indent(doc$$2) {
    return docBuilders$3.align(" ".repeat(options.tabWidth), doc$$2);
  }
}

function align$3(n, doc$$2) {
  return typeof n === "number" && n > 0 ? docBuilders$3.align(" ".repeat(n), doc$$2) : docBuilders$3.align(n, doc$$2);
}

function isInlineNode(node) {
  switch (node.type) {
    case "plain":
    case "quoteDouble":
    case "quoteSingle":
    case "alias":
    case "flowMapping":
    case "flowSequence":
    case "null":
      return true;

    default:
      return false;
  }
}

function isSingleLineNode(node) {
  switch (node.type) {
    case "plain":
    case "quoteDouble":
    case "quoteSingle":
      return node.position.start.line === node.position.end.line;

    case "alias":
      return true;

    default:
      return false;
  }
}

function isAbsolutelyPrintedAsSingleLineNode(node, options) {
  switch (node.type) {
    case "plain":
    case "quoteSingle":
    case "quoteDouble":
      break;

    case "alias":
      return true;

    default:
      return false;
  }

  if (options.proseWrap === "preserve") {
    return node.position.start.line === node.position.end.line;
  }

  if ( // backslash-newline
  /\\$/m.test(options.originalText.slice(node.position.start.offset, node.position.end.offset))) {
    return false;
  }

  switch (options.proseWrap) {
    case "never":
      return node.value.indexOf("\n") === -1;

    case "always":
      return !/[\n ]/.test(node.value);
    // istanbul ignore next

    default:
      return false;
  }
}

function needsSpaceInFrontOfMappingValue(node) {
  // istanbul ignore else
  if (node.key.type !== "null") {
    switch (node.key.node.type) {
      case "alias":
        return true;
    }
  }

  return false;
}

function printNextEmptyLine(path, originalText) {
  var node = path.getValue();
  var root = path.stack[0];
  root.isNextEmptyLinePrintedChecklist = root.isNextEmptyLinePrintedChecklist || [];

  if (!root.isNextEmptyLinePrintedChecklist[node.position.end.line]) {
    if (isNextLineEmpty$5(node, originalText)) {
      root.isNextEmptyLinePrintedChecklist[node.position.end.line] = true;
      return softline$7;
    }
  }

  return "";
}

function printFlowScalarContent(nodeType, content, options) {
  var lineContents = getFlowScalarLineContents(nodeType, content, options);
  return join$9(hardline$14, lineContents.map(function (lineContentWords) {
    return fill$5(join$9(line$8, lineContentWords).parts);
  }));
}

function clean$9(node, newNode
/*, parent */
) {
  if (isNode(newNode)) {
    delete newNode.position;

    switch (newNode.type) {
      case "comment":
        // insert pragma
        if (isPragma(newNode.value)) {
          return null;
        }

        break;

      case "quoteDouble":
      case "quoteSingle":
        newNode.type = "quote";
        break;
    }
  }
}

var printerYaml = {
  print: genericPrint$7,
  massageAstNode: clean$9,
  insertPragma: insertPragma$8
};

var options$15 = {
  bracketSpacing: commonOptions.bracketSpacing,
  singleQuote: commonOptions.singleQuote,
  proseWrap: commonOptions.proseWrap
};

var name$15 = "YAML";
var type$14 = "data";
var tmScope$14 = "source.yaml";
var aliases$5 = ["yml"];
var extensions$14 = [".yml", ".mir", ".reek", ".rviz", ".sublime-syntax", ".syntax", ".yaml", ".yaml-tmlanguage", ".yml.mysql"];
var filenames$3 = [".clang-format", ".clang-tidy", ".gemrc", "glide.lock"];
var aceMode$14 = "yaml";
var codemirrorMode$10 = "yaml";
var codemirrorMimeType$10 = "text/x-yaml";
var languageId$14 = 407;
var yaml = {
  name: name$15,
  type: type$14,
  tmScope: tmScope$14,
  aliases: aliases$5,
  extensions: extensions$14,
  filenames: filenames$3,
  aceMode: aceMode$14,
  codemirrorMode: codemirrorMode$10,
  codemirrorMimeType: codemirrorMimeType$10,
  languageId: languageId$14
};

var yaml$1 = Object.freeze({
	name: name$15,
	type: type$14,
	tmScope: tmScope$14,
	aliases: aliases$5,
	extensions: extensions$14,
	filenames: filenames$3,
	aceMode: aceMode$14,
	codemirrorMode: codemirrorMode$10,
	codemirrorMimeType: codemirrorMimeType$10,
	languageId: languageId$14,
	default: yaml
});

var require$$0$18 = ( yaml$1 && yaml ) || yaml$1;

var languages$6 = [languageExtend({}, require$$0$18, {
  since: "1.14.0",
  parsers: ["yaml"],
  vscodeLanguageIds: ["yaml"]
})];
var languageYaml = {
  languages: languages$6,
  printers: {
    yaml: printerYaml
  },
  options: options$15
};

var version = require$$0.version;
var getSupportInfo = support.getSupportInfo;
var internalPlugins = [languageJs, languageCss, languageGraphql, languageHandlebars, languageMarkdown, languageVue, languageYaml];

var isArray = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) === "[object Array]";
}; // Luckily `opts` is always the 2nd argument


function withPlugins(fn) {
  return function () {
    var args = Array.from(arguments);
    var plugins = args[1] && args[1].plugins || [];

    if (!isArray(plugins)) {
      plugins = Object.values(plugins);
    }

    args[1] = Object.assign({}, args[1], {
      plugins: internalPlugins.concat(plugins)
    });
    return fn.apply(null, args);
  };
}

var formatWithCursor = withPlugins(core.formatWithCursor);
var standalone = {
  formatWithCursor: formatWithCursor,
  format: function format(text, opts) {
    return formatWithCursor(text, opts).formatted;
  },
  check: function check(text, opts) {
    var formatted = formatWithCursor(text, opts).formatted;
    return formatted === text;
  },
  doc: doc,
  getSupportInfo: withPlugins(getSupportInfo),
  version: version,
  util: utilShared,
  __debug: {
    parse: withPlugins(core.parse),
    formatAST: withPlugins(core.formatAST),
    formatDoc: withPlugins(core.formatDoc),
    printToDoc: withPlugins(core.printToDoc),
    printDocToString: withPlugins(core.printDocToString)
  }
};

return standalone;

})));
