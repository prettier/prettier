"use strict";

const moduleRuleNames = new Set(["import", "use", "forward"]);

function isModuleRuleName(name) {
  return moduleRuleNames.has(name);
}

module.exports = isModuleRuleName;
