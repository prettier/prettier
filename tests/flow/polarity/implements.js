interface I<-T> {}
class C<+T> implements I<T> {} // Error: +T in a negative position
