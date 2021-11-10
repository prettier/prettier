abstract class Foo {
    abstract private a: 1;
    private abstract b: 2;
    static abstract c: 3;

    abstract private d = 4;
    private abstract e = 5;
    static abstract f = 6;

    abstract private ['g'] = 4;
    private abstract ['h'] = 5;
    static abstract ['i'] = 6;
}
