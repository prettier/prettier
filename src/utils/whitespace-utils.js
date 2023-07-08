import escapeStringRegexp from "escape-string-regexp";

class WhitespaceUtils {
  #whitespaceCharacters;

  constructor(
    /** @type {string|ReadonlyArray<string>} */ whitespaceCharacters,
  ) {
    this.#whitespaceCharacters = new Set(whitespaceCharacters);

    if (
      process.env.NODE_ENV !== "production" &&
      (this.#whitespaceCharacters.size === 0 ||
        Array.prototype.some.call(
          whitespaceCharacters,
          (character) => !/^\s$/.test(character),
        ))
    ) {
      throw new TypeError(
        `Invalid characters: ${JSON.stringify(whitespaceCharacters)}`,
      );
    }
  }

  getLeadingWhitespaceCount(/** @type {string} */ text) {
    const whitespaceCharacters = this.#whitespaceCharacters;
    let count = 0;

    for (
      let index = 0;
      index < text.length && whitespaceCharacters.has(text.charAt(index));
      index++
    ) {
      count++;
    }

    return count;
  }

  getTrailingWhitespaceCount(/** @type {string} */ text) {
    const whitespaceCharacters = this.#whitespaceCharacters;
    let count = 0;

    for (
      let index = text.length - 1;
      index >= 0 && whitespaceCharacters.has(text.charAt(index));
      index--
    ) {
      count++;
    }

    return count;
  }

  getLeadingWhitespace(/** @type {string} */ text) {
    const count = this.getLeadingWhitespaceCount(text);
    return text.slice(0, count);
  }

  getTrailingWhitespace(/** @type {string} */ text) {
    const count = this.getTrailingWhitespaceCount(text);
    return text.slice(text.length - count);
  }

  hasLeadingWhitespace(/** @type {string} */ text) {
    return this.#whitespaceCharacters.has(text.charAt(0));
  }

  hasTrailingWhitespace(/** @type {string} */ text) {
    return this.#whitespaceCharacters.has(text.at(-1));
  }

  trimStart(/** @type {string} */ text) {
    const count = this.getLeadingWhitespaceCount(text);
    return text.slice(count);
  }

  trimEnd(/** @type {string} */ text) {
    const count = this.getTrailingWhitespaceCount(text);
    return text.slice(0, text.length - count);
  }

  trim(/** @type {string} */ text) {
    return this.trimEnd(this.trimStart(text));
  }

  split(/** @type {string} */ text, captureWhitespace = false) {
    const pattern = `[${escapeStringRegexp(
      [...this.#whitespaceCharacters].join(""),
    )}]+`;
    const regexp = new RegExp(captureWhitespace ? `(${pattern})` : pattern);
    return text.split(regexp);
  }

  hasWhitespaceCharacter(/** @type {string} */ text) {
    const whitespaceCharacters = this.#whitespaceCharacters;
    return Array.prototype.some.call(text, (character) =>
      whitespaceCharacters.has(character),
    );
  }

  hasNonWhitespaceCharacter(/** @type {string} */ text) {
    const whitespaceCharacters = this.#whitespaceCharacters;
    return Array.prototype.some.call(
      text,
      (character) => !whitespaceCharacters.has(character),
    );
  }

  isWhitespaceOnly(/** @type {string} */ text) {
    const whitespaceCharacters = this.#whitespaceCharacters;
    return Array.prototype.every.call(text, (character) =>
      whitespaceCharacters.has(character),
    );
  }
}

export default WhitespaceUtils;
