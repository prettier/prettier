type T = [number ?];
type Multiple = [number, string ?, boolean ?];
type Rest = [number ?, ...string[]];
type Inexact = [number ?, string ?, ...];
type Mixed = [number ?, label?: string];
type Nested = [[number ?] ?, Array<[string ?]> ?];
type Types = [(number | string) ?, (A & B) ?, (() => void) ?, (keyof T) ?, (readonly T[]) ?, (A extends B ? C : D) ?, (?number) ?, (typeof value) ?, (infer U) ?];
