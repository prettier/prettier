export = prettier;

declare interface Options {
  cursorOffset?: number;
  printWidth?: number;
  tabWidth?: number;
  useTabs?: boolean;
  semi?: boolean;
  singleQuote?: boolean;
  trailingComma?: 'none' | 'es5' | 'all';
  bracketSpacing?: boolean;
  jsxBracketSameLine?: boolean;
  rangeStart?: number;
  rangeEnd?: number;
  parser?: 'babylon' | 'flow' | 'typescript' | 'postcss' | 'json' | 'graphql';
  filepath?: string;
}

declare interface ConfigOpts {
  useCache?: boolean;
}

declare interface ResponseWithCursor {
  formatted: string;
  cursorOffset: number;
}

declare interface ResolveConfig {
  (filePath: string, options: ConfigOpts): Promise<Options | null>;
  sync(filePath: string, options: ConfigOpts): Options | null;
}

declare namespace prettier {
  let version: string;
  let resolveConfig: ResolveConfig;
  function format(source: string, options: Options): string;
  function check(source: string, options: Options): boolean;
  function formatWithCursor(source: string, options: Options): ResponseWithCursor;
  function clearConfigCache(): void;
}
