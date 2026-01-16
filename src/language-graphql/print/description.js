import { hardline, line } from "../../document/index.js";

function printDescription(path, options, print) {
  const { node } = path;
  if (!node.description) {
    return "";
  }

  const parts = [print("description")];
  if (node.kind === "InputValueDefinition" && !node.description.block) {
    parts.push(line);
  } else {
    parts.push(hardline);
  }

  return parts;
}

export default printDescription;
