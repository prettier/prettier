// @flow

type C = <H>(H) => $ObjMap<H, <X>(X)=>X>;
declare var c: C;
c('string')();
