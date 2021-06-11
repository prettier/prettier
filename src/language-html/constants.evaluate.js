"use strict";

const htmlStyles = require("html-styles");

const getCssStyleTags = (property) =>
  Object.fromEntries(
    htmlStyles
      .filter((htmlStyle) => htmlStyle.style[property])
      .flatMap((htmlStyle) =>
        htmlStyle.selectorText
          .split(",")
          .map((selector) => selector.trim())
          .filter((selector) => /^[\dA-Za-z]+$/.test(selector))
          .map((tagName) => [tagName, htmlStyle.style[property]])
      )
  );

const CSS_DISPLAY_TAGS = {
  ...getCssStyleTags("display"),

  // TODO: send PR to upstream
  button: "inline-block",

  // special cases for some css display=none elements
  template: "inline",
  source: "block",
  track: "block",
  script: "block",
  param: "block",

  // `noscript` is inline
  // noscript: "inline",

  // there's no css display for these elements but they behave these ways
  details: "block",
  summary: "block",
  dialog: "block",
  meter: "inline-block",
  progress: "inline-block",
  object: "inline-block",
  video: "inline-block",
  audio: "inline-block",
  select: "inline-block",
  option: "block",
  optgroup: "block",
};
const CSS_DISPLAY_DEFAULT = "inline";
const CSS_WHITE_SPACE_TAGS = getCssStyleTags("white-space");
const CSS_WHITE_SPACE_DEFAULT = "normal";

module.exports = {
  CSS_DISPLAY_TAGS,
  CSS_DISPLAY_DEFAULT,
  CSS_WHITE_SPACE_TAGS,
  CSS_WHITE_SPACE_DEFAULT,
};
