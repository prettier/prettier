import { outdent } from "outdent";
import { coreOptions } from "./prettier-internal.js";

const categoryOrder = [
  coreOptions.CATEGORY_OUTPUT,
  coreOptions.CATEGORY_FORMAT,
  coreOptions.CATEGORY_CONFIG,
  coreOptions.CATEGORY_EDITOR,
  coreOptions.CATEGORY_OTHER,
];

const usageSummary = outdent`
  Usage: prettier [options] [file/dir/glob ...]

  By default, output is written to stdout.
  Stdin is read if it is piped to Prettier and no files are given.
`;

export { categoryOrder, usageSummary };
