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
    const { stack } = path;

    // Iterate the tree without recursion. A deeply-nested AST (for example a
    // long chain of `+`/`&&` expressions) used to overflow the call stack
    // because `recurse` called itself once per node.
    //
    // Each frame tracks the state of a single node's visitor-key iteration.
    // The `path` stack is kept in sync so that `embed`/`hasPrettierIgnore`
    // always observe the node being visited.
    const frames = [
      {
        node: stack.at(-1),
        keys: getVisitorKeys(stack.at(-1)),
        keyIndex: 0,
        array: null,
        arrayIndex: 0,
      },
    ];

    while (frames.length > 0) {
      const frame = frames.at(-1);
      const { node } = frame;

      // Skip invalid nodes (mirrors the early return in the recursive version).
      if (
        node === null ||
        typeof node !== "object" ||
        hasPrettierIgnore?.(path)
      ) {
        frames.pop();
        if (frames.length > 0) {
          // Pop the path pair used to reach this node.
          stack.length -= 2;
        }
        continue;
      }

      // Find the next child to descend into.
      let targetNode = null;
      let entry = null;
      while (targetNode === null) {
        if (frame.array !== null) {
          if (frame.arrayIndex < frame.array.length) {
            targetNode = frame.array[frame.arrayIndex];
            entry = [frame.arrayIndex, targetNode];
            frame.arrayIndex += 1;
            break;
          }
          // Finished the current array: pop the `key, array` pair.
          stack.length -= 2;
          frame.array = null;
          frame.arrayIndex = 0;
          continue;
        }

        if (frame.keyIndex < frame.keys.length) {
          const key = frame.keys[frame.keyIndex++];
          const value = node[key];
          if (Array.isArray(value)) {
            if (value.length > 0) {
              stack.push(key, value);
              frame.array = value;
              frame.arrayIndex = 0;
            }
            continue;
          }
          if (value !== null && typeof value === "object") {
            targetNode = value;
            entry = [key, value];
          }
          continue;
        }

        // All children have been visited. This is the post-order point where
        // the recursive version would call `embed`.
        const result = embed(path, options);

        if (!result) {
          // fallthrough to popping the frame
        } else if (typeof result === "function") {
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

        frames.pop();
        if (frames.length > 0) {
          stack.length -= 2;
        }
        break;
      }

      if (targetNode !== null) {
        stack.push(entry[0], entry[1]);
        frames.push({
          node: targetNode,
          keys: getVisitorKeys(targetNode),
          keyIndex: 0,
          array: null,
          arrayIndex: 0,
        });
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
