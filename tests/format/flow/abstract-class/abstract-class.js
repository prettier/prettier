// @flow

abstract class Minimal { abstract property:number; abstract method(value:string):number; }

abstract // before class
class LineCommented {
  abstract // before property
  property: number;
  abstract override // before inherited property
  inheritedProperty: number;
}

@decorator("abstract class")
abstract /* before decorated class */ class Decorated {
  @decorator("override")
  override /* after decorated override */ method(): void {}
}

export default abstract /* before class */ class Example<T> extends Base<T> {
  abstract /* after abstract */ property: /* after colon */ number;
  abstract covariant: string;
  abstract [computedProperty]: VeryLongTypeNameThatMakesTheAbstractPropertyDeclarationWrap | AnotherVeryLongTypeNameThatProvidesABreakOpportunity;
  abstract [Symbol.iterator]: () => Iterator<T>;
  abstract [computedMethod]<U>(value: U, optional?: T): Promise<U>;
  public abstract accessibleProperty: number;
  protected abstract accessibleMethod(): void;
  abstract override /* after override */ inheritedProperty: number;
  abstract override inheritedMethod(value: T): void;

  override field: number;
  static override computed = 1;
  override method(): void {}
  override [otherComputed](): void {}
  override get value(): number { return 1; }
  override set value(next: number): void {}
}

const Expression = abstract class { abstract value: string; };

declare abstract /* before declared class */ class Declared extends Base {
  public abstract property: number;
  protected abstract method(): void;
  abstract optionalMethod?(): void;
  abstract override /* after override */ inherited: string;
  abstract override optionalInheritedMethod?(): void;
  override concreteInherited: boolean;
}
