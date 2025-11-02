type T<U> = 'a' | ('b' extends U ? 'c' : empty);
type T<U> = 'a' & ('b' extends U ? 'c' : empty);
