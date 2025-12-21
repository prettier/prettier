import collapseWhiteSpace from "collapse-white-space";
import { isFrontMatter } from "../main/front-matter/index.js";
import { hasPragma } from "./pragma.js";

const ignoredProperties = new Set([
  "position",
  "raw", // front-matter
]);
function clean(original, cloned, parent) {
  // for codeblock
  if (
    original.type === "code" ||
    original.type === "yaml" ||
    original.type === "import" ||
    original.type === "export" ||
    original.type === "jsx"
  ) {
    delete cloned.value;
  }

  if (original.type === "list") {
    delete cloned.isAligned;
  }

  if (original.type === "list" || original.type === "listItem") {
    delete cloned.spread;
  }

  // texts can be splitted or merged
  if (original.type === "text") {
    return null;
  }

  if (original.type === "inlineCode") {
    cloned.value = original.value.replaceAll("\n", " ");
  }

  if (original.type === "wikiLink") {
    cloned.value = original.value.trim().replaceAll(/[\t\n]+/g, " ");
  }

  if (
    original.type === "definition" ||
    original.type === "linkReference" ||
    original.type === "imageReference"
  ) {
    cloned.label = collapseWhiteSpace(original.label);
  }

  if (
    (original.type === "link" || original.type === "image") &&
    original.url &&
    original.url.includes("(")
  ) {
    for (const character of "<>") {
      cloned.url = original.url.replaceAll(
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
    cloned.title = original.title.replaceAll(/\\(?=["')])/g, "");
  }

  // for insert pragma
  if (
    parent?.type === "root" &&
    parent.children.length > 0 &&
    (parent.children[0] === original ||
      (isFrontMatter(parent.children[0]) && parent.children[1] === original)) &&
    original.type === "html" &&
    hasPragma(original.value)
  ) {
    return null;
  }
}

clean.ignoredProperties = ignoredProperties;

export default clean;
