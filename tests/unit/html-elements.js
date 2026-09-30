import { elementAttributes, globalAttributes } from "@prettier/html-attributes";
import { htmlTags } from "@prettier/html-tags";
import {
  CSS_DISPLAY_DEFAULT,
  CSS_DISPLAY_TAGS,
  CSS_WHITE_SPACE_DEFAULT,
  CSS_WHITE_SPACE_TAGS,
} from "../../src/language-html/constants.evaluate.js";

// Snapshot to notify changes
test("htmlTagNames", () => {
  const data = htmlTags.map((tagName) => ({
    tagName,
    display: CSS_DISPLAY_TAGS[tagName] ?? CSS_DISPLAY_DEFAULT,
    whiteSpace: CSS_WHITE_SPACE_TAGS[tagName] ?? CSS_WHITE_SPACE_DEFAULT,
    attributes: elementAttributes[tagName] ?? [],
  }));

  expect(data).toMatchSnapshot();
});

test("Global attributes", () => {
  expect(globalAttributes).toMatchSnapshot();
});
