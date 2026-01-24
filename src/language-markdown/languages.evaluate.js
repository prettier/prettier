import * as linguistLanguages from "linguist-languages";
import createLanguage from "../utilities/create-language.js";

const languages = [
  createLanguage(linguistLanguages.Markdown, (data) => ({
    parsers: ["markdown"],
    vscodeLanguageIds: ["markdown"],
    filenames: [...data.filenames, "README"],
    extensions: data.extensions.filter((extension) => extension !== ".mdx"),
  })),
  createLanguage(linguistLanguages.Markdown, () => ({
    name: "MDX",
    parsers: ["mdx"],
    vscodeLanguageIds: ["mdx"],
    filenames: [],
    extensions: [".mdx"],
  })),
];

export default languages;
