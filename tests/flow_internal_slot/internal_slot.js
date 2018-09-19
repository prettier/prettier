declare class C { static [[foo]]: T }
declare class C { [[foo]]: T }
interface T { [[foo]]: X }
interface T { [[foo]](): X }
type T = { [[foo]]: X }
type T = { [[foo]](): X }
type T = { [[foo]]?: X }
