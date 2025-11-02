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
    const { node } = path;
    if (
      node === null ||
      typeof node !== "object" ||
      hasPrettierIgnore?.(path)
    ) {
      return;
    }

    for (const key of getVisitorKeys(node)) {
      if (Array.isArray(node[key])) {
        path.each(recurse, key);
      } else {
        path.call(recurse, key);
      }
    }

    const result = embed(path, options);

    if (!result) {
      return;
    }

    if (typeof result === "function") {
      embedCallResults.push({
        print: result,
        node,
        pathStack: [...path.stack],
      });
      return;
    }

    if (
      process.env.NODE_ENV !== "production" &&
      typeof result.then === "function"
    ) {
      throw new Error(
        "`embed` should return an async function instead of Promise.",
      );
    }

    embeds.set(node, result);
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
