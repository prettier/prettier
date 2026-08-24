const { somePropThatHasAReallyLongName, anotherPropThatHasALongName } = this.props.imReallySureAboutThis!;

const { somePropThatHasAReallyLongName2, anotherPropThatHasALongName2 } = this.props.imReallySureAboutThis!.anotherObject;

this.foo.get("bar")!.doThings().more();

foo!.bar().baz().what();

xyz.a(b).a(b).a(b)
xyz.a(b!).a(b!).a(b!)
xyz.a(/a/).a(/a/).a(/a/)
xyz.a(/a/!).a(/a/!).a(/a/!)

obj[l] /* This is a very very very very very long inline comment about something */!.substring(0);
obj.aaa /* This is a very very very very very long inline comment about something */!.substring(0);
wrapper.foo() /* comment aaaa */!.bar() /* comment bbbb */!.baz() /* comment cccc */!.qux();
wrapper.foo() /* This is a very very very very long inline comment about something */!!.bar();
