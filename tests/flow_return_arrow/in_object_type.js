const example1 = (): { p: (string => string) } => (0: any);
const example2 = (): { p: { p: (string => string) } } => (0: any);
const example3 = (): { p: { p: { p: (string => string) } } } => (0: any);
function example4(): { p: string => string } {
  return (0: any);
}
function example5(): { p: { p: string => string } } {
  return (0: any);
}
function example5(): { p: { p: { p: string => string } } } {
  return (0: any);
}
