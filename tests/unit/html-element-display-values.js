import { htmlTagNames } from "html-tag-names";
import {
  CSS_DISPLAY_TAGS,
  CSS_DISPLAY_DEFAULT,
} from "../../src/language-html/constants.evaluate.js";

test("display", () => {
  const values = Object.fromEntries(
    htmlTagNames.map((tagName) => [
      tagName,
      CSS_DISPLAY_TAGS[tagName] ?? CSS_DISPLAY_DEFAULT,
    ]),
  );

  expect(values).toMatchSnapshot();
});
