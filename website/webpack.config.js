import path from "node:path";

export default {
  entry: {
    playground: "./playground/index.js",
  },
  output: {
    filename: "[name].js",
    path: path.join(import.meta.dirname, "static"),
  },
  module: {
    rules: [
      {
        test: /\.js$/u,
        exclude: /node_modules/u,
        loader: "babel-loader",
        options: {
          presets: ["@babel/env", "@babel/react"],
        },
      },
    ],
  },
  externals: {
    clipboard: "ClipboardJS",
    codemirror: "CodeMirror",
    react: "React",
    "react-dom": "ReactDOM",
  },
};
