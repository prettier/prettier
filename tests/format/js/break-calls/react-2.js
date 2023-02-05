const foo1 = useCallback(() => {
  // do something
}, []);
const foo2 = useCallback((param) => {
  // do something
}, []);
const foo3 = useCallback(() => {
  // do something
}, [dep]);
const foo4 = useCallback((param) => {
  // do something
}, [dep]);
