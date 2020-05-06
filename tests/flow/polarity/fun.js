type Arg<T> = T => void; // OK
type ArgNeg<-T> = T => void; // OK
type ArgPos<+T> = T => void; // Error: +T in negative position
type FlipArgNeg<-T> = (T => void) => void; // Error: -T in positive position
type FlipArgPos<+T> = (T => void) => void; // OK
type Ret<T> = () => T; // OK
type RetNeg<-T> = () => T; // Error: -T in positive position
type RetPos<+T> = () => T; // OK
type FlipRetNeg<-T> = (() => T) => void; // OK
type FlipRetPos<+T> = (() => T) => void; // Error: +T in negative position
