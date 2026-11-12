declare module "line-comment"; // trailing
// leading
{ console.log("live"); }

declare function a(); /* trailing */

/* leading */
{ console.log("live"); }

declare module "empty-statements";;; /* between */
;
{ console.log("live"); }

declare function b();;;
{ console.log("live"); }

declare function c();
// prettier-ignore
{console.log("live")}

// prettier-ignore
declare function d(  );
{ console.log("live"); }

// prettier-ignore
declare module "ignored";
{ console.log("live"); }
