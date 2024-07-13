import { outdent } from "outdent";
import { optionCategories } from "./prettier-internal.js";

const categoryOrder = [
  optionCategories.CATEGORY_OUTPUT,
  optionCategories.CATEGORY_FORMAT,
  optionCategories.CATEGORY_CONFIG,
  optionCategories.CATEGORY_EDITOR,
  optionCategories.CATEGORY_OTHER,
];

const usageSummary = outdent`
  Usage: prettier [options] [file/dir/glob ...]

  By default, output is written to stdout.
  Stdin is read if it is piped to Prettier and no files are given.
`;

export { categoryOrder, usageSummary };
