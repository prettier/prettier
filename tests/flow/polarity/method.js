type F<-X> = (x: X) => void;
type A<-X> = {
  x: <+X>(x: F<X>) => void; 
}
