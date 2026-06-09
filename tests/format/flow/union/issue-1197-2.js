// https://github.com/prettier/prettier/issues/1197#issuecomment-496620145

type RecordDataType = {|
  type: 'Record',
  /** Fields */
  fields: {[string]: DataType},
  /**
   * Meta
   */
  meta?: /**
     * Custom layouts allow you to provide your own layout.
     * Example for conditionally showing the interface of one setting based on the value of another.
     */
      | {|
        layout: 'Custom',
      |}
    /**
     * The None layout, embeds Record children directly with no wrapping layout.
     */
    | {|layout: 'None'|},
|};
