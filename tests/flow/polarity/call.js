type O<+T> = { (x: T): void }; // Error: +T in a negative position
interface I<+T> { (x: T): void }; // Error: +T in a negative position (TODO)
