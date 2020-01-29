// @flow
export const checkComponent = (obj: any[]): Object[] =>
  obj.reduce((acc, x) => {
    if (x === undefined) {
      return [...acc, {}];
    }

    if (x === 'hi') {
      return [...acc, {}];
    }

    if (x.err) {
      return [...acc, {}];
    }
    return acc;
  }, []);
