// @flow

function foo(map: { [key: string]: mixed }) {
  const first = { some: "hello" };
  const options = { some: 42  };
  return Object.assign (
    {
      first,
      ...map // Error, can't spread indexer second
    },
    options
  );
}
