import postcssVisitorKeys from "../../src/language-css/visitor-keys.js";
import graphqlVisitorKeys from "../../src/language-graphql/visitor-keys.js";
import glimmerVisitorKeys from "../../src/language-handlebars/visitor-keys.evaluate.js";
import htmlVisitorKeys from "../../src/language-html/visitor-keys.js";
import estreeVisitorKeys from "../../src/language-js/traverse/visitor-keys.evaluate.js";
import jsonVisitorKeys from "../../src/language-json/visitor-keys.js";
import remarkVisitorKeys from "../../src/language-markdown/visitor-keys.js";
import yamlVisitorKeys from "../../src/language-yaml/visitor-keys.js";

// Keep eye on package change
describe("visitor keys", () => {
  test.each([
    { name: "estree", visitorKeys: estreeVisitorKeys },
    { name: "estree-json", visitorKeys: jsonVisitorKeys },
    { name: "postcss", visitorKeys: postcssVisitorKeys },
    { name: "graphql", visitorKeys: graphqlVisitorKeys },
    { name: "glimmer", visitorKeys: glimmerVisitorKeys },
    { name: "html", visitorKeys: htmlVisitorKeys },
    { name: "remark", visitorKeys: remarkVisitorKeys },
    { name: "yaml", visitorKeys: yamlVisitorKeys },
  ])("$name", ({ visitorKeys }) => {
    visitorKeys = Object.fromEntries(
      Object.entries(visitorKeys).map(([type, keys]) => [
        type,
        [...keys].sort(),
      ]),
    );
    expect(visitorKeys).toMatchSnapshot();
  });
});
