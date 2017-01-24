declare class C {
    static x: number;
    static foo(x: number): void;
}

C.x = "";
C.foo("");

(C.name: string);
(C.name: number); // error, it's a string
