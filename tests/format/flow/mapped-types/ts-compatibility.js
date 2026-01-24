// Tests that on single-line mapped types Flow and TS make the same formatting decisions

type Test = {[key in T]: number};
type Test = {[key in keyof T]: number};
type Test = {[otherKeyName     in keyof T]: number};
type Test = {[key in T]:number};
type Test = {[key in T]+?:number};
type Test = {[key in T]-?:                   number};
