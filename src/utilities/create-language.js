import * as assert from "#universal/assert";

/**
@import {Language as LinguistLanguage} from "linguist-languages"
@typedef {keyof LinguistLanguage} LinguistLanguageFields
@typedef {"color" | "languageId"} ExcludedLinguistLanguageFields
@typedef {Omit<LinguistLanguage, "color" | "languageId"> & {
  parsers?: readonly string[];
  linguistLanguageId?: LinguistLanguage["languageId"];
  vscodeLanguageIds?: string[];
  interpreters?: readonly string[] | undefined;
  isSupported?: ((options: {filepath: string}) => boolean) | undefined;
}} Language
*/

/** @type {Set<ExcludedLinguistLanguageFields>} */
const excludedFields = new Set([
  "color",
  // Rename as `linguistLanguageId`
  "languageId",
]);

/** @type {Set<keyof Language>} */
const arrayTypeFields = new Set([
  "parsers",
  "aliases",
  "extensions",
  "interpreters",
  "filenames",
  "vscodeLanguageIds",
]);

/**
 * @param {LinguistLanguage} linguistLanguage
 * @param {(data: LinguistLanguage) => Partial<LinguistLanguage & Language>} getOverrides
 * @returns {Language}
 */
function createLanguage(linguistLanguage, getOverrides) {
  const language = { ...linguistLanguage, ...getOverrides(linguistLanguage) };
  language.linguistLanguageId = language.languageId;

  for (const field of excludedFields) {
    delete language[field];
  }

  for (const property of arrayTypeFields) {
    const value = language[property];

    assert.ok(
      value === undefined ||
        (Array.isArray(value) && new Set(value).size === value.length),
      `Language property '${property}' should be 'undefined' or unique array.`,
    );
  }

  return language;
}

export default createLanguage;
