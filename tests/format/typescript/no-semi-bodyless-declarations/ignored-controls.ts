// prettier-ignore
export declare function ordinary(  ): void;
console.log("ordinary");

// prettier-ignore
export declare module "array";
[call()];

// prettier-ignore
export function implementation(  ) { return 1; }
{ const live = 1; }

// prettier-ignore
export namespace WithBody { const value = 1; }
{ const live = 2; }

// prettier-ignore
export const value =  1;
{ const live = 3; }

// prettier-ignore
export { value as renamed };
{ const live = 4; }

// prettier-ignore
export default function end(  );
