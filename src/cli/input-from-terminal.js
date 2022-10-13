"use strict";

const readline = require("node:readline");
const { stdin, stdout } = require("node:process");

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
    const readLine = readline.createInterface({ input: stdin, output: stdout });
    readLine.on("line", (line) => {
      inputCode.push(line);
    });
    readLine.on("close", () => {
      resolve(inputCode.join("\n"));
    });
  });
}

module.exports = { getInputFromTerminal };
