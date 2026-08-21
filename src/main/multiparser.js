import { stripTrailingHardline } from "../document/index.js";
import normalizeFormatOptions from "./normalize-format-options.js";
import parse from "./parse.js";

/** @import AstPath from "../common/ast-path.js" */

async function printEmbeddedLanguages(
  /** @type {AstPath} */ path,
  genericPrint,
  options,
  printAstToDoc,
  embeds,
) {
  if (options.embeddedLanguageFormatting !== "auto") {
    return;
  }

  const { printer } = options;
  const { embed } = printer;

  if (!embed) {
    return;
  }

  if (embed.length > 2) {
    throw new Error(
      "printer.embed has too many parameters. The API changed in Prettier v3. Please update your plugin. See https://prettier.io/docs/plugins#optional-embed",
    );
  }

  const { hasPrettierIgnore } = printer;
  const { getVisitorKeys } = embed;

  const embedCallResults = [];

  recurse();

  const originalPathStack = path.stack;

  for (const { print, node, pathStack } of embedCallResults) {
    try {
      path.stack = pathStack;
      const doc = await print(textToDocForEmbed, genericPrint, path, options);

      if (doc) {
        embeds.set(node, doc);
      }
    } catch (error) {
      /* c8 ignore next 3 */
      if (process.env.PRETTIER_DEBUG) {
        throw error;
      }
    }
  }

  path.stack = originalPathStack;

  function textToDocForEmbed(text, partialNextOptions) {
    return textToDoc(text, partialNextOptions, options, printAstToDoc);
  }

  function recurse() {
    // Iterative post-order walk, mirroring path.call/path.each push+pop of
    // path.stack by hand. A recursive walk here would blow the call stack on
    // ASTs that nest thousands of levels deep (e.g. long `+` chains), since
    // recursion depth would be proportional to AST depth.
    const { stack } = path;
    const frames = [createFrame()];

    function createFrame() {
      const { node } = path;
      const skip =
        node === null ||
        typeof node !== "object" ||
        Boolean(hasPrettierIgnore?.(path));
      return { skip, keys: skip ? [] : getVisitorKeys(node), keyIndex: 0, array: null };
    }

    while (frames.length > 0) {
      const frame = frames.at(-1);

      if (frame.array) {
        const { value, index } = frame.array;
        if (index < value.length) {
          frame.array.index++;
          stack.push(index, value[index]);
          frames.push(createFrame());
          continue;
        }
        stack.length -= 2; // pop the array's own (key, value) entry
        frame.array = null;
        continue;
      }

      if (frame.keyIndex < frame.keys.length) {
        const key = frame.keys[frame.keyIndex++];
        const value = path.node[key];
        stack.push(key, value);
        if (Array.isArray(value)) {
          frame.array = { value, index: 0 };
        } else {
          frames.push(createFrame());
        }
        continue;
      }

      if (!frame.skip) {
        const { node } = path;
        const result = embed(path, options);

        if (result) {
          if (typeof result === "function") {
            embedCallResults.push({
              print: result,
              node,
              pathStack: [...stack],
            });
          } else if (
            process.env.NODE_ENV !== "production" &&
            typeof result.then === "function"
          ) {
            throw new Error(
              "`embed` should return an async function instead of Promise.",
            );
          } else {
            embeds.set(node, result);
          }
        }
      }

      frames.pop();
      if (frames.length > 0) {
        stack.length -= 2; // pop this node's own (key, value) entry
      }
    }
  }
}

async function textToDoc(
  text,
  partialNextOptions,
  parentOptions,
  printAstToDoc,
) {
  const options = await normalizeFormatOptions(
    {
      ...parentOptions,
      ...partialNextOptions,
      parentParser: parentOptions.parser,
      originalText: text,
      // Improve this if we calculate the relative index
      cursorOffset: undefined,
      rangeStart: undefined,
      rangeEnd: undefined,
    },
    { passThrough: true },
  );

  const { ast } = await parse(text, options);
  const doc = await printAstToDoc(ast, options);

  return stripTrailingHardline(doc);
}

export { printEmbeddedLanguages };
