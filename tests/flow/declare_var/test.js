declare var x: T;

(0: T); // OK
(null: T); // error: null ~> number

type T = number;
