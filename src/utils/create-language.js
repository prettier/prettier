import assert from "node:assert";

/** @import {Language as LinguistLanguage} from 'linguist-languages' */
/**
@typedef {{
  name: string;
  parsers: BuiltInParserName[] | string[];
  group?: string | undefined;
  tmScope?: string | undefined;
  aceMode?: string | undefined;
  codemirrorMode?: string | undefined;
  codemirrorMimeType?: string | undefined;
  aliases?: string[] | undefined;
  extensions?: string[] | undefined;
  filenames?: string[] | undefined;
  linguistLanguageId?: number | undefined;
  vscodeLanguageIds?: string[] | undefined;
  interpreters?: string[] | undefined;
  isSupported?: (({ filepath: string }) => boolean) | undefined;
}} Language
*/

const excludedFields = new Set(["color"]);

const arrayTypeFields = new Set([
  "parsers",
  "extensions",
  "interpreters",
  "filenames",
]);

/**
 * @param {LinguistLanguage} linguistLanguage
 * @param {(data: LinguistLanguage) => LinguistLanguage & Language} getOverrides
 * @returns {Language}
 */
function createLanguage(linguistLanguage, getOverrides) {
  const language = getOverrides(linguistLanguage);

  for (const property of arrayTypeFields) {
    const value = language[property];

    assert.ok(
      value === undefined ||
        (Array.isArray(value) && new Set(value).size === value.length),
      `Language property '${property}' should be 'undefined' or unique array.`,
    );
  }

  const { languageId: linguistLanguageId, ...restData } = language;
  for (const field of excludedFields) {
    delete restData[field];
  }

  return { linguistLanguageId, ...restData };
}

export default createLanguage;
