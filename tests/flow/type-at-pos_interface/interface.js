// @flow

interface IA {
  mm(x: string): string;
  mm(x: number): number;
  mf : ((x: number) => number) & ((x: string) => string);
}

declare var i_a: IA;
i_a.mm("x");
i_a.mm(1);

i_a.mf("x");
i_a.mf(1);

interface I {
  get y(): string;
  set y(x: number): void;
}
