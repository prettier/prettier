type Field<T> = {x: T}; // OK
type FieldNeg<-T> = {x: T}; // Error: -T in neutral position
type FieldPos<+T> = {x: T}; // Error: +T in neutral position
type PosField<T> = {+p: T}; // OK
type PosFieldNeg<-T> = {+p: T}; // Error: -T in positive position
type PosFieldPos<+T> = {+p: T}; // OK
type FlipPosFieldNeg<-T> = ({+x: T}) => void; // OK
type FlipPosFieldPos<+T> = ({+x: T}) => void; // Error: +T in negative position
type NegField<T> = {-p: T}; // OK
type NegFieldNeg<-T> = {-p: T}; // OK
type NegFieldPos<+T> = {-p: T}; // Error: +T in negative position
type FlipNegFieldNeg<-T> = ({-x: T}) => void; // Error: -T in positive position
type FlipNegFieldPos<+T> = ({-x: T}) => void; // OK
type Get<T> = {get p(): T}; // OK
type GetNeg<-T> = {get p(): T}; // Error: -T in positive position
type GetPos<+T> = {get p(): T}; // OK
type Set<T> = {set p(x:T): void}; // OK
type SetNeg<-T> = {set p(x:T): void}; // OK
type SetPos<+T> = {set p(x:T): void}; // Error: +T in negative position
