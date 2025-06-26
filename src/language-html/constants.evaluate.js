import htmlUaStyles from "html-ua-styles";

const getCssStyleTags = (property) =>
  Object.fromEntries(
    htmlUaStyles.flatMap(({ type, selectors, styles }) => {
      if (type !== "Styles") {
        return [];
      }

      const style = styles.find((style) => style.property === property);
      if (!style) {
        return [];
      }

      return selectors.flatMap((selector) => {
        const tagNames =
          selector === ":heading"
            ? ["h1", "h2", "h3", "h4", "h5", "h6"]
            : /^[\da-z]+$/iu.test(selector)
              ? [selector]
              : [];

        return tagNames.map((tagName) => [tagName, style.value]);
      });
    }),
  );

const CSS_DISPLAY_TAGS = {
  ...getCssStyleTags("display"),

  // special cases for some css display=none elements
  template: "inline",
  source: "block",
  track: "block",
  script: "block",
  param: "block",

  // `noscript` is inline
  // noscript: "inline",

  // there's no css display for these elements but they behave these ways
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

export {
  CSS_DISPLAY_DEFAULT,
  CSS_DISPLAY_TAGS,
  CSS_WHITE_SPACE_DEFAULT,
  CSS_WHITE_SPACE_TAGS,
};
