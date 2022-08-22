import { LinesAndColumns } from "lines-and-columns";
import createError from "../common/parser-create-error.js";
import { locStart, locEnd } from "./loc.js";

/* from the following template: `non-escaped mustache \\{{helper}}`
 * glimmer parser will produce an AST missing a backslash
 * so here we add it back
 * */
function addBackslash(/* options*/) {
  return {
    name: "addBackslash",
    visitor: {
      All(node) {
        const childrenOrBody = node.children ?? node.body;
        if (childrenOrBody) {
          for (let i = 0; i < childrenOrBody.length - 1; i++) {
            if (
              childrenOrBody[i].type === "TextNode" &&
              childrenOrBody[i + 1].type === "MustacheStatement"
            ) {
              childrenOrBody[i].chars = childrenOrBody[i].chars.replace(
                /\\$/,
                "\\\\"
              );
            }
          }
        }
      },
    },
  };
}

// Add `loc.{start,end}.offset`
function addOffset(text) {
  const lines = new LinesAndColumns(text);
  const calculateOffset = ({ line, column }) =>
    lines.indexForLocation({ line: line - 1, column });
  return (/* options*/) => ({
    name: "addOffset",
    visitor: {
      All(node) {
        const { start, end } = node.loc;
        start.offset = calculateOffset(start);
        end.offset = calculateOffset(end);
      },
    },
  });
}

async function parse(text /*, options */) {
  // Inline `import()` to avoid loading all the JS if we don't use it
  /*
  The module version `@glimmer/syntax/dist/modules/es2017/lib/parser/tokenizer-event-handlers.js`
  can't be be imported since it use `.js` extension, and don't have `type: module` in `package.json`
  We'll replace it during build
  */
  const { preprocess: glimmer } = await import(
    "@glimmer/syntax/dist/commonjs/es2017/lib/parser/tokenizer-event-handlers.js"
  );
  let ast;
  try {
    ast = glimmer(text, {
      mode: "codemod",
      plugins: { ast: [addBackslash, addOffset(text)] },
    });
  } catch (error) {
    const location = getErrorLocation(error);

    if (location) {
      throw createError(error.message, { loc: location, cause: error });
    }

    /* istanbul ignore next */
    throw error;
  }

  return ast;
}

function getErrorLocation(error) {
  const { location, hash } = error;
  if (location) {
    const { start, end } = location;
    if (typeof end.line !== "number") {
      return { start };
    }
    return location;
  }

  if (hash) {
    const {
      loc: { last_line, last_column },
    } = hash;
    return { start: { line: last_line, column: last_column + 1 } };
  }
}

const glimmerParser = {
  parsers: {
    glimmer: {
      parse,
      astFormat: "glimmer",
      locStart,
      locEnd,
    },
  },
};

export default glimmerParser;
