// @flow

function foo<T>(x: T) {
  return { f: x };
}

const bar = <T>(x: T) => ({ f: x });

const obj = {
  m<T>(x: T) {
    return { f: x };
  }
}
