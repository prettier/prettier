/**
 * @format
 * @flow
 */

({
  a: true, // Error: should be grouped
  b: true, // Error: should be grouped, should not show the {} branch
  c: true, // Error: should be grouped, should not show the {} branch
  d: true, // Error: should be grouped, should not show the {} branch
}: {
  a: number | string,
  b: {} | number | string,
  c: number | {} | string,
  d: number | string | {},
});
