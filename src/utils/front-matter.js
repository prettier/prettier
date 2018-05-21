"use strict";

function parse(text) {
  let delimiter;

  if (text.indexOf("---") === 0) {
    delimiter = "---";
  } else if (text.indexOf("+++") === 0) {
    delimiter = "+++";
  }

  let end = -1;

  if (!delimiter || (end = text.indexOf(`\n${delimiter}`, 3)) === -1) {
    return { frontMatter: null, content: text };
  }

  end = end + 4;

  return {
    frontMatter: text.slice(0, end),
    content: text.slice(end)
  };
}

module.exports = parse;
