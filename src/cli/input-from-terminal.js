"use strict";

const readline = require("readline");
const { stdin } = require("node:process");

/**
 * This function starts reading any input which user types on the console.
 * After the user clicks ctrl+D to exit, the input is formatted and printed
 * on the screen.
 * @returns {Promise<string>} On success, resolves the input code joined together
 * to form a single string. On error, reject with an error message
 */
function getInputFromTerminal() {
  return new Promise((resolve) => {
    const inputCode = [];
    const readLine = readline.createInterface({ input: stdin });
    readLine.on("line", (line) => inputCode.push(line));
    readLine.on("close", () => {
      if (inputCode.length > 0) {
        resolve(inputCode.join("\n"));
      } else {
        resolve("");
      }
    });
  });
}

module.exports = { getInputFromTerminal };
