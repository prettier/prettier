foo = esBundle.output.find(
  (chunk) => chunk.fileName === 'foo.js',
) as OutputChunk

cases = [
  {
    name: 'when host is undefined',
    urls,
    host: undefined,
    expected: 'http://localhost:5173',
  },
] satisfies ReadonlyArray<{
  name: string
  urls: ResolvedServerUrls
  host: CommonServerOptions['host']
  expected: string | undefined
}>

newOptions = { ...(options ?? {}), ssr } as T & {
  ssr?: boolean
}

rolldownOptions = merged.rolldownOptions as Exclude<
  DepOptimizationOptions['rolldownOptions'],
  undefined,
>

environmentPlugins.push(
  ...((await asyncFlattenasyncFlatten(arraify(applied))).filter(Boolean) as
    Plugin[]),
);

scriptNode =
  node.node.node.childNodes.pop() as DefaultTreeAdapterMap["textNode"];

scriptNode2 = node.childNodes[node.childNodes.length - 1] as
  DefaultTreeAdapterMap["textNode"];

url_url_url = (typeof urlOrServer === 'string' ? urlOrServer : configOrUrl) as
    string

foo(new Set([...seen].map((mod) => mod._clientModule).filter(Boolean)) as
  Set<EnvironmentModuleNode>);

shortcuts = customShortcuts.concat(
  (isDev ? BASE_DEV_DEV_SHORTCUTS : BASE_PREVIEW_SHORTCUTS) as CLIShortcut<Server>[],
);

createFilter = _createFilter as (
  include?: FilterPattern,
  exclude?: FilterPattern,
  options?: { resolve?: string | false | null },
) => (id: string | unknown) => boolean

streams = {} as {
  build: { out: string[]; err: string[] }
  server: { out: string[]; err: string[] }
}

config = context.options[0] as { message: string; message: string; functions: string[] }[];

functionArg = a as TSESTree.ArrowFunctionExpression | TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression | undefined;
functionArg = a as
  // comment
  TSESTree.ArrowFunctionExpression | TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression | undefined;
functionArg = a as TSESTree.ArrowFunctionExpression & TSESTree.ArrowFunctionExpression & TSESTree.FunctionExpression & undefined;
functionArg = a as
  // comment
  TSESTree.ArrowFunctionExpression & TSESTree.ArrowFunctionExpression & TSESTree.FunctionExpression & undefined;
foo = esBundle.output.find(
  (chunk) => chunk.fileName === 'foo.js',
) as TSESTree.ArrowFunctionExpression | TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
