import escapeStringRegexp from "escape-string-regexp";

class WhitespaceUtils {
  #characters;

  constructor(characters) {
    this.#characters = new Set(characters);

    if (
      process.env.NODE_ENV !== "production" &&
      (this.#characters.size === 0 ||
        Array.prototype.some.call(
          characters,
          (character) => !/^\s$/.test(character)
        ))
    ) {
      throw new TypeError(`Invalid characters: ${JSON.stringify(characters)}`);
    }
  }

  getLeadingWhitespaceCount(string) {
    const characters = this.#characters;
    let count = 0;

    for (
      let index = 0;
      index < string.length && characters.has(string.charAt(index));
      index++
    ) {
      count++;
    }

    return count;
  }

  getTrailingWhitespaceCount(string) {
    const characters = this.#characters;
    let count = 0;

    for (
      let index = string.length - 1;
      index >= 0 && characters.has(string.charAt(index));
      index--
    ) {
      count++;
    }

    return count;
  }

  getLeadingWhitespace(string) {
    const count = this.getLeadingWhitespaceCount(string);
    return string.slice(0, count);
  }

  getTrailingWhitespace(string) {
    const count = this.getTrailingWhitespaceCount(string);
    return string.slice(string.length - count);
  }

  hasLeadingWhitespace(string) {
    return this.#characters.has(string.charAt(0));
  }

  hasTrailingWhitespace(string) {
    return this.#characters.has(string.at(-1));
  }

  trimStart(string) {
    const count = this.getLeadingWhitespaceCount(string);
    return string.slice(count);
  }

  trimEnd(string) {
    const count = this.getTrailingWhitespaceCount(string);
    return string.slice(0, string.length - count);
  }

  trim(string) {
    return this.trimEnd(this.trimStart(string));
  }

  split(string, captureWhitespace = false) {
    const pattern = `[${escapeStringRegexp([...this.#characters].join(""))}]+`;
    const regexp = new RegExp(captureWhitespace ? `(${pattern})` : pattern);
    return string.split(regexp);
  }

  hasWhitespaceCharacter(string) {
    const characters = this.#characters;
    return Array.prototype.some.call(string, (character) =>
      characters.has(character)
    );
  }

  hasNonWhitespaceCharacter(string) {
    const characters = this.#characters;
    return Array.prototype.some.call(
      string,
      (character) => !characters.has(character)
    );
  }

  isWhitespaceOnly(string) {
    const characters = this.#characters;
    return Array.prototype.every.call(string, (character) =>
      characters.has(character)
    );
  }
}

export default WhitespaceUtils;
