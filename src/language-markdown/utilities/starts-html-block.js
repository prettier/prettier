import { htmlBlockNames, htmlRawNames } from "micromark-util-html-tag-name";

/*
CommonMark HTML block start conditions 1-6. These are the only ones that can
interrupt a paragraph, so a piece of inline HTML matching one of them ends the
paragraph it belongs to as soon as it starts a line. Condition 7 is deliberately
omitted: it cannot interrupt a paragraph.

https://spec.commonmark.org/0.31.2/#html-blocks
*/
const startConditions = [
  // 1: `<pre`, `<script`, `<style` or `<textarea`
  new RegExp(
    String.raw`^<(?:${htmlRawNames.join("|")})(?=[\t\n\f\r >]|$)`,
    "iu",
  ),
  // 2: `<!--`
  /^<!--/u,
  // 3: `<?`
  /^<\?/u,
  // 4: `<!` followed by an ASCII letter
  /^<![a-z]/iu,
  // 5: `<![CDATA[`
  /^<!\[CDATA\[/u,
  // 6: an open or closing tag for a known block-level element
  new RegExp(
    String.raw`^</?(?:${htmlBlockNames.join("|")})(?=[\t\n\f\r />]|$)`,
    "iu",
  ),
];

/**
 * Whether the given raw HTML would start a CommonMark HTML block, and therefore
 * end the current paragraph, if it were placed at the start of a line.
 *
 * @param {string} value
 * @returns {boolean}
 */
function startsHtmlBlock(value) {
  return startConditions.some((condition) => condition.test(value));
}

export { startsHtmlBlock };
