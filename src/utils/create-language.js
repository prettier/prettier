"use strict";

/**
 * @param {object & {languageId: string}} linguistData
 * @param {(linguistData: object & {languageId: string}) => object} override
 * @returns {object & {linguistLanguageId: string}}
 */
module.exports = function (linguistData, override) {
  const { languageId, ...rest } = linguistData;
  return {
    linguistLanguageId: languageId,
    ...rest,
    ...override(linguistData),
  };
};
