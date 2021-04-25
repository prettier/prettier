declare export function graphql<Props, Variables, Component: React$ComponentType<Props>>
  (query: GQLDocument, config?: Config<Props, QueryConfigOptions<Variables>>):
  (Component: Component) => React$ComponentType<$Diff<React$ElementConfig<Component>, {
    data: Object|<<<PRETTIER_RANGE_START>>>void<<<PRETTIER_RANGE_END>>>,
    mutate: Function|void
  }>>

declare type FetchPolicy= "cache-first" | "cache-and-network" | "network-only" | "cache-only"
