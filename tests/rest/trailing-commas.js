declare class C {
  f(
    superSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperLong,
    ...args
  ): void,
}

function f(
  superSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperLong,
  ...args
) {}

declare class C { f(...superSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperLong): void; }

[superSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperSuperLong,,]
