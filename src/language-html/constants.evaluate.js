"use strict";

const htmlStyles = require("html-styles");

const getCssStyleTags = property =>
  htmlStyles
    .filter(htmlStyle => htmlStyle.style[property])
    .map(htmlStyle =>
      htmlStyle.selectorText
        .split(",")
        .map(selector => selector.trim())
        .filter(selector => /^[a-zA-Z0-9]+$/.test(selector))
        .reduce((reduced, tagName) => {
          reduced[tagName] = htmlStyle.style[property];
          return reduced;
        }, {})
    )
    .reduce((reduced, value) => Object.assign(reduced, value), {});

const CSS_DISPLAY_TAGS = Object.assign({}, getCssStyleTags("display"), {
  // TODO: send PR to upstream
  button: "inline-block",

  // special cases for some css display=none elements
  template: "inline",
  source: "block",
  track: "block",
  script: "block",

  // there's no css display for these elements but they behave these ways
  video: "inline-block",
  audio: "inline-block"
});
const CSS_DISPLAY_DEFAULT = "inline";
const CSS_WHITE_SPACE_TAGS = getCssStyleTags("white-space");
const CSS_WHITE_SPACE_DEFAULT = "normal";

module.exports = {
  CSS_DISPLAY_TAGS,
  CSS_DISPLAY_DEFAULT,
  CSS_WHITE_SPACE_TAGS,
  CSS_WHITE_SPACE_DEFAULT
};
