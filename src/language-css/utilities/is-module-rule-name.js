const moduleRuleNames = new Set(["import", "use", "forward"]);

function isModuleRuleName(name) {
  return moduleRuleNames.has(name);
}

export default isModuleRuleName;
