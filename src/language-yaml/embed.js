import { hardline } from "../document/builders.js";

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  // Try to format `.prettierrc`, `.stylelintrc`, and `.lintstagedrc` as `json` first
  if (
    node.type === "root" &&
    options.filepath &&
    /(?:[/\\]|^)\.(?:prettier|stylelint|lintstaged)rc$/.test(options.filepath)
  ) {
    const doc = textToDoc(options.originalText, {parser: "json"});
    return doc ? [doc, hardline] : "";
  }
}

export default embed;
