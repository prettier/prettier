type a1 = (
    | {//
      }
    | {//
      },
  ) => void

type a2 = (
// Comment
    | {//
      }
    | {//
      },
  ) => void

hook useRefetchFunction(
  dispatch: (
    | {
        environment: IEnvironment,
        fragmentIdentifier: string,
        type: 'reset',
      }
    | {
        fetchPolicy?: FetchPolicy,
        onComplete?: (Error | null) => void,
        refetchEnvironment: ?IEnvironment,
        refetchQuery: OperationDescriptor,
        renderPolicy?: RenderPolicy,
        type: 'refetch',
      },
  ) => void,
) {}
