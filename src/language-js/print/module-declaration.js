import { group } from "../../document/index.js";
import { printDeclareToken } from "./miscellaneous.js";

function printModuleDeclaration(path, options, print) {
  const { node } = path;

  return [
    printDeclareToken(path),
    node.kind === "global" ? "" : `${node.kind} `,
    print("id"),
    node.body ? [" ", group(print("body"))] : options.semi ? ";" : "",
  ];
}

export { printModuleDeclaration };
