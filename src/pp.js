"use strict";
const assert = require("assert");

function assertDoc(val) {
  assert(
    typeof val === "string" || val != null && typeof val.type === "string",
    "Value is a valid document"
  );
}

function fromString(text) {
  return "" + text;
}

function concat(parts) {
  parts.forEach(assertDoc);

  return { type: "concat", parts };
}

function indent(n, contents) {
  assertDoc(contents);

  return { type: "indent", contents, n };
}

function group(contents, opts) {
  opts = opts || {};

  assertDoc(contents);

  return {
    type: "group",
    contents: contents,
    break: !!opts.shouldBreak,
    expandedStates: opts.expandedStates
  };
}

function multilineGroup(contents, opts) {
  return group(
    contents,
    Object.assign(opts || {}, { shouldBreak: hasHardLine(contents) })
  );
}

function conditionalGroup(states, opts) {
  return group(
    states[(0)],
    Object.assign(opts || {}, { expandedStates: states })
  );
}

function ifBreak(contents) {
  return { type: "if-break", contents };
}

function iterDoc(topDoc, func) {
  const docs = [ topDoc ];
  while (docs.length !== 0) {
    const doc = docs.pop();
    let res = undefined;

    if (typeof doc === "string") {
      const res = func("string", doc);

      if (res) {
        return res;
      }
    } else {
      const res = func(doc.type, doc);

      if (res) {
        return res;
      }

      if (doc.type === "concat") {
        for (var i = doc.parts.length - 1; i >= 0; i--) {
          docs.push(doc.parts[i]);
        }
      } else if (doc.type !== "line") {
        docs.push(doc.contents);
      }
    }
  }
}

const line = { type: "line" };
const softline = { type: "line", soft: true };
const hardline = { type: "line", hard: true };
const literalline = { type: "line", hard: true, literal: true };

function isEmpty(n) {
  return typeof n === "string" && n.length === 0;
}

function join(sep, arr) {
  var res = [];

  for (var i = 0; i < arr.length; i++) {
    if (i !== 0) {
      res.push(sep);
    }

    res.push(arr[i]);
  }

  return concat(res);
}

function getFirstString(doc) {
  return iterDoc(doc, (type, doc) => {
    if (type === "string" && doc.trim().length !== 0) {
      return doc;
    }
  });
}

function hasHardLine(doc) {
  // TODO: If we hit a group, check if it's already marked as a
  // multiline group because they should be marked bottom-up.
  return !!iterDoc(doc, (type, doc) => {
    switch (type) {
      case "line":
        if (doc.hard) {
          return true;
        }

        break;
    }
  });
}

function _makeIndent(n) {
  var s = "";

  for (var i = 0; i < n; i++) {
    s += " ";
  }

  return s;
}

const MODE_BREAK = 1;
const MODE_FLAT = 2;

function fits(next, restCommands, width) {
  let restIdx = restCommands.length;
  const cmds = [ next ];
  while (width >= 0) {
    if (cmds.length === 0) {
      if (restIdx === 0) {
        return true;
      } else {
        cmds.push(restCommands[restIdx - 1]);

        restIdx--;

        continue;
      }
    }

    const x = cmds.pop();
    const ind = x[(0)];
    const mode = x[(1)];
    const doc = x[(2)];

    if (typeof doc === "string") {
      width -= doc.length;
    } else {
      switch (doc.type) {
        case "concat":
          for (var i = doc.parts.length - 1; i >= 0; i--) {
            cmds.push([ ind, mode, doc.parts[i] ]);
          }

          break;
        case "indent":
          cmds.push([ ind + doc.n, mode, doc.contents ]);

          break;
        case "group":
          cmds.push([ ind, doc.break ? MODE_BREAK : mode, doc.contents ]);

          break;
        case "if-break":
          if (mode === MODE_BREAK) {
            cmds.push([ ind, mode, doc.contents ]);
          }

          break;
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

            case MODE_BREAK:
              return true;
          }
          break;
      }
    }
  }
  return false;
}

function print(w, doc) {
  let pos = 0;
  // cmds is basically a stack. We've turned a recursive call into a
  // while loop which is much faster. The while loop below adds new
  // cmds to the array instead of recursively calling `print`.
  let cmds = [ [ 0, MODE_BREAK, doc ] ];
  let out = [];
  let shouldRemeasure = false;
  while (cmds.length !== 0) {
    const x = cmds.pop();
    const ind = x[(0)];
    const mode = x[(1)];
    const doc = x[(2)];

    if (typeof doc === "string") {
      out.push(doc);

      pos += doc.length;
    } else {
      switch (doc.type) {
        case "concat":
          for (var i = doc.parts.length - 1; i >= 0; i--) {
            cmds.push([ ind, mode, doc.parts[i] ]);
          }

          break;
        case "indent":
          cmds.push([ ind + doc.n, mode, doc.contents ]);

          break;
        case "group":
          switch (mode) {
            // fallthrough
            case MODE_FLAT:
              if (!shouldRemeasure) {
                cmds.push([
                  ind,
                  doc.break ? MODE_BREAK : MODE_FLAT,
                  doc.contents
                ]);

                break;
              }

            case MODE_BREAK:
              shouldRemeasure = false;

              const next = [ ind, MODE_FLAT, doc.contents ];
              let rem = w - pos;

              if (!doc.break && fits(next, cmds, rem)) {
                cmds.push(next);
              } else {
                // Expanded states are a rare case where a document
                // can manually provide multiple representations of
                // itself. It provides an array of documents
                // going from the least expanded (most flattened)
                // representation first to the most expanded. If a
                // group has these, we need to manually go through
                // these states and find the first one that fits.
                if (doc.expandedStates) {
                  const mostExpanded = doc.expandedStates[doc.expandedStates.length -
                    1];

                  if (doc.break) {
                    cmds.push([ ind, MODE_BREAK, mostExpanded ]);

                    break;
                  } else {
                    for (var i = 1; i < doc.expandedStates.length + 1; i++) {
                      if (i >= doc.expandedStates.length) {
                        cmds.push([ ind, MODE_BREAK, mostExpanded ]);

                        break;
                      } else {
                        const state = doc.expandedStates[i];
                        const cmd = [ ind, MODE_FLAT, state ];

                        if (fits(cmd, cmds, rem)) {
                          cmds.push(cmd);

                          break;
                        }
                      }
                    }
                  }
                } else {
                  cmds.push([ ind, MODE_BREAK, doc.contents ]);
                }
              }

              break;
          }
          break;
        case "if-break":
          if (mode === MODE_BREAK) {
            cmds.push([ ind, MODE_BREAK, doc.contents ]);
          }

          break;
        case "line":
          switch (mode) {
            // fallthrough
            case MODE_FLAT:
              if (!doc.hard) {
                if (!doc.soft) {
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

            case MODE_BREAK:
              if (out.length > 0) {
                const lastString = out[out.length - 1];

                if (lastString.match(/^\s*\n\s*$/)) {
                  out[out.length - 1] = "\n";
                }
              }

              if (doc.literal) {
                out.push("\n");

                pos = 0;
              } else {
                out.push("\n" + _makeIndent(ind));

                pos = ind;
              }

              break;
          }
          break;
        default:
      }
    }
  }
  return out.join("");
}

module.exports = {
  fromString,
  concat,
  isEmpty,
  join,
  line,
  softline,
  hardline,
  literalline,
  group,
  multilineGroup,
  conditionalGroup,
  ifBreak,
  hasHardLine,
  indent,
  print,
  getFirstString
};
