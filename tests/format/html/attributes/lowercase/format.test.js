import { elementAttributes } from "@prettier/html-attributes";
import { htmlTags } from "@prettier/html-tags";
import { outdent } from "outdent";

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
      outdent`
        <${tagWithAttribute}
          CLASS="should print as lowercase"
          UNKNOWN="should print as uppercase"
        >Tag with attributes</${tagWithAttribute}>
        <${tagWithoutAttribute}
          CLASS="should print as lowercase"
          UNKNOWN="should print as uppercase"
        >Tag without attributes</${tagWithoutAttribute}>
        <unknown
          CLASS="should print as uppercase"
          UNKNOWN="should print as uppercase"
        >Non-html element</unknown>
      `,
    ],
  },
  ["html"],
);
