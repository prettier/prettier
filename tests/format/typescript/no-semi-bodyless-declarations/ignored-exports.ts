// prettier-ignore
export declare function ambient(  ): void;
{ const live = 1; }

// prettier-ignore
export function named(  );
{ const live = 2; }

// prettier-ignore
export default function defaultExport(  );
{ const live = 3; }

// prettier-ignore
export declare module "ignored-export";
{ const live = 4; }
