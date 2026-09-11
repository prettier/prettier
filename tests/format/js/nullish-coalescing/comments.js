errorDetails =
      errorJSON === '{}'
        ? // regular JS error case: print stacktrace
          (error.stack ?? 'N/A')
        : // MDX error: print extra attributes + stacktrace
          `${errorJSON}\n${error.stack}`;

_ = {
  children: keepChildren
        ? instance.children
        : // $FlowFixMe[incompatible-type] We're not typing immutable instances.
          (children ?? [])
}

_ = (
        <DataTableStoreContext.Provider value={storeContextValue}>
            <DataTableConfigContext.Provider value={configContextValue}>
                <OptionalResourceContextProvider value={resource}>
                    {isPending ? (
                        loading
                    ) : data == null || data.length === 0 || total === 0 ? (
                        /**
                         * Once loaded, the data for the list may be empty.
                         * Instead of displaying the table header
                         * with zero data rows, the DataTable
                         * displays the empty component.
                         */
                        empty ?? null
                    ) : (
                        /**
                         * After the initial load, if the data for the list
                         * isn't empty, and even if the data is refreshing
                         * (e.g. after a filter change), the DataTable
                         * displays the current data.
                         */
                        <DataTableSortContext.Provider value={sort}>
                            <DataTableCallbacksContext.Provider
                                value={callbacksContextValue}
                            >
                                <DataTableSelectedIdsContext.Provider
                                    value={selectedIds}
                                >
                                    <DataTableDataContext.Provider value={data}>
                                        {children}
                                    </DataTableDataContext.Provider>
                                </DataTableSelectedIdsContext.Provider>
                            </DataTableCallbacksContext.Provider>
                        </DataTableSortContext.Provider>
                    )}
                </OptionalResourceContextProvider>
            </DataTableConfigContext.Provider>
        </DataTableStoreContext.Provider>
    );
