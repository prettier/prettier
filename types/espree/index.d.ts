declare module "espree" {
  // https://github.com/eslint/espree#options
  export interface Options {
    range?: boolean;
    loc?: boolean;
    comment?: boolean;
    tokens?: boolean;
    ecmaVersion?: "latest";
    sourceType?: "script" | "module" | "commonjs";
    ecmaFeatures?: {
      jsx?: boolean;
      impliedStrict?: boolean;
    };
  }
  // https://github.com/eslint/espree#parse
  export function parse(code: string, options?: Options): any;
}
