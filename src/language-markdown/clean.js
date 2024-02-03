import collapseWhiteSpace from "collapse-white-space";

import isFrontMatter from "../utils/front-matter/is-front-matter.js";
import { startWithPragma } from "./pragma.js";

const ignoredProperties = new Set([
  "position",
  "raw", // front-matter
]);
function clean(original, clone, parent) {
  // for codeblock
  if (
    original.type === "front-matter" ||
    original.type === "code" ||
    original.type === "yaml" ||
    original.type === "import" ||
    original.type === "export" ||
    original.type === "jsx"
  ) {
    delete clone.value;
  }

  if (original.type === "list") {
    delete clone.isAligned;
  }

  if (original.type === "list" || original.type === "listItem") {
    delete clone.spread;
  }

  // texts can be splitted or merged
  if (original.type === "text") {
    return null;
  }

  if (original.type === "inlineCode") {
    clone.value = original.value.replaceAll("\n", " ");
  }

  if (original.type === "wikiLink") {
    clone.value = original.value.trim().replaceAll(/[\t\n]+/g, " ");
  }

  if (
    original.type === "definition" ||
    original.type === "linkReference" ||
    original.type === "imageReference"
  ) {
    clone.label = collapseWhiteSpace(original.label);
  }

  if (
    (original.type === "link" || original.type === "image") &&
    original.url &&
    original.url.includes("(")
  ) {
    for (const character of "<>") {
      clone.url = original.url.replaceAll(
        character,
        encodeURIComponent(character),
      );
    }
  }

  if (
    (original.type === "definition" ||
      original.type === "link" ||
      original.type === "image") &&
    original.title
  ) {
    clone.title = original.title.replaceAll(/\\(?=["')])/g, "");
  }

  // for insert pragma
  if (
    parent?.type === "root" &&
    parent.children.length > 0 &&
    (parent.children[0] === original ||
      (isFrontMatter(parent.children[0]) && parent.children[1] === original)) &&
    original.type === "html" &&
    startWithPragma(original.value)
  ) {
    return null;
  }
}

clean.ignoredProperties = ignoredProperties;

export default clean;
