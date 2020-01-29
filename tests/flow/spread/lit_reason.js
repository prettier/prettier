//@flow

declare function test(): {| foo: number |};
const y: {foo: number | string} = {...test()}; // Should not error
