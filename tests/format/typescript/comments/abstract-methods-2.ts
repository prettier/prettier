// #18478

declare class DeclareCls {
  method(
    param1: number,
    // trailing line after last param
  ): void;
}

class Overload {
  method(
    param1: number,
    // trailing line on first overload
  ): void;
  method(param1: string): void;
  method(param1: number | string): void {}
}
