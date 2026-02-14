export interface MyInterface {
  someMethod: (a: number) => Promise<number>
  anotherMethod: (a: string) => Promise<string>
  (a: string): Promise<string>
}

// Arrow function property followed by construct signature
export interface WithConstruct {
  handler: (event: Event) => void
  new (config: object): WithConstruct
}

// Multiple call signatures after properties
export interface MultiCall {
  prop: string
  (a: number): number
  (a: string): string
}
