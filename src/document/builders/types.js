export const DOC_TYPE_STRING = /** @type {const} */ ("string");
export const DOC_TYPE_ARRAY = /** @type {const} */ ("array");
export const DOC_TYPE_CURSOR = /** @type {const} */ ("cursor");
export const DOC_TYPE_INDENT = /** @type {const} */ ("indent");
export const DOC_TYPE_ALIGN = /** @type {const} */ ("align");
export const DOC_TYPE_TRIM = /** @type {const} */ ("trim");
export const DOC_TYPE_GROUP = /** @type {const} */ ("group");
export const DOC_TYPE_FILL = /** @type {const} */ ("fill");
export const DOC_TYPE_IF_BREAK = /** @type {const} */ ("if-break");
export const DOC_TYPE_INDENT_IF_BREAK = /** @type {const} */ (
  "indent-if-break"
);
export const DOC_TYPE_LINE_SUFFIX = /** @type {const} */ ("line-suffix");
export const DOC_TYPE_LINE_SUFFIX_BOUNDARY = /** @type {const} */ (
  "line-suffix-boundary"
);
export const DOC_TYPE_LINE = /** @type {const} */ ("line");
export const DOC_TYPE_LABEL = /** @type {const} */ ("label");
export const DOC_TYPE_BREAK_PARENT = /** @type {const} */ ("break-parent");

export const VALID_OBJECT_DOC_TYPES = new Set([
  DOC_TYPE_CURSOR,
  DOC_TYPE_INDENT,
  DOC_TYPE_ALIGN,
  DOC_TYPE_TRIM,
  DOC_TYPE_GROUP,
  DOC_TYPE_FILL,
  DOC_TYPE_IF_BREAK,
  DOC_TYPE_INDENT_IF_BREAK,
  DOC_TYPE_LINE_SUFFIX,
  DOC_TYPE_LINE_SUFFIX_BOUNDARY,
  DOC_TYPE_LINE,
  DOC_TYPE_LABEL,
  DOC_TYPE_BREAK_PARENT,
]);
