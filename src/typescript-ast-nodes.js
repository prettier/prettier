"use strict";

module.exports = function(fork) {
  fork.use(require("ast-types/def/es7"));

  const types = fork.use(require("ast-types/lib/types"));
  const def = types.Type.def;
  const or = types.Type.or;
  const defaults = fork.use(require("ast-types/lib/shared")).defaults;

  // Putting it here while it's being merged upstream
  // https://github.com/benjamn/ast-types/pull/221
  def("ObjectTypeSpreadProperty")
    .bases("Node")
    .build("argument")
    .field("argument", def("Type"));

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

  def("TSKeyword").bases("Node");

  def("TSType").bases("Node");

  def("TSTupleType")
    .build("elementTypes")
    .field("elementTypes", [def("TSType")])
    .bases("Node");

  def("TSArrayType")
    .build("elementType")
    .field("elementType", def("TSType"))
    .bases("Node");

  def("TSQualifiedName")
    .build("left", "right")
    .field("left", def("TSType"))
    .field("right", def("TSType"))
    .bases("Node");

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

  def("TSFunctionType")
    .bases("TSSignature")
    .build("parameters", "typeAnnotation", "typeParameters");

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
    .build("modifiers", "name", "questionToken", "typeAnnotation")
    .field("name", def("Identifier"))
    .field("typeAnnotation", def("TypeAnnotation"))
    .bases("TSSignature");

  def("TSAsExpression")
    .build("expression")
    .field("expression", def("Node"))
    .bases("Expression");

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
    .build("expression")
    .field("name", def("Identifier"))
    .field("moduleReference", def("TSExternalModuleReference"))
    .field("expression", def("Literal"))
    .bases("Declaration");

  def("TSNamespaceFunctionDeclaration")
    .build("id", "body")
    .field("id", def("Identifier"))
    .field("body", def("BlockStatement"))
    .bases("Declaration");

  def("TSInterfaceDeclaration")
    .build("body", "heritage", "id")
    .field("body", def("TSInterfaceBody"))
    .field("heritage", def("TSHeritageClause"))
    .field("id", def("Identifier"))
    .bases("Node");

  def("TSInterfaceBody")
    .build("body")
    .field("body", [def("TSPropertySignature")])
    .bases("Node");

  def("TSModuleDeclaration")
    .build("modifiers", "name", "body")
    .bases("Declaration")
    .field("name", or(def("Identifier"), def("Literal")));

  def("TSDeclareKeyword").build();

  def("TSModuleBlock").build("body").bases("Node");

  def("TSAbstractMethodDefinition").build().bases("Node");

  def("TSAbstractClassProperty").build("key", "value").bases("Node");

  def("TSAbstractClassDeclaration").build().bases("ClassDeclaration");

  def("TSInterfaceHeritage")
    .build("id", "typeParameters")
    .field("id", def("Identifier"))
    .field("typeParameters", def("TSType"));

  def("TSDecorator")
    .build("expression")
    .field("expression", def("Identifier"))
    .bases("Node");

  def("TSTypeParameter").build("name").field("name", def("Identifier"));

  def("TSParameterProperty").build("accessibility", "isReadonly", "parameters");

  def("TSTypeAssertionExpression")
    .build("expression", "typeAnnotation")
    .field("expression", def("Identifier"))
    .field("typeAnnotation", def("TSType"))
    .bases("Expression");
};
