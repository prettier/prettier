declare export function graphql<Props, <<<PRETTIER_RANGE_START>>>Variables<<<PRETTIER_RANGE_END>>>, Component: React$ComponentType<Props>>
  (query: GQLDocument, config?: Config<Props, QueryConfigOptions<Variables>>):
  (Component: Component) => React$ComponentType<$Diff<React$ElementConfig<Component>, {
    data: Object|void,
    mutate: Function|void
  }>>

declare type FetchPolicy= "cache-first" | "cache-and-network" | "network-only" | "cache-only"
