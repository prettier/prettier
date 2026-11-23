import printAngularControlFlowBlockParameters from "./angular-control-flow-block-parameters.js";
import { printAttribute } from "./attribute.js";
import { printElement } from "./element.js";
import { printInterpolationExpression } from "./interpolation.js";
import { formatAttributeValue } from "./utilities.js";

const embeddedAngularControlFlowBlocks = new Set([
  "if",
  "else if",
  "for",
  "switch",
  "case",
]);

function embed(path, options) {
  const { node } = path;

  switch (node.kind) {
    case "element":
      return printElement(path, options);

    case "text":
      if (
        node.parent.kind === "interpolation" &&
        node.parent.children.length === 1 &&
        node.parent.children[0] === node
      ) {
        return printInterpolationExpression;
      }
      break;

    case "attribute":
      return printAttribute(path, options);

    case "angularControlFlowBlockParameters":
      if (!embeddedAngularControlFlowBlocks.has(path.parent.name)) {
        return;
      }

      return printAngularControlFlowBlockParameters;

    case "angularLetDeclarationInitializer":
      return (textToDoc) =>
        formatAttributeValue(node.value, textToDoc, {
          parser: "__ng_binding",
          __isInHtmlAttribute: false,
        });
  }
}

export default embed;
