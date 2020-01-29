// @flow strict

// this file should not time out

declare function useState<S>(initialState: S): [S, (S) => void];

const [array, update] = useState([]);

const add1 = x => update([...array, x]);
const add2 = x => update([...array, x]);
update([...array]);
update([...array]);
