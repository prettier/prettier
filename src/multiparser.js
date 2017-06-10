"use strict";

const util = require("./util");
const docBuilders = require("./doc-builders");
const indent = docBuilders.indent;
const hardline = docBuilders.hardline;
const softline = docBuilders.softline;
const concat = docBuilders.concat;

/**
 * @returns {{ parser: string, text: string, wrap?: Function } | void}
 */
function getSubtreeParser(path, options) {
  switch (options.parser) {
    case "parse5":
      return fromHtmlParser2(path, options);
    case "babylon":
    case "flow":
    case "typescript":
      return fromBabylonFlowOrTypeScript(path, options);
  }
}

function fromBabylonFlowOrTypeScript(path) {
  const node = path.getValue();

  switch (node.type) {
    case "TemplateElement": {
      const parent = path.getParentNode();
      const parentParent = path.getParentNode(1);
      const parentParentParent = path.getParentNode(2);

      /*
       * styled-jsx:
       * ```jsx
       * <style jsx>{`div{color:red}`}</style>
       * ```
       */
      if (
        parentParentParent &&
        parent.quasis &&
        parent.quasis.length === 1 &&
        parentParent.type === "JSXExpressionContainer" &&
        parentParentParent.type === "JSXElement" &&
        parentParentParent.openingElement.name.name === "style" &&
        parentParentParent.openingElement.attributes.some(
          attribute => attribute.name.name === "jsx"
        )
      ) {
        return {
          parser: "postcss",
          wrap: doc =>
            concat([
              indent(concat([softline, stripTrailingHardline(doc)])),
              softline
            ]),
          text: parent.quasis[0].value.raw
        };
      }

      /*
       * styled-components:
       * styled.button`color: red`
       * Foo.extend`color: red`
       */
      if (
        parentParent &&
        parentParent.type === "TaggedTemplateExpression" &&
        parent.quasis.length === 1 &&
        parentParent.tag.type === "MemberExpression" &&
        (parentParent.tag.object.name === "styled" ||
          (/^[A-Z]/.test(parentParent.tag.object.name) &&
            parentParent.tag.property.name === "extend"))
      ) {
        return {
          parser: "postcss",
          wrap: doc =>
            concat([
              indent(concat([softline, stripTrailingHardline(doc)])),
              softline
            ]),
          text: parent.quasis[0].value.raw
        };
      }

      /*
       * react-relay and graphql-tag
       * graphql`...`
       * gql`...`
       */
      if (
        parentParent &&
        parentParent.type === "TaggedTemplateExpression" &&
        parent.quasis.length === 1 &&
        // ((parentParent.tag.type === "MemberExpression" &&
        //   parentParent.tag.object.name === "Relay" &&
        //   parentParent.tag.property.name === "QL") ||
        (parentParent.tag.type === "Identifier" &&
          (parentParent.tag.name === "gql" ||
            parentParent.tag.name === "graphql"))
      ) {
        return {
          parser: "graphql",
          wrap: doc => concat([indent(concat([softline, doc])), softline]),
          text: parent.quasis[0].value.raw
        };
      }

      break;
    }
  }
}

function fromHtmlParser2(path, options) {
  const node = path.getValue();

  switch (node.type) {
    case "text": {
      const parent = path.getParentNode();
      // Inline JavaScript
      if (
        parent.type === "script" &&
        ((!parent.attribs.lang && !parent.attribs.lang) ||
          parent.attribs.type === "text/javascript" ||
          parent.attribs.type === "application/javascript")
      ) {
        const parser = options.parser === "flow" ? "flow" : "babylon";
        return {
          parser,
          wrap: doc => concat([hardline, doc]),
          text: getText(options, node)
        };
      }

      // Inline TypeScript
      if (
        parent.type === "script" &&
        (parent.attribs.type === "application/x-typescript" ||
          parent.attribs.lang === "ts")
      ) {
        return {
          parser: "typescript",
          wrap: doc => concat([hardline, doc]),
          text: getText(options, node)
        };
      }

      // Inline Styles
      if (parent.type === "style") {
        return {
          parser: "postcss",
          wrap: doc => concat([hardline, stripTrailingHardline(doc)]),
          text: getText(options, node)
        };
      }

      break;
    }
  }
}

function getText(options, node) {
  return options.originalText.slice(util.locStart(node), util.locEnd(node));
}

function stripTrailingHardline(doc) {
  // HACK remove ending hardline, original PR: #1984
  if (
    doc.type === "concat" &&
    doc.parts[0].type === "concat" &&
    doc.parts[0].parts.length === 2 &&
    doc.parts[0].parts[1] === hardline
  ) {
    return doc.parts[0].parts[0];
  }
  return doc;
}

module.exports = {
  getSubtreeParser
};
