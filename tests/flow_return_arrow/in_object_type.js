const example1 = (): ({ p: string => string }) => (0: any);
const example2 = (): ({ p: { p: string => string } }) => (0: any);
const example3 = (): ({ p: { p: { p: string => string } } }) => (0: any);
const example4 = (): ({ p: { p: ?{ p: string => string } } }) => (0: any);
const example5 = (): ({ p: { p: { p: string => string } | string } }) =>
  (0: any);
const example6 = (): ({ p: { p: { p: string => string } & string } }) =>
  (0: any);
const example7 = (): ({ p: { p: { p: [(string) => string, string] } } }) =>
  (0: any);

function example8(): { p: string => string } {
  return (0: any);
}
function example9(): { p: { p: string => string } } {
  return (0: any);
}
function example10(): { p: { p: { p: string => string } } } {
  return (0: any);
}
