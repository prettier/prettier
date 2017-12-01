type simple0 = ()=>string;
type simple1 = ( ()=>string );
type simple2 = ((x:number)=>string);

type f0 = number | (() => string);
type f1 = () => string | number;
type f2 = (() => string) | number;
type f3 = (() => string) | (() => boolean);
type f4 = (() => string) & (() => boolean);
