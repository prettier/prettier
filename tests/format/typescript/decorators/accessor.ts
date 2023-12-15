class A extends Base {
    @foo()
    get a() {return 1}
    @bar()
    set a(v) {}

    @foo()
    public override get b() {return 1}
    @bar()
    public override set b(v) {this._b = v}
}
