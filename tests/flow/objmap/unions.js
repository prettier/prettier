// @flow

type T = {p:string}|{p:number};
type U = $ObjMap<T,<V>(V) => V>;
({p:0}: T); // ok
({p:0}: U); // ok

type F = (<A>(A) => A)|(<B>(B) => null);
type V = $ObjMap<{+p:number},F>;
({p:0}: {+p:number|null}); // ok
({p:0}: V); // ok
