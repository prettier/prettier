import escapeStringRegexp from "escape-string-regexp"

class WhitespaceUtils {
  #characters;

  constructor(characters) {
    this.#characters = new Set(characters);
  }

  getLeadingWhitespaceCount(string) {
    const characters = this.#characters;
    let count = 0;

    for (let index = 0; index < string.length; index ++) {
      if (characters.has(string.charAt(index))) {
        count ++
      } else {
        break
      }
    }

    return count;
  }

  getTrailingWhitespaceCount(string) {
    const characters = this.#characters;
    let count = 0;

    for (let index = string.length - 1; index >= 0; index --) {
      if (characters.has(string.charAt(index))) {
        count ++
      } else {
        break
      }
    }

    return count;
  }

  getLeadingWhitespace(string) {
    const count = this.getLeadingWhitespaceCount(string)
    return count === 0 ? "" : string.slice(0, count);
  }

  getTrailingWhitespace(string) {
    const count = this.getTrailingWhitespaceCount(string)
    return count === 0 ? "" : string.slice(-count);
  }

  trimStart(string) {
    const count = this.getLeadingWhitespaceCount(string)
    return count === 0 ? string : string.slice(count);
  }

  trimEnd(string) {
    const count = this.getTrailingWhitespaceCount(string)
    return count === 0 ? string : string.slice(0, -count);
  }

  trim(string) {
    return this.trimEnd(this.trimStart(string))
  }

  split(string) {
    const regexp = new RegExp(`[${escapeStringRegexp([...this.#characters].join(""))}]+`)
    return string.split(regexp)
  }

  hasWhitespaceCharacter(string) {
    const characters = this.#characters;

    for (let index = 0; index < string.length; index ++) {
      if (characters.has(string.charAt(index))) {
        return true
      }
    }

    return false;
  }
}

export default WhitespaceUtils;
