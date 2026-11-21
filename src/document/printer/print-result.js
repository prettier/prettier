import { trimIndentation } from "./trim-indentation.js";

class printResult {
  /** @type {string[]} */
  #settledTexts = [];
  #unsettledText = "";
  #settledTextLength = 0;
  /** @type {number[]} */
  #settledPositions = [];
  /** @type {number[]} */
  #unsettledPositions = [];

  #settle() {
    const text = this.#unsettledText;

    if (text !== "") {
      this.#settledTexts.push(text);
      this.#settledTextLength += text.length;
      this.#unsettledText = "";
    }

    for (const position of this.#unsettledPositions) {
      this.#settledPositions.push(Math.min(position, this.#settledTextLength));
    }
    this.#unsettledPositions.length = 0;
  }

  markPosition() {
    if (this.#settledPositions.length + this.#unsettledPositions.length >= 2) {
      throw new Error("There are too many 'cursor' in doc.");
    }

    this.#unsettledPositions.push(
      this.#settledTextLength + this.#unsettledText.length,
    );
  }

  /**
  @param {string} text
  */
  write(text) {
    this.#unsettledText += text;
  }

  /**
  @returns {string}
  */
  getLastLine() {
    let text = this.#unsettledText;
    for (
      let index = this.#settledTexts.length - 1;
      index >= 0 && !/[\n\r]/u.test(text);
      index--
    ) {
      text = this.#settledTexts[index] + text;
    }

    return text.slice(
      Math.max(text.lastIndexOf("\n"), text.lastIndexOf("\r")) + 1,
    );
  }

  trim() {
    const { text: trimmed, count } = trimIndentation(this.#unsettledText);

    this.#unsettledText = trimmed;
    this.#settle();

    return count;
  }

  finish() {
    this.#settle();

    return {
      text: this.#settledTexts.join(""),
      positions: this.#settledPositions,
    };
  }
}

export default printResult;
