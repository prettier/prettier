// @flow

export default function fn<A>(arg: ({...A, c: number}) => void): A => void {
  return (a: A) => arg({...a, c: 42});
}
