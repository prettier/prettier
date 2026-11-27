import postcssMediaQueryParser from "postcss-media-query-parser";

const parse = postcssMediaQueryParser.default;

/**
@param {string} source
*/
function parseMediaQuery(source) {
  let result;

  try {
    result = parse(source);
  } catch {
    // Ignore bad media queries
    /* c8 ignore next 4 */
    return {
      type: "media-unknown",
      value: source,
    };
  }

  result.walk((node) => {
    const { type } = node;
    if (!type) {
      node.type = "media-unknown";
    } else if (!type.startsWith("media-")) {
      node.type = `media-${type}`;
    }
  });

  return result;
}

export default parseMediaQuery;
