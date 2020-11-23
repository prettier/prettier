"use strict";

const { printFlowDeclaration } = require("./misc");
const { printClass } = require("./class");

function printFlow(path, options, print) {
  const n = path.getValue();
  switch (n.type) {
    case "DeclareClass":
      return printFlowDeclaration(path, printClass(path, options, print));
  }
}

module.exports = { printFlow };
