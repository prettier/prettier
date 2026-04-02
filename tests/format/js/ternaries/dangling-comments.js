// #18944 - dangling comments in array/object alternate should not be duplicated
const a = condition ? ifTrue : [
  // Hello, world!
]

const b = condition ? ifTrue : {
  // Hello, world!
}

// Consequent side
const c = condition ? [
  // Hello, world!
] : ifFalse

const d = condition ? {
  // Hello, world!
} : ifFalse

// Nested ternary with array alternate
const e = cond1 ? cond2 ? a : [
  // nested comment
] : b

// Non-empty array with dangling comment
const f = condition ? ifTrue : [
  1,
  // trailing dangling comment
]
