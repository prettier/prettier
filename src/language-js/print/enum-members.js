import { hardline, softline, group, indent } from "../../document/builders.js";
import { printDanglingComments } from "../../main/comments.js";
import { shouldPrintComma } from "../utils/index.js";
import { printArrayItems } from "./array.js";

function printEnumMemberList(path, print, options) {
  const {
    node: { members, hasUnknownMembers },
  } = path;

  if (members.length === 0 && !hasUnknownMembers) {
    return [printDanglingComments(path, options), softline];
  }

  return [
    indent([
      ...(members.length > 0
        ? [
            hardline,
            printArrayItems(path, options, "members", print),
            hasUnknownMembers || shouldPrintComma(options) ? "," : "",
          ]
        : []),
      ...(hasUnknownMembers ? [hardline, "..."] : []),
    ]),
    printDanglingComments(path, options, /* sameIndent */ true),
    hardline,
  ];
}

function printEnumMembers(path, print, options) {
  return group(["{", printEnumMemberList(path, print, options), "}"]);
}

export default printEnumMembers;
