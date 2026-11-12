// prettier-ignore
export declare function commented(  ): void /* before separator */ ; // trailing
/* leading */
{ const live = 1; }

// prettier-ignore
export declare module "empty-statements";;; /* between */
// prettier-ignore
;
{ const live = 2; }

// prettier-ignore
export function objectReturn(  ): { value: string };
// prettier-ignore
{const live = 3;}

// prettier-ignore
declare function retained(  ): void /* before separator */ ; // trailing
;;
{ const live = 4; }
