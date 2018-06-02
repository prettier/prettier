"use strict";

const printer = require("./printer-glimmer");

// Based on:
// https://github.com/github/linguist/blob/master/lib/linguist/languages.yml

const languages = [
  {
    type: "markup",
    group: "HTML",
    aliases: ["hbs", "htmlbars"],
    extensions: [".handlebars", ".hbs"],
    tm_scope: "text.html.handlebars",
    ace_mode: "handlebars",
    language_id: 155,
    since: null // unreleased
  }
];

const printers = {
  glimmer: printer
};

module.exports = {
  languages,
  printers
};
