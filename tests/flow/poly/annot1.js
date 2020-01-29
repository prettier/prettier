export const f = <T>(x: T) => (y: T) => y;
export const g = <T>(x: T): (T => T) => (y: T) => y;
