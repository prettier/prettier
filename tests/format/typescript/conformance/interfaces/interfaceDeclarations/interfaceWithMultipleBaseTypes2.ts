interface Base {
    x: {
        a?: string; b: string;
    }
}

interface Base2 {
    x: {
        b: string; c?: number;
    }
}

interface Derived extends Base, Base2 {
    x: { b: string }
}

interface Derived2 extends Base, Base2 {
    x: { a: number; b: string }
}

interface Derived3 extends Base, Base2 {
    x: { a: string; b: string }
}
