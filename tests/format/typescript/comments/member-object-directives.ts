declare function consume(value: Uint8Array): void;
declare function loadSource(): unknown;

consume(
  (
    // @ts-expect-error the conversion is intentional
    (loadSource(), (response: string) => response.substring(0, 1)) as Record<string, Uint8Array>
  )["url"],
);

declare const anotherLongIdentifier: number;
declare const veryLongFactor: number;
const result = (
  // @ts-ignore the missing name is intentional
  (nonexistentLongIdentifier + anotherLongIdentifier) * veryLongFactor
).toString();

const optional = (
  /* Before the directive. */
  // @ts-expect-error the conversion is intentional
  // Keep this comment in the same order.
  "text" as number
)?.toString();

// @ts-expect-error this directive applies to the property
("text" as string).unavailable;
