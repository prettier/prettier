export interface MyInterface {
  someMethod: (a: number) => Promise<number>
  anotherMethod: (a: string) => Promise<string>
  (a: string): Promise<string>
}

export type MyType = {
  someMethod: (a: number) => Promise<number>
  anotherMethod: (a: string) => Promise<string>
  (a: string): Promise<string>
}
