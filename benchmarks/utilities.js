import { Bench } from "tinybench";

/**
@import {BenchOptions} from "tinybench";
@typedef {
  | {
      name: string,
      implementation: () => any
    }[]
  | Record<string, () => any>
} Implementations
*/

/**
@param {
  | string
  | {
      name: string,
      assert?: (result: any) => void,
    } & BenchOptions
} options
@param {Implementations} implementations
*/
async function runBenchmark(options, implementations) {
  if (typeof options === "string") {
    options = { name: options };
  }

  const { assert, ...benchOptions } = options;

  const bench = new Bench(benchOptions);

  let error;

  for (const { name, implementation } of Array.isArray(implementations)
    ? implementations
    : Object.entries(implementations).map(([name, implementation]) => ({
        name,
        implementation,
      }))) {
    bench.add(name, () => {
      try {
        const result = implementation();
        assert?.(result);
      } catch (assertionError) {
        error ??= Object.assign(assertionError, {
          case: `${benchOptions.name} >> ${name}`,
        });
      }
    });
  }

  await bench.run();

  console.log(bench.name);
  console.table(bench.table());

  if (error) {
    throw error;
  }
}

export { runBenchmark };
