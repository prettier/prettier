// Clean handlebars AST nodes
function clean(original, cloned /*, parent */) {
  // Remove location information and other metadata
  if (cloned.type) {
    delete cloned.loc;
    delete cloned.strip;
  }

  // Clean specific node types
  switch (cloned.type) {
    case "Program":
      delete cloned.blockParams;
      delete cloned.chained;
      break;

    case "ContentStatement":
      // Keep original content
      break;

    case "MustacheStatement":
    case "BlockStatement":
      delete cloned.escaped;
      break;
  }
}

export default clean;
