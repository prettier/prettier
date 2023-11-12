const Properties = {
  prop            : { type: "bool", value: false },

  anotherProp     : { type: "bool", value: false }, //comment
  thirdProp       : { type: "float", value: 0, min: 1, max: 2 },
  subProperties: {
    [fourthProp] : { type: "float", value: 0, min: 1, max: 2 },
    fifthProp: {
      type          : "enum",
      value         : 0,
      enumDefinition: {
        ONE  : 0, //comment
        TWO  : 1,
        THREE: 2,
      },
    },
    sixthProp  : { type: "int", value: 1, min: 0, max: 2 },
    seventhProp: { type: "string", value: "string" },
    eighthProp : { type: "path", value: "" },
  },
  aLongPropKeyName: {},
  func() {},
  get getter() {
    return 0;
  },
  get emptyGetter() {},
  ninthProp       : { type: "bool", value: false },
  tenthProp       : { type: "bool", value: false },

  eleventhProp    : { type: "bool", value: false },
  twelfthProp     : { type: "bool", value: false },
};
