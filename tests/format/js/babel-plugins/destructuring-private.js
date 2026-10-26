/*
`destructuringPrivate` ([proposal](https://github.com/tc39/proposal-destructuring-private))
*/

class Example { #x = 1; method() { const { #x: x } = this; } }
