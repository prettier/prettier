/* @flow */

import { type integer, floor } from "./Integer"
declare function parseInt(x: string): number;

export const parseInteger = (input: string): ?integer => {
  const value = parseInt(input)
  return value === value ? floor(value) : null
}
