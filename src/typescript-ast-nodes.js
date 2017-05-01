module.exports = function(fork) {
  fork.use(require("ast-types/def/es7"));

  var types = fork.use(require("ast-types/lib/types"));
  var def = types.Type.def;
  var or = types.Type.or;
  var defaults = fork.use(require("ast-types/lib/shared")).defaults;

  // Ambient
  def("TSAmbientVariableDefinition").bases("VariableDeclaration");

  def("TSInterfaceDeclaration")
    .bases("Declaration")
    .build("name", "typeParameters", "members")
    .field("name", def("Identifier"))
    .field(
      "typeParameters",
      or(def("TypeParameterDeclaration"), null),
      defaults["null"]
    )
    .field("members", [def("TSSignature")]);
  // .field("body", def("ObjectTypeAnnotation"))
  // .field("extends", [def("InterfaceExtends")]);

  def("TSKeyword").bases("Node");

  def("TSType").bases("Node");

  def("TypeElement").bases("Node");

  def("TSSignature")
    .bases("TypeElement")
    .build("typeParameters", "parameters", "typeAnnotation")
    .field(
      "typeParameters",
      or(def("TypeParameterDeclaration"), null),
      defaults["null"]
    )
    .field("parameters", [def("Identifier")])
    .field("typeAnnotation", def("TSType"));

  def("TSAnyKeyword").bases("TSKeyword");

  def("TSBooleanKeyword").bases("TSKeyword");

  def("TSNeverKeyword").bases("TSKeyword");

  def("TSNumberKeyword").bases("TSKeyword");

  def("TSObjectKeyword").bases("TSKeyword");

  def("TSReadonlyKeyword").bases("TSKeyword");

  def("TSStringKeyword").bases("TSKeyword");

  def("TSSymbolKeyword").bases("TSKeyword");

  def("TSUndefinedKeyword").bases("TSKeyword");

  def("TSVoidKeyword").bases("TSKeyword");

  // Types
  def("TSConstructorType").bases("TSType");

  def("TSFunctionType").bases("TSType");

  def("TSIntersectionType")
    .bases("TSType")
    .build("types")
    .field("types", [def("TSType")]);

  def("TSParenthesizedType").bases("TSType");

  def("TSThisType").bases("TSType");

  def("TSUnionType")
    .bases("TSType")
    .build("types")
    .field("types", [def("TSType")]);

  def("TSTypeLiteral")
    .bases("TSType")
    .build("members")
    .field("members", [def("TSSignature")]);

  def("TSTypeOperator").bases("TSType");

  def("TSTypeReference")
    .bases("TSType")
    .build("typeName", "typeParameters")
    .field("typeName", def("Identifier"))
    .field("typeParameters", def("TSType"));

  def("TSFirstTypeNode")
    .bases("Node")
    .build("id", "typeAnnotation")
    .field("id", def("Identifier"))
    .field("typeAnnotation", def("TSType"));

  // Signatures
  def("TSCallSignature")
    .bases("TSSignature")
    .build("typeParameters", "parameters", "typeAnnotation");

  def("TSConstructSignature")
    .bases("TSSignature")
    .build("typeParameters", "parameters", "typeAnnotation");

  def("TSIndexSignature")
    .bases("TSSignature")
    .build("typeParameters", "parameters", "typeAnnotation");

  def("TSMethodSignature")
    .bases("TSSignature")
    .build("name", "typeParameters", "parameters", "typeAnnotation")
    .field("name", def("Identifier"));

  def("TSPropertySignature")
    .bases("TSSignature")
    .build("name", "typeAnnotation", "initializer")
    .field("name", def("Identifier"))
    .field("typeAnnotation", def("TSType"))
    .field("initializer", def("Expression"));

  def("TSAsExpression").bases("Expression");

  def("TSNamespaceExportDeclaration")
    .bases("Declaration")
    // needs more like `modefiers` and `decorators`
    .build("name");

  def("TSEnumDeclaration")
    .bases("Declaration")
    .build("name", "members")
    .field("name", def("Identifier"));

  def("TSEnumMember").build("name").field("name", def("Identifier"));

  def("TSImportEqualsDeclaration")
    .build("name", "moduleReference")
    .field("name", def("Identifier"))
    .field("moduleReference", def("TSExternalModuleReference"));

  def("TSImportEqualsDeclaration")
    .build("expression")
    .field("expression", def("Literal"));

  def("TSInterfaceDeclaration")
    .build("name", "members")
    .field("name", def("Identifier"))
    .field("members", [def("TSMethodSignature")]);

  def("TSModuleDeclaration")
    .build("modifiers", "name", "body")
    .bases("Node")
    .field("name", or(def("Identifier"), def("Literal")));

  def("TSDeclareKeyword").build();

  def("TSModuleBlock").build("body");

  def("TSAbstractMethodDefinition").build().bases("Node");

  def("TSAbstractClassProperty").build("key", "value").bases("Node");

  def("TSAbstractClassDeclaration").build().bases("Node");
};
