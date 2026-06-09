type T = {p:string}|{p:number};
type IdentityMap<O> = {[K in keyof O]: O[K]};
type U = IdentityMap<T>;
({p:0} as T); // ok
({p:0} as U); // ok
({p:'0'} as T); // ok
({p:'0'} as U); // ok
({p:false} as T); // error
({p:false} as U); // error
