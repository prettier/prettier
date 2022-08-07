import { hardline } from "../document/builders.js";

function embed(path, options) {
  const node = path.getValue();

  // Try to format `.prettierrc`, `.stylelintrc`, and `.lintstagedrc` as `json` first
  if (
    node.type === "root" &&
    options.filepath &&
    /(?:[/\\]|^)\.(?:prettier|stylelint|lintstaged)rc$/.test(options.filepath)
  ) {
    return async (textToDoc) => {
      const doc = await textToDoc(options.originalText, {
        ...options,
        parser: "json",
      });
      return doc ? [doc, hardline] : undefined;
    };
  }
}

export default embed;
