/**
 * @format
 * @flow
 */

function fn<T: {p: number}>(f: T => void): ($Diff<T, {p: number}>) => void {
  return o => f({...o, p: 42});
}

export default fn((t: {|p: number|}) => {});
