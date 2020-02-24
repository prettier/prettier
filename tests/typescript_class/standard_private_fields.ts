class Square {
    #sideLength: number;
    readonly #area: number;

    constructor(sideLength: number) {
        this.#sideLength = sideLength;
        this.#area = this.#sideLength ** 2;
    }

    equals(other: any) {
        return this.#sideLength === other.#sideLength;
    }
}
