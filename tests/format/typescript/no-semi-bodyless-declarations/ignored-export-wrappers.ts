// prettier-ignore
for (;;) export function forLoop(  );
{ const live = 1; }

// prettier-ignore
for (const item of items) export function forOf(  );
{ const live = 2; }

// prettier-ignore
for (const key in object) export function forIn(  );
{ const live = 3; }

// prettier-ignore
while (condition) export default function whileLoop(  );
{ const live = 4; }

// prettier-ignore
with (object) export function withStatement(  );
{ const live = 5; }

// prettier-ignore
label: export declare module "labeled";
{ const live = 6; }

// prettier-ignore
if (condition) export function consequent(  );
{ const live = 7; }

// prettier-ignore
if (condition) {} else export declare function alternate(  ): void;
{ const live = 8; }

// prettier-ignore
for (;;) if (condition) while (other) label: export function nested(  );
;; /* between */
{ const live = 9; }
