class C { constructor(public x: string) {} }

class Modifiers {
constructor(private readonly x:number=1, protected y:string="value", public z:boolean=false) {}
}

class Readonly { constructor(readonly value: number) {} }

class Mixed { constructor(public x: string, y: number) {} }

class DefaultValue {
constructor(public options: {enabled: boolean, name: string} = {enabled: true, name: "default"}) {}
}
