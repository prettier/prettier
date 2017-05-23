const webpack = require("webpack");
const path = require("path");

const ROOT_PATH = "../../";
const PARSERS = ["babylon-parser", "typescript-parser", "flow-parser"];

function getParserFiles() {
  return PARSERS.map(parser =>
    path.join(__dirname, ROOT_PATH, "src/parsers/", parser + ".js")
  );
}

function getParserEntries() {
  const parsers = getParserFiles();

  return parsers.reduce((obj, parser) => {
    obj[path.basename(parser, ".js")] = parser;
    return obj;
  }, {});
}

// Add all parsers as separate entry points
const entry = Object.assign(
  {},
  {
    index: path.join(__dirname, ROOT_PATH, "index.js")
  },
  getParserEntries()
);

const config = {
  entry,
  output: {
    path: path.join(__dirname, ROOT_PATH, "dist"),
    filename: "[name].js",
    libraryTarget: "commonjs2"
  },
  target: "node",
  resolve: {
    modules: [path.resolve(__dirname, ROOT_PATH, "node_modules")],
    extensions: [".json", ".js"]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: Object.keys(entry)
    })
  ]
};

module.exports = config;
