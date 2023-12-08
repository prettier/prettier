import collapseWhiteSpace from "collapse-white-space";
import isFrontMatter from "../utils/front-matter/is-front-matter.js";
import { startWithPragma } from "./pragma.js";

const ignoredProperties = new Set([
  "position",
  "raw", // front-matter
]);
function clean(ast, newObj, parent) {
  // for codeblock
  if (
    ast.type === "front-matter" ||
    ast.type === "code" ||
    ast.type === "yaml" ||
    ast.type === "import" ||
    ast.type === "export" ||
    ast.type === "jsx"
  ) {
    delete newObj.value;
  }

  if (ast.type === "list") {
    delete newObj.isAligned;
  }

  if (ast.type === "list" || ast.type === "listItem") {
    delete newObj.spread;
  }

  // texts can be splitted or merged
  if (ast.type === "text") {
    return null;
  }

  if (ast.type === "inlineCode") {
    newObj.value = ast.value.replaceAll("\n", " ");
  }

  if (ast.type === "wikiLink") {
    newObj.value = ast.value.trim().replaceAll(/[\t\n]+/g, " ");
  }

  if (
    ast.type === "definition" ||
    ast.type === "linkReference" ||
    ast.type === "imageReference"
  ) {
    newObj.label = collapseWhiteSpace(ast.label);
  }

  if (
    (ast.type === "link" || ast.type === "image") &&
    ast.url &&
    ast.url.includes("(")
  ) {
    for (const character of "<>") {
      newObj.url = ast.url.replaceAll(character, encodeURIComponent(character));
    }
  }

  if (
    (ast.type === "definition" ||
      ast.type === "link" ||
      ast.type === "image") &&
    ast.title
  ) {
    newObj.title = ast.title.replaceAll(/\\(?=["')])/g, "");
  }

  // for insert pragma
  if (
    parent?.type === "root" &&
    parent.children.length > 0 &&
    (parent.children[0] === ast ||
      (isFrontMatter(parent.children[0]) && parent.children[1] === ast)) &&
    ast.type === "html" &&
    startWithPragma(ast.value)
  ) {
    return null;
  }
}

clean.ignoredProperties = ignoredProperties;

export default clean;
