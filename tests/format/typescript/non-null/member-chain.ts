const { somePropThatHasAReallyLongName, anotherPropThatHasALongName } = this.props.imReallySureAboutThis!;

const { somePropThatHasAReallyLongName2, anotherPropThatHasALongName2 } = this.props.imReallySureAboutThis!.anotherObject;

this.foo.get("bar")!.doThings().more();

foo!.bar().baz().what();

xyz.a(b).a(b).a(b)
xyz.a(b!).a(b!).a(b!)
xyz.a(/a/).a(/a/).a(/a/)
xyz.a(/a/!).a(/a/!).a(/a/!)

obj[l] /* c */!.substring(0);
obj.aaa /* c */!.substring(0);
(obj.aaa
// c
)!.substring(0);
(obj.aaa
/* c1
c2 */
)!.substring(0);
(obj.aaa
// c
)![key].substring(0);
(obj.aaa
// c
)![0].substring(0);
(obj.aaa
// c
)!["str"].substring(0);
(obj.aaa
// c
)!?.[key].substring(0);
wrapper.foo() /* c1 */!.bar() /* c2 */!.baz() /* c3 */!.qux();
wrapper.foo() /* c */!!.bar();
