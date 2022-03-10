"use strict";

function inferScriptParser({ type, lang }) {
  if (
    type === "module" ||
    type === "text/javascript" ||
    type === "text/babel" ||
    type === "application/javascript" ||
    lang === "jsx"
  ) {
    return "babel";
  }

  if (type === "application/x-typescript" || lang === "ts" || lang === "tsx") {
    return "typescript";
  }

  if (type === "text/markdown") {
    return "markdown";
  }

  if (type === "text/html") {
    return "html";
  }

  if (type && (type.endsWith("json") || type.endsWith("importmap"))) {
    return "json";
  }

  if (type === "text/x-handlebars-template") {
    return "glimmer";
  }
}

module.exports = inferScriptParser;
