/**
 * @format
 * @flow
 */

type X =
  | {type: 'A', p: number}
  | {type: 'B', p: string}
  | {type: 'C', p: boolean};

({type: 'A', p: 'foo'}: X);
({type: 'D'}: X);
