// Issue #18858: Extra semicolon between arrow function property and call signature
export interface MyInterface {
  someMethod: (a: number) => Promise<number>
  anotherMethod: (a: string) => Promise<string>
  (a: string): Promise<string>
}

// Also verify with generic call signatures
interface WithGenericCall {
  method: (x: number) => void
  <T>(a: T): T
}

// Non-arrow property followed by call signature
interface NonArrow {
  name: string
  (a: string): string
}

// Type literal variant
type MyType = {
  method: (x: number) => Promise<number>
  (a: string): Promise<string>
}
