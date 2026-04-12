// https://github.com/prettier/prettier/issues/18858
// Arrow function property followed by call signature should not get spurious semicolon

export interface MyInterface {
  someMethod: (a: number) => Promise<number>
  anotherMethod: (a: string) => Promise<string>
  (a: string): Promise<string>
}

// Generic call signature still needs semicolon before it
interface WithGenericCallSig {
  foo: string
  <T>(a: T): T
}

// Multiple arrow function properties, last followed by call signature
interface MultipleProps {
  method1: (a: string) => void
  method2: (b: number) => boolean
  (): string
}
