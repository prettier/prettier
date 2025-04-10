/**
 * Template literals and string literals should format similarly.
 *
 * @see https://github.com/prettier/prettier/issues/17255
 * @see tests/format/js/strings/
 * @see tests/format/js/template-literals/
 * @see tests/format/typescript/satisfies-operators/
 * @see tests/format/typescript/template-literals/
 */

const stringLongEnoughToWrap = 'The variable name and string are long enough that it wants a line break.';
const stringLongEnoughToWrapWrapped =
  'The variable name and string are long enough that it wants a line break.';
const templateLongEnoughToWrap = `The variable name and string are long enough that it wants a line break.`;
const templateLongEnoughToWrapWrapped =
  `The variable name and string are long enough that it wants a line break.`;
const taggedTemplateLongEnoughToWrap = tagged`The variable name and string are long enough that it wants a line break.`;
const taggedTemplateLongEnoughToWrapWrapped =
  tagged`The variable name and string are long enough that it wants a line break.`;

const stringWithInternalNewLine = 'The variable name and string are long \
enough that it wants a line break.';
const stringWithInternalNewLineWrapped =
  'The variable name and string are long \
enough that it wants a line break.';
const templateWithInternalNewLine = `The variable name and string are long
enough that it wants a line break.`;
const templateWithInternalNewLineWrapped =
  `The variable name and string are long
enough that it wants a line break.`;
const taggedTemplateWithInternalNewLine = tagged`The variable name and string
  are long enough that it wants a line break.`;
const taggedTemplateWithInternalNewLineWrapped =
  tagged`The variable name and string are long
  enough that it wants a line break.`;

const InObjectLiteral = {
  STRING_LONG_ENOUGH_TO_WRAP: 'The key name and string are long enough that it wants a line break.',
  STRING_LONG_ENOUGH_TO_WRAP_WRAPPED:
    'The key name and string are long enough that it wants a line break.',
  TEMPLATE_LONG_ENOUGH_TO_WRAP: `The key name and string are long enough that it wants a line break.`,
  TEMPLATE_LONG_ENOUGH_TO_WRAP_WRAPPED:
    `The key name and string are long enough that it wants a line break.`,
  TAGGED_TEMPLATE_LONG_ENOUGH_TO_WRAP: tagged`The key name and string are long enough that it wants a line break.`,
  TAGGED_TEMPLATE_LONG_ENOUGH_TO_WRAP_WRAPPED:
    tagged`The key name and string are long enough that it wants a line break.`,

  STRING_WITH_INTERNAL_NEW_LINE: 'The variable name and string are long \
enough that it wants a line break.',
  STRING_WITH_INTERNAL_NEW_LINE_WRAPPED:
    'The variable name and string are long \
enough that it wants a line break.',
  TEMPLATE_WITH_INTERNAL_NEW_LINE: `The key name and string
are long enough that it wants a line break.`,
  TEMPLATE_WITH_INTERNAL_NEW_LINE_WRAPPED:
    `The key name and string
are long enough that it wants a line break.`,
  TAGGED_TEMPLATE_WITH_INTERNAL_NEW_LINE: tagged`The key name and string
are long enough that it wants a line break.`,
  TAGGED_TEMPLATE_WITH_INTERNAL_NEW_LINE_WRAPPED:
    tagged`The key name and string
are long enough that it wants a line break.`,
};
