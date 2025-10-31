class A implements B {}
class B implements B, C {}
declare class C implements B {}
declare class D mixins B implements C {}
declare class E implements B, C {}
