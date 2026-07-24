import { elementAttributes } from "@prettier/html-attributes";
import { htmlTags } from "@prettier/html-tags";

const tagWithAttribute = elementAttributes.div
  ? "div"
  : htmlTags.find((tag) => elementAttributes[tag]);
const tagWithoutAttribute = !elementAttributes.span
  ? "span"
  : htmlTags.find((tag) => !elementAttributes[tag]);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      /* Indent */ `
        <${tagWithAttribute} CLASS="should print as lowercase">Tag with attributes</${tagWithAttribute}>
        <${tagWithoutAttribute} CLASS="should print as lowercase">Tag without attributes</${tagWithoutAttribute}>
      `,
    ],
  },
  ["html"],
);
