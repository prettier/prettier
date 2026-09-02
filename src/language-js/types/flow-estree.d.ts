// ! Do NOT edit !
// Generated from 'node_modules/flow-estree/dist/types.js.flow'
// Run `node scripts/generate-flow-estree-type-definition.js` to update
// spell-checker: disable

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @generated
 */

/*
 * !!! GENERATED FILE !!!
 *
 * DESIGN NOTE — please read before editing.
 *
 * This file is a VERBATIM MIRROR of upstream
 *   xplat/static_h/tools/hermes-parser/js/hermes-estree/src/types.js
 * with our header swapped in. It is **not** schema-derived generation —
 * the body is byte-for-byte from upstream after the upstream header is
 * stripped. The `@generated` tag means "do not hand-edit" — to update,
 * edit upstream's types.js (or upstream the change first) and re-run the
 * regeneration command below.
 *
 * The codegen step ALSO performs a SCHEMA cross-check: every concrete
 * NodeDef in `node_kinds.rs` must have a matching `export interface` or
 * `export type` in upstream's types.js (or appear in
 * `KNOWN_TYPES_WITHOUT_INTERFACE` in codegen.rs with attribution). On any
 * drift, codegen FAILS the build with a non-zero exit and lists the
 * missing kinds. There is no synthesis or soft-warning path — upstream
 * already contains all Flow-only nodes today, so the cross-check exists
 * solely to prevent future drift between the Rust SCHEMA and upstream.
 *
 * Schema-derivable per-node interfaces are NOT independently generated
 * because upstream's interfaces carry hand-curated child unions (e.g.
 * `Expression`, `Statement`, `BindingName`, `MemberExpression` refinement
 * splits, `MethodDefinition` discriminator splits, per-property
 * nullability) that the Rust schema does not encode and should not encode
 * — the Rust schema is the source of truth for *binary serialization*
 * between the Rust parser and the JS deserializer; the upstream Flow
 * types are the source of truth for *consumer typings*. See
 * `generate_estree_types` in `flow_parser_wasm/src/bin/codegen.rs` for
 * the implementation.
 *
 * To regenerate (run from the fbsource root):
 *
 *   buck run fbcode//flow/rust_port/crates/flow_parser_wasm:codegen -- \
 *     --estree-types > \
 *     fbcode/flow/packages/flow-estree/src/types.js
 *
 * To regenerate against a different upstream copy, set
 * `HERMES_ESTREE_TYPES_JS` to an absolute path before invoking codegen.
 */

/**
 *
 * IMPORTANT NOTE
 *
 * This file intentionally uses interfaces and `readonly` fields.
 *
 * - `$ReadOnly` is an "evaluated" utility type in flow; meaning that flow does
 *    not actually calculate the resulting type until it is used. This creates
 *    a copy of the type at each usage site - ballooning memory and processing
 *    times.
 *    Usually this isn't a problem as a type might only be used one or two times
 *    - but in this giant circular-referencing graph that is the AST types, this
 *    causes check times for consumers to be awful.
 *
 *    Thus instead we manually annotate properties with `readonly` to avoid the `$ReadOnly` type.
 *
 * - `...Type` spreads do not preserve the readonly-ness of the properties. If
 *   we used object literal types then we would have to `$ReadOnly` all spreads
 *   (see point 1). On the other hand extending an interface does preserve
 *   readonlyness of properties.
 *
 *   Thus instead of object literals, we use interfaces.
 *
 *** Please ensure all properties are marked as readonly! ***
 */

export type Range = [number, number];

export interface ObjectWithLoc {
  readonly loc: SourceLocation;
}
export interface BaseToken extends ObjectWithLoc {
  readonly loc: SourceLocation;
  readonly range: Range;
}
export interface BaseNode extends BaseToken {
  // this is added by ESLint and is not part of the ESTree spec
  readonly parent: ESNode;
}

/*
 * Token and Comment are pseudo-nodes to represent pieces of source code
 *
 * NOTE:
 * They are not included in the `ESNode` union below on purpose because they
 * are not ever included as part of the standard AST tree.
 */

export interface MostTokens extends BaseToken {
  readonly type:
    | "Boolean"
    | "Identifier"
    | "JSXIdentifier"
    | "JSXText"
    | "Keyword"
    | "Null"
    | "Numeric"
    | "BigInt"
    | "Punctuator"
    | "RegularExpression"
    | "String"
    | "Template"
    // comment types
    | "Block"
    | "Line";
  readonly value: string;
}
export interface RegexToken extends BaseToken {
  readonly type: "RegularExpression";
  readonly value: string;
  readonly regex: {
    readonly pattern: string;
    readonly flags: string;
  };
}
export interface LineComment extends BaseToken {
  readonly type: "Line";
  readonly value: string;
}
export interface BlockComment extends BaseToken {
  readonly type: "Block";
  readonly value: string;
}
export type Comment = LineComment | BlockComment;
export type Token = MostTokens | RegexToken | Comment;

export interface SourceLocation {
  readonly start: Position;
  readonly end: Position;
}

export interface Position {
  /** >= 1 */
  readonly line: number;
  /** >= 0 */
  readonly column: number;
}

// note: this is only ever present on Program.interpreter, never in the body
export interface InterpreterDirective extends BaseNode {
  type: "InterpreterDirective";
  value: string;
}

export type DocblockDirectives = Readonly<{
  // some well-known tags
  flow?: ReadonlyArray<string> | void;
  format?: ReadonlyArray<string> | void;
  noflow?: ReadonlyArray<string> | void;
  noformat?: ReadonlyArray<string> | void;
  [key: string]: ReadonlyArray<string> | void;
}>;

export type DocblockMetadata = Readonly<{
  directives: DocblockDirectives;
  comment: BlockComment;
}>;

export interface Program extends BaseNode {
  readonly type: "Program";
  readonly sourceType: "script" | "module";
  readonly body: ReadonlyArray<Statement | ModuleDeclaration>;
  readonly tokens: ReadonlyArray<Token>;
  readonly comments: ReadonlyArray<Comment>;
  readonly loc: SourceLocation;
  readonly interpreter: null | InterpreterDirective;
  readonly docblock: null | DocblockMetadata;
  // program is the only node without a parent - but typing it as such is _super_ annoying and difficult
  readonly parent: ESNode;
}

// Flow declares a "Node" type as part of its HTML typedefs.
// Because this file declares global types - we can't clash with it
export type ESNode =
  | Identifier
  | PrivateIdentifier
  | Literal
  | Program
  | AFunction
  | SwitchCase
  | CatchClause
  | VariableDeclarator
  | Statement
  | Expression
  | Property
  | Super
  | TemplateElement
  | SpreadElement
  | BindingName
  | RestElement
  | AssignmentPattern
  | MemberExpression
  | ClassBody
  | AClass
  | MethodDefinition
  | PropertyDefinition
  | ModuleDeclaration
  | ModuleSpecifier
  | ImportAttribute
  // flow nodes
  | TypeAnnotation
  | TypeAnnotationType
  | Variance
  | FunctionTypeParam
  | ComponentTypeParameter
  | InferredPredicate
  | ObjectTypeProperty
  | ObjectTypeCallProperty
  | ObjectTypeIndexer
  | ObjectTypeSpreadProperty
  | ObjectTypeMappedTypeProperty
  | InterfaceExtends
  | ClassImplements
  | Decorator
  | TypeParameterDeclaration
  | TypeParameter
  | TypeParameterInstantiation
  | ComponentDeclaration
  | ComponentParameter
  | HookDeclaration
  | EnumDeclaration
  | EnumNumberBody
  | EnumBigIntBody
  | EnumStringBody
  | EnumStringMember
  | EnumDefaultedMember
  | EnumNumberMember
  | EnumBigIntMember
  | EnumBooleanBody
  | EnumBooleanMember
  | EnumSymbolBody
  | DeclaredNode
  | ObjectTypeInternalSlot
  // Match
  | MatchPattern
  | MatchRestPattern
  | MatchObjectPatternProperty
  | MatchInstanceObjectPattern
  | MatchExpressionCase
  | MatchStatementCase
  // Records
  | RecordDeclaration
  | RecordDeclarationImplements
  | RecordDeclarationBody
  | RecordDeclarationProperty
  | RecordDeclarationStaticProperty
  | RecordExpression
  | RecordExpressionProperties
  // JSX
  | JSXNode;

export type BindingName = Identifier | BindingPattern;
export type BindingPattern = ArrayPattern | ObjectPattern;
export type RestElementPattern = AssignmentPattern | BindingName | RestElement;
export type FunctionParameter = AssignmentPattern | BindingName | RestElement;
export type DestructuringPattern =
  BindingName | AssignmentPattern | MemberExpression | RestElement;

interface BaseFunction extends BaseNode {
  readonly params: ReadonlyArray<FunctionParameter>;
  readonly async: boolean;

  readonly predicate: null | InferredPredicate;
  readonly returnType: null | TypeAnnotation;
  readonly typeParameters: null | TypeParameterDeclaration;
}

export type AFunction =
  FunctionDeclaration | FunctionExpression | ArrowFunctionExpression;

export type Statement =
  | BlockStatement
  | BreakStatement
  | ClassDeclaration
  | ComponentDeclaration
  | ContinueStatement
  | DebuggerStatement
  | DeclareClass
  | DeclareComponent
  | DeclareHook
  | DeclareVariable
  | DeclareEnum
  | DeclareFunction
  | DeclareInterface
  | DeclareModule
  | DeclareNamespace
  | DeclareOpaqueType
  | DeclareTypeAlias
  | DoWhileStatement
  | EmptyStatement
  | EnumDeclaration
  | ExpressionStatement
  | ForInStatement
  | ForOfStatement
  | ForStatement
  | FunctionDeclaration
  | HookDeclaration
  | IfStatement
  | InterfaceDeclaration
  | LabeledStatement
  | OpaqueType
  | ReturnStatement
  | StaticBlock
  | SwitchStatement
  | ThrowStatement
  | TryStatement
  | TypeAlias
  | VariableDeclaration
  | WhileStatement
  | WithStatement
  | MatchStatement
  | RecordDeclaration;

// nodes that can be the direct parent of a statement
export type StatementParentSingle =
  | IfStatement
  | LabeledStatement
  | WithStatement
  | WhileStatement
  | DoWhileStatement
  | ForStatement
  | ForInStatement
  | ForOfStatement;
// nodes that can be the parent of a statement that store the statements in an array
export type StatementParentArray =
  SwitchCase | Program | BlockStatement | StaticBlock;
export type StatementParent = StatementParentSingle | StatementParentArray;

export interface EmptyStatement extends BaseNode {
  readonly type: "EmptyStatement";
}

export interface BlockStatement extends BaseNode {
  readonly type: "BlockStatement";
  readonly body: ReadonlyArray<Statement>;
}

export interface StaticBlock extends BaseNode {
  readonly type: "StaticBlock";
  readonly body: ReadonlyArray<Statement>;
}

export interface ExpressionStatement extends BaseNode {
  readonly type: "ExpressionStatement";
  readonly expression: Expression;
  readonly directive: string | null;
}

export interface IfStatement extends BaseNode {
  readonly type: "IfStatement";
  readonly test: Expression;
  readonly consequent: Statement;
  readonly alternate?: Statement | null;
}

export interface LabeledStatement extends BaseNode {
  readonly type: "LabeledStatement";
  readonly label: Identifier;
  readonly body: Statement;
}

export interface BreakStatement extends BaseNode {
  readonly type: "BreakStatement";
  readonly label?: Identifier | null;
}

export interface ContinueStatement extends BaseNode {
  readonly type: "ContinueStatement";
  readonly label?: Identifier | null;
}

export interface WithStatement extends BaseNode {
  readonly type: "WithStatement";
  readonly object: Expression;
  readonly body: Statement;
}

export interface SwitchStatement extends BaseNode {
  readonly type: "SwitchStatement";
  readonly discriminant: Expression;
  readonly cases: ReadonlyArray<SwitchCase>;
}

export interface ReturnStatement extends BaseNode {
  readonly type: "ReturnStatement";
  readonly argument?: Expression | null;
}

export interface ThrowStatement extends BaseNode {
  readonly type: "ThrowStatement";
  readonly argument: Expression;
}

export interface TryStatement extends BaseNode {
  readonly type: "TryStatement";
  readonly block: BlockStatement;
  readonly handler?: CatchClause | null;
  readonly finalizer?: BlockStatement | null;
}

export interface WhileStatement extends BaseNode {
  readonly type: "WhileStatement";
  readonly test: Expression;
  readonly body: Statement;
}

export interface DoWhileStatement extends BaseNode {
  readonly type: "DoWhileStatement";
  readonly body: Statement;
  readonly test: Expression;
}

export interface ForStatement extends BaseNode {
  readonly type: "ForStatement";
  readonly init?: VariableDeclaration | Expression | null;
  readonly test?: Expression | null;
  readonly update?: Expression | null;
  readonly body: Statement;
}

interface BaseForXStatement extends BaseNode {
  readonly left: VariableDeclaration | BindingName | MemberExpression;
  readonly right: Expression;
  readonly body: Statement;
}

export interface ForInStatement extends BaseForXStatement {
  readonly type: "ForInStatement";
}

export interface ForOfStatement extends BaseForXStatement {
  readonly type: "ForOfStatement";
  readonly await: boolean;
}

export interface DebuggerStatement extends BaseNode {
  readonly type: "DebuggerStatement";
}

type ComponentParameterAndRestElement = ComponentParameter | RestElement;

export interface ComponentParameter extends BaseNode {
  readonly type: "ComponentParameter";
  readonly name: Identifier | StringLiteral;
  readonly local: BindingName | AssignmentPattern;
  readonly shorthand: boolean;
}

export interface ComponentDeclaration extends BaseNode {
  readonly type: "ComponentDeclaration";
  readonly async: boolean;
  readonly body: BlockStatement;
  readonly id: Identifier;
  readonly params: ReadonlyArray<ComponentParameterAndRestElement>;
  readonly rendersType: null | RendersType;
  readonly typeParameters: null | TypeParameterDeclaration;
}

export interface HookDeclaration extends BaseNode {
  readonly type: "HookDeclaration";
  readonly async: boolean;
  readonly id: Identifier;
  readonly body: BlockStatement;
  readonly params: ReadonlyArray<FunctionParameter>;
  readonly returnType: null | TypeAnnotation;
  readonly typeParameters: null | TypeParameterDeclaration;
}

export interface FunctionDeclaration extends BaseFunction {
  readonly type: "FunctionDeclaration";
  /** It is null when a function declaration is a part of the `export default function` statement */
  readonly id: Identifier | null;
  readonly body: BlockStatement;
  readonly generator: boolean;
}

export interface VariableDeclaration extends BaseNode {
  readonly type: "VariableDeclaration";
  readonly declarations: ReadonlyArray<VariableDeclarator>;
  readonly kind: "var" | "let" | "const";
}

export interface VariableDeclarator extends BaseNode {
  readonly type: "VariableDeclarator";
  readonly id: BindingName;
  readonly init?: Expression | null;

  readonly parent: VariableDeclaration;
}

export type Expression =
  | ThisExpression
  | ArrayExpression
  | ObjectExpression
  | FunctionExpression
  | ArrowFunctionExpression
  | YieldExpression
  | Literal
  | UnaryExpression
  | UpdateExpression
  | BinaryExpression
  | AssignmentExpression
  | LogicalExpression
  | MemberExpression
  | ConditionalExpression
  | CallExpression
  | NewExpression
  | SequenceExpression
  | TemplateLiteral
  | TaggedTemplateExpression
  | ClassExpression
  | MetaProperty
  | Identifier
  | AwaitExpression
  | ImportExpression
  | ChainExpression
  | TypeCastExpression
  | AsExpression
  | AsConstExpression
  | MatchExpression
  | RecordExpression
  | JSXFragment
  | JSXElement;

export interface ThisExpression extends BaseNode {
  readonly type: "ThisExpression";
}

export interface ArrayExpression extends BaseNode {
  readonly type: "ArrayExpression";
  readonly elements: ReadonlyArray<Expression | SpreadElement>;
  // this is not part of the ESTree spec, but hermes emits it
  readonly trailingComma: boolean;
}

export interface ObjectExpression extends BaseNode {
  readonly type: "ObjectExpression";
  readonly properties: ReadonlyArray<ObjectProperty | SpreadElement>;
}

// This is the complete type of a "Property"
// This same node (unfortunately) covers both object literal properties
// and object desturcturing properties.
export type Property = ObjectProperty | DestructuringObjectProperty;

export type ObjectPropertyKey =
  Identifier | StringLiteral | NumericLiteral | BigIntLiteral;

export type ObjectProperty =
  | ObjectPropertyWithNonShorthandStaticName
  | ObjectPropertyWithShorthandStaticName
  | ObjectPropertyWithComputedName;
interface ObjectPropertyBase extends BaseNode {
  readonly parent:
    ObjectExpression | ObjectPattern | RecordExpressionProperties;
}
export interface ObjectPropertyWithNonShorthandStaticName extends ObjectPropertyBase {
  readonly type: "Property";
  readonly computed: false;
  // non-computed, non-shorthand names are constrained significantly
  readonly key: ObjectPropertyKey;
  readonly value: Expression;
  readonly kind: "init" | "get" | "set";
  readonly method: boolean;
  readonly shorthand: false;
}
export interface ObjectPropertyWithShorthandStaticName extends ObjectPropertyBase {
  readonly type: "Property";
  readonly computed: false;
  // shorthand keys *must* be identifiers
  readonly key: Identifier;
  // shorthand values *must* be identifiers (that look the same as the key)
  readonly value: Identifier;
  readonly kind: "init";
  readonly method: false;
  readonly shorthand: true;
}
export interface ObjectPropertyWithComputedName extends ObjectPropertyBase {
  readonly type: "Property";
  readonly computed: true;
  // computed names can be any expression
  readonly key: Expression;
  readonly value: Expression;
  readonly kind: "init" | "get" | "set";
  readonly method: boolean;
  // cannot have a shorthand computed name
  readonly shorthand: false;
}

export type DestructuringObjectProperty =
  | DestructuringObjectPropertyWithNonShorthandStaticName
  | DestructuringObjectPropertyWithShorthandStaticName
  | DestructuringObjectPropertyWithComputedName;
interface DestructuringObjectPropertyBase extends BaseNode {
  // destructuring properties cannot be methods
  readonly kind: "init";
  readonly method: false;

  readonly parent: ObjectExpression | ObjectPattern;
}
export interface DestructuringObjectPropertyWithNonShorthandStaticName extends DestructuringObjectPropertyBase {
  readonly type: "Property";
  readonly computed: false;
  // non-computed, non-shorthand names are constrained significantly
  readonly key: ObjectPropertyKey;
  // destructuring properties cannot have any value
  readonly value: DestructuringPattern;
  readonly shorthand: false;
}
export interface DestructuringObjectPropertyWithShorthandStaticName extends DestructuringObjectPropertyBase {
  readonly type: "Property";
  readonly computed: false;
  // shorthand keys *must* be identifiers
  readonly key: Identifier;
  // shorthand values *must* be identifiers or assignments (that look the same as the key)
  readonly value: Identifier | AssignmentPattern;
  readonly shorthand: true;
}
export interface DestructuringObjectPropertyWithComputedName extends DestructuringObjectPropertyBase {
  readonly type: "Property";
  readonly computed: true;
  // computed names can be any expression
  readonly key: Expression;
  // destructuring properties cannot have any value
  readonly value: DestructuringPattern;
  // cannot have a shorthand computed name
  readonly shorthand: false;
}

export interface FunctionExpression extends BaseFunction {
  readonly id?: Identifier | null;
  readonly type: "FunctionExpression";
  readonly body: BlockStatement;
  readonly generator: boolean;
}

export interface SequenceExpression extends BaseNode {
  readonly type: "SequenceExpression";
  readonly expressions: ReadonlyArray<Expression>;
}

export interface UnaryExpression extends BaseNode {
  readonly type: "UnaryExpression";
  readonly operator: UnaryOperator;
  readonly prefix: true;
  readonly argument: Expression;
}

export interface BinaryExpressionWithoutIn extends BaseNode {
  readonly type: "BinaryExpression";
  readonly operator: BinaryOperatorWithoutIn;
  readonly left: Expression;
  readonly right: Expression;
}

// Private brand checks (#foo in bar) are a special case
// other binary expressions do not allow PrivateIdentifier in the left
export interface BinaryExpressionIn extends BaseNode {
  readonly type: "BinaryExpression";
  readonly operator: "in";
  readonly left: Expression | PrivateIdentifier;
  readonly right: Expression;
}

export type BinaryExpression = BinaryExpressionWithoutIn | BinaryExpressionIn;

export interface AssignmentExpression extends BaseNode {
  readonly type: "AssignmentExpression";
  readonly operator: AssignmentOperator;
  readonly left: BindingName | MemberExpression;
  readonly right: Expression;
}

export interface UpdateExpression extends BaseNode {
  readonly type: "UpdateExpression";
  readonly operator: UpdateOperator;
  readonly argument: Expression;
  readonly prefix: boolean;
}

export interface LogicalExpression extends BaseNode {
  readonly type: "LogicalExpression";
  readonly operator: LogicalOperator;
  readonly left: Expression;
  readonly right: Expression;
}

export interface ConditionalExpression extends BaseNode {
  readonly type: "ConditionalExpression";
  readonly test: Expression;
  readonly alternate: Expression;
  readonly consequent: Expression;
}

interface BaseCallExpression extends BaseNode {
  readonly callee: Expression | Super;
  readonly arguments: ReadonlyArray<Expression | SpreadElement>;
  readonly typeArguments: null | TypeParameterInstantiation;
}
export interface CallExpression extends BaseCallExpression {
  readonly type: "CallExpression";
  readonly optional: boolean;
}

export interface NewExpression extends BaseCallExpression {
  readonly type: "NewExpression";
}

export type MemberExpression =
  MemberExpressionWithComputedName | MemberExpressionWithNonComputedName;
export interface MemberExpressionWithComputedName extends BaseNode {
  readonly type: "MemberExpression";
  readonly object: Expression | Super;
  readonly property: Expression;
  readonly computed: true;
  readonly optional: boolean;
}
export interface MemberExpressionWithNonComputedName extends BaseNode {
  readonly type: "MemberExpression";
  readonly object: Expression | Super;
  readonly property: Identifier | PrivateIdentifier;
  readonly computed: false;
  readonly optional: boolean;
}

export type ChainElement = CallExpression | MemberExpression;

export interface ChainExpression extends BaseNode {
  readonly type: "ChainExpression";
  readonly expression: ChainElement;
}

export interface SwitchCase extends BaseNode {
  readonly type: "SwitchCase";
  readonly test?: Expression | null;
  readonly consequent: ReadonlyArray<Statement>;
}

export interface CatchClause extends BaseNode {
  readonly type: "CatchClause";
  readonly param: BindingName | null;
  readonly body: BlockStatement;
}

export interface Identifier extends BaseNode {
  readonly type: "Identifier";
  readonly name: string;

  readonly typeAnnotation: TypeAnnotation | null;
  // only applies to function arguments
  readonly optional: boolean;
}

export interface PrivateIdentifier extends BaseNode {
  readonly type: "PrivateIdentifier";
  readonly name: string;
}

export type Literal =
  | BigIntLiteral
  | BooleanLiteral
  | NullLiteral
  | NumericLiteral
  | RegExpLiteral
  | StringLiteral;

export interface BigIntLiteral extends BaseNode {
  readonly type: "Literal";
  readonly value: bigint;
  readonly bigint: string;
  readonly raw: string;
  readonly literalType: "bigint";
}

export interface BooleanLiteral extends BaseNode {
  readonly type: "Literal";
  readonly value: boolean;
  readonly raw: "true" | "false";
  readonly literalType: "boolean";
}

export interface NullLiteral extends BaseNode {
  readonly type: "Literal";
  readonly value: null;
  readonly raw: "null";
  readonly literalType: "null";
}

export interface NumericLiteral extends BaseNode {
  readonly type: "Literal";
  readonly value: number;
  readonly raw: string;
  readonly literalType: "numeric";
}

export interface RegExpLiteral extends BaseNode {
  readonly type: "Literal";
  readonly value: RegExp | null;
  readonly regex: {
    readonly pattern: string;
    readonly flags: string;
  };
  readonly raw: string;
  readonly literalType: "regexp";
}

export interface StringLiteral extends BaseNode {
  readonly type: "Literal";
  readonly value: string;
  readonly raw: string;
  readonly literalType: "string";
}

export type UnaryOperator =
  "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";

export type BinaryOperatorWithoutIn =
  | "=="
  | "!="
  | "==="
  | "!=="
  | "<"
  | "<="
  | ">"
  | ">="
  | "<<"
  | ">>"
  | ">>>"
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "**"
  | "|"
  | "^"
  | "&"
  | "instanceof";

export type BinaryOperator = BinaryOperatorWithoutIn | "in";

export type LogicalOperator = "||" | "&&" | "??";

export type AssignmentOperator =
  | "="
  | "+="
  | "-="
  | "*="
  | "/="
  | "%="
  | "**="
  | "<<="
  | ">>="
  | ">>>="
  | "|="
  | "^="
  | "&="
  // not yet supported, but future proofing
  | "||="
  | "&&="
  | "??=";

export type UpdateOperator = "++" | "--";

export interface Super extends BaseNode {
  readonly type: "Super";
}

export interface SpreadElement extends BaseNode {
  readonly type: "SpreadElement";
  readonly argument: Expression;
}

export interface ArrowFunctionExpression extends BaseFunction {
  readonly type: "ArrowFunctionExpression";
  readonly expression: boolean;
  readonly body: BlockStatement | Expression;
  // hermes emits this - but it's always null
  readonly id: null;
  // note - arrow functions cannot be generators
}

export interface YieldExpression extends BaseNode {
  readonly type: "YieldExpression";
  readonly argument?: Expression | null;
  readonly delegate: boolean;
}

export interface TemplateLiteral extends BaseNode {
  readonly type: "TemplateLiteral";
  readonly quasis: ReadonlyArray<TemplateElement>;
  readonly expressions: ReadonlyArray<Expression>;
}

export interface TaggedTemplateExpression extends BaseNode {
  readonly type: "TaggedTemplateExpression";
  readonly tag: Expression;
  readonly quasi: TemplateLiteral;
}

export interface TemplateElement extends BaseNode {
  readonly type: "TemplateElement";
  readonly tail: boolean;
  readonly value: {
    readonly cooked: string;
    readonly raw: string;
  };
}

export interface ObjectPattern extends BaseNode {
  readonly type: "ObjectPattern";
  readonly properties: ReadonlyArray<DestructuringObjectProperty | RestElement>;
  // if used as a VariableDeclarator.id
  readonly typeAnnotation: TypeAnnotation | null;
}

export interface ArrayPattern extends BaseNode {
  readonly type: "ArrayPattern";
  // an element will be null if the pattern contains a hole: `[a,,b]`
  readonly elements: ReadonlyArray<DestructuringPattern | null>;
  readonly typeAnnotation: TypeAnnotation | null;
}

export interface RestElement extends BaseNode {
  readonly type: "RestElement";
  readonly argument: RestElementPattern;
  // the Pattern owns the typeAnnotation
}

export interface AssignmentPattern extends BaseNode {
  readonly type: "AssignmentPattern";
  readonly left: BindingName;
  readonly right: Expression;
}

export type AClass = ClassDeclaration | ClassExpression;
interface BaseClass extends BaseNode {
  readonly superClass?: Expression | null;
  readonly body: ClassBody;

  readonly typeParameters: null | TypeParameterDeclaration;
  readonly superTypeArguments: null | TypeParameterInstantiation;
  readonly implements: ReadonlyArray<ClassImplements>;
  readonly decorators: ReadonlyArray<Decorator>;
}

export type PropertyName =
  ClassPropertyNameComputed | ClassPropertyNameNonComputed;
export type ClassPropertyNameComputed = Expression;
export type ClassPropertyNameNonComputed =
  PrivateIdentifier | ObjectPropertyKey;

export type ClassMember = PropertyDefinition | MethodDefinition | StaticBlock;
export type ClassMemberWithNonComputedName =
  | PropertyDefinitionWithNonComputedName
  | MethodDefinitionConstructor
  | MethodDefinitionWithNonComputedName;
export interface ClassBody extends BaseNode {
  readonly type: "ClassBody";
  readonly body: ReadonlyArray<ClassMember>;

  readonly parent: AClass;
}

export type MethodDefinition =
  | MethodDefinitionConstructor
  | MethodDefinitionWithComputedName
  | MethodDefinitionWithNonComputedName;
interface MethodDefinitionBase extends BaseNode {
  readonly value: FunctionExpression;

  readonly parent: ClassBody;
}
export interface MethodDefinitionConstructor extends MethodDefinitionBase {
  readonly type: "MethodDefinition";
  readonly key: Identifier | StringLiteral;
  readonly kind: "constructor";
  readonly computed: false;
  readonly static: false;
  readonly decorators: ReadonlyArray<Decorator>;
}
export interface MethodDefinitionWithComputedName extends MethodDefinitionBase {
  readonly type: "MethodDefinition";
  readonly key: ClassPropertyNameComputed;
  readonly kind: "method" | "get" | "set";
  readonly computed: true;
  readonly static: boolean;
  readonly decorators: ReadonlyArray<Decorator>;
}
export interface MethodDefinitionWithNonComputedName extends MethodDefinitionBase {
  readonly type: "MethodDefinition";
  readonly key: ClassPropertyNameNonComputed;
  readonly kind: "method" | "get" | "set";
  readonly computed: false;
  readonly static: boolean;
  readonly decorators: ReadonlyArray<Decorator>;
}

// `PropertyDefinition` is the new standard for all class properties
export type PropertyDefinition =
  PropertyDefinitionWithComputedName | PropertyDefinitionWithNonComputedName;
interface PropertyDefinitionBase extends BaseNode {
  readonly value: null | Expression;
  readonly typeAnnotation: null | TypeAnnotation;
  readonly static: boolean;
  readonly decorators: ReadonlyArray<Decorator>;
  readonly variance: null | Variance;
  readonly declare: boolean;
  // hermes always emit this as false
  readonly optional: false;

  readonly parent: ClassBody;
}
export interface PropertyDefinitionWithComputedName extends PropertyDefinitionBase {
  readonly type: "PropertyDefinition";
  readonly key: ClassPropertyNameComputed;
  readonly computed: true;
}
export interface PropertyDefinitionWithNonComputedName extends PropertyDefinitionBase {
  readonly type: "PropertyDefinition";
  readonly key: ClassPropertyNameNonComputed;
  readonly computed: false;
}

export interface ClassDeclaration extends BaseClass {
  readonly type: "ClassDeclaration";
  /** It is null when a class declaration is a part of the `export default class` statement */
  readonly id: Identifier | null;
}

export interface ClassExpression extends BaseClass {
  readonly type: "ClassExpression";
  readonly id?: Identifier | null;
}

export interface MetaProperty extends BaseNode {
  readonly type: "MetaProperty";
  readonly meta: Identifier;
  readonly property: Identifier;
}

export type ModuleDeclaration =
  | ImportDeclaration
  | ExportNamedDeclaration
  | ExportDefaultDeclaration
  | ExportAllDeclaration
  | DeclareExportDeclaration
  | DeclareExportAllDeclaration
  | DeclareModuleExports;

export type ModuleSpecifier =
  | ImportSpecifier
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
  | ExportSpecifier;

export interface ImportDeclaration extends BaseNode {
  readonly type: "ImportDeclaration";
  readonly specifiers: ReadonlyArray<
    ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
  >;
  readonly source: StringLiteral;
  readonly attributes: ReadonlyArray<ImportAttribute>;

  readonly importKind: "value" | "type" | "typeof";
}
export interface ImportAttribute extends BaseNode {
  readonly type: "ImportAttribute";
  readonly key: Identifier;
  readonly value: StringLiteral;

  readonly parent: ImportDeclaration;
}

export interface ImportSpecifier extends BaseNode {
  readonly type: "ImportSpecifier";
  readonly imported: Identifier;
  readonly local: Identifier;
  readonly importKind: null | "type" | "typeof";

  readonly parent: ImportDeclaration;
}

export interface ImportExpression extends BaseNode {
  readonly type: "ImportExpression";
  readonly source: Expression;
  readonly options: Expression | null;
}

export interface ImportDefaultSpecifier extends BaseNode {
  readonly type: "ImportDefaultSpecifier";
  readonly local: Identifier;

  readonly parent: ImportDeclaration;
}

export interface ImportNamespaceSpecifier extends BaseNode {
  readonly type: "ImportNamespaceSpecifier";
  readonly local: Identifier;

  readonly parent: ImportDeclaration;
}

export type DefaultDeclaration =
  | FunctionDeclaration
  | ClassDeclaration
  | ComponentDeclaration
  | HookDeclaration;
export type NamedDeclaration =
  | DefaultDeclaration
  | VariableDeclaration
  | TypeAlias
  | OpaqueType
  | InterfaceDeclaration
  | EnumDeclaration
  | RecordDeclaration;

interface ExportNamedDeclarationBase extends BaseNode {
  readonly type: "ExportNamedDeclaration";
  readonly declaration?: NamedDeclaration | null;
  readonly specifiers: ReadonlyArray<ExportSpecifier>;
  readonly source?: StringLiteral | null;
  readonly exportKind: "value" | "type";
}
export interface ExportNamedDeclarationWithSpecifiers extends ExportNamedDeclarationBase {
  readonly type: "ExportNamedDeclaration";
  readonly declaration: null;
  readonly source?: StringLiteral | null;
  readonly specifiers: ReadonlyArray<ExportSpecifier>;
}
export interface ExportNamedDeclarationWithDeclaration extends ExportNamedDeclarationBase {
  readonly type: "ExportNamedDeclaration";
  readonly declaration: NamedDeclaration;
  readonly source: null;
  readonly specifiers: [];
}
export type ExportNamedDeclaration =
  ExportNamedDeclarationWithSpecifiers | ExportNamedDeclarationWithDeclaration;

export interface ExportSpecifier extends BaseNode {
  readonly type: "ExportSpecifier";
  readonly exported: Identifier;
  readonly local: Identifier;
}

export interface ExportDefaultDeclaration extends BaseNode {
  readonly type: "ExportDefaultDeclaration";
  readonly declaration: DefaultDeclaration | Expression;
}

export interface ExportAllDeclaration extends BaseNode {
  readonly type: "ExportAllDeclaration";
  readonly source: StringLiteral;
  readonly exportKind: "value" | "type";
  readonly exported?: Identifier | null;
}

export interface AwaitExpression extends BaseNode {
  readonly type: "AwaitExpression";
  readonly argument: Expression;
}

/***********************
 * Flow specific nodes *
 ***********************/

export type TypeAnnotationType =
  | NumberTypeAnnotation
  | StringTypeAnnotation
  | BigIntTypeAnnotation
  | BooleanTypeAnnotation
  | NullLiteralTypeAnnotation
  | AnyTypeAnnotation
  | EmptyTypeAnnotation
  | SymbolTypeAnnotation
  | ThisTypeAnnotation
  | MixedTypeAnnotation
  | VoidTypeAnnotation
  | UnknownTypeAnnotation
  | NeverTypeAnnotation
  | UndefinedTypeAnnotation
  | StringLiteralTypeAnnotation
  | NumberLiteralTypeAnnotation
  | BigIntLiteralTypeAnnotation
  | BooleanLiteralTypeAnnotation
  | ArrayTypeAnnotation
  | NullableTypeAnnotation
  | ExistsTypeAnnotation
  | GenericTypeAnnotation
  | QualifiedTypeIdentifier
  | QualifiedTypeofIdentifier
  | TypeofTypeAnnotation
  | KeyofTypeAnnotation
  | TupleTypeAnnotation
  | TupleTypeSpreadElement
  | TupleTypeLabeledElement
  | InferTypeAnnotation
  | InterfaceTypeAnnotation
  | UnionTypeAnnotation
  | IntersectionTypeAnnotation
  | ConditionalTypeAnnotation
  | TypeOperator
  | TypePredicate
  | FunctionTypeAnnotation
  | HookTypeAnnotation
  | ComponentTypeAnnotation
  | ObjectTypeAnnotation
  | IndexedAccessType
  | OptionalIndexedAccessType;

export interface Variance extends BaseNode {
  readonly type: "Variance";
  readonly kind: "plus" | "minus" | "readonly" | "writeonly" | "in" | "out";
}

interface BaseTypeAlias extends BaseNode {
  readonly id: Identifier;
  readonly typeParameters: null | TypeParameterDeclaration;
  readonly right: TypeAnnotationType;
}

export interface TypeAnnotation extends BaseNode {
  readonly type: "TypeAnnotation";
  readonly typeAnnotation: TypeAnnotationType;
}

export interface TypeAlias extends BaseTypeAlias {
  readonly type: "TypeAlias";
}

interface BaseOpaqueType extends BaseNode {
  readonly id: Identifier;
  readonly supertype: TypeAnnotationType | null;
  readonly lowerBound: TypeAnnotationType | null;
  readonly upperBound: TypeAnnotationType | null;
  readonly typeParameters: TypeParameterDeclaration | null;
}
export interface OpaqueType extends BaseOpaqueType {
  readonly type: "OpaqueType";
  readonly impltype: TypeAnnotationType;
}

export interface NumberTypeAnnotation extends BaseNode {
  readonly type: "NumberTypeAnnotation";
}
export interface StringTypeAnnotation extends BaseNode {
  readonly type: "StringTypeAnnotation";
}
export interface BigIntTypeAnnotation extends BaseNode {
  readonly type: "BigIntTypeAnnotation";
}
export interface BooleanTypeAnnotation extends BaseNode {
  readonly type: "BooleanTypeAnnotation";
}
export interface NullLiteralTypeAnnotation extends BaseNode {
  readonly type: "NullLiteralTypeAnnotation";
}
export interface AnyTypeAnnotation extends BaseNode {
  readonly type: "AnyTypeAnnotation";
}
export interface EmptyTypeAnnotation extends BaseNode {
  readonly type: "EmptyTypeAnnotation";
}
export interface SymbolTypeAnnotation extends BaseNode {
  readonly type: "SymbolTypeAnnotation";
}
export interface ThisTypeAnnotation extends BaseNode {
  readonly type: "ThisTypeAnnotation";
}
export interface MixedTypeAnnotation extends BaseNode {
  readonly type: "MixedTypeAnnotation";
}
export interface VoidTypeAnnotation extends BaseNode {
  readonly type: "VoidTypeAnnotation";
}
export interface UnknownTypeAnnotation extends BaseNode {
  readonly type: "UnknownTypeAnnotation";
}
export interface NeverTypeAnnotation extends BaseNode {
  readonly type: "NeverTypeAnnotation";
}
export interface UndefinedTypeAnnotation extends BaseNode {
  readonly type: "UndefinedTypeAnnotation";
}
export interface StringLiteralTypeAnnotation extends BaseNode {
  readonly type: "StringLiteralTypeAnnotation";
  readonly value: string;
  readonly raw: string;
}
export interface NumberLiteralTypeAnnotation extends BaseNode {
  readonly type: "NumberLiteralTypeAnnotation";
  readonly value: number;
  readonly raw: string;
}
export interface BigIntLiteralTypeAnnotation extends BaseNode {
  readonly type: "BigIntLiteralTypeAnnotation";
  readonly bigint: string;
  readonly value: bigint;
  readonly raw: string;
}
export interface BooleanLiteralTypeAnnotation extends BaseNode {
  readonly type: "BooleanLiteralTypeAnnotation";
  readonly value: boolean;
  readonly raw: "true" | "false";
}
export interface ArrayTypeAnnotation extends BaseNode {
  readonly type: "ArrayTypeAnnotation";
  readonly elementType: TypeAnnotationType;
}
export interface NullableTypeAnnotation extends BaseNode {
  readonly type: "NullableTypeAnnotation";
  readonly typeAnnotation: TypeAnnotationType;
}
export interface ExistsTypeAnnotation extends BaseNode {
  readonly type: "ExistsTypeAnnotation";
}
export interface GenericTypeAnnotation extends BaseNode {
  readonly type: "GenericTypeAnnotation";
  readonly id: Identifier | QualifiedTypeIdentifier;
  readonly typeParameters: null | TypeParameterInstantiation;
}
export interface QualifiedTypeIdentifier extends BaseNode {
  readonly type: "QualifiedTypeIdentifier";
  readonly id: Identifier;
  readonly qualification: QualifiedTypeIdentifier | Identifier;
}
export interface QualifiedTypeofIdentifier extends BaseNode {
  readonly type: "QualifiedTypeofIdentifier";
  readonly id: Identifier;
  readonly qualification: QualifiedTypeofIdentifier | Identifier;
}
export interface TypeofTypeAnnotation extends BaseNode {
  readonly type: "TypeofTypeAnnotation";
  readonly argument: QualifiedTypeofIdentifier | Identifier;
  readonly typeArguments?: TypeParameterInstantiation;
}
export interface KeyofTypeAnnotation extends BaseNode {
  readonly type: "KeyofTypeAnnotation";
  readonly argument: TypeAnnotationType;
}
export interface TupleTypeAnnotation extends BaseNode {
  readonly type: "TupleTypeAnnotation";
  readonly elementTypes: ReadonlyArray<TypeAnnotationType>;
  readonly inexact: boolean;
}
export interface TupleTypeSpreadElement extends BaseNode {
  readonly type: "TupleTypeSpreadElement";
  readonly label?: Identifier | null;
  readonly typeAnnotation: TypeAnnotationType;
}
export interface TupleTypeLabeledElement extends BaseNode {
  readonly type: "TupleTypeLabeledElement";
  readonly label: Identifier;
  readonly elementType: TypeAnnotationType;
  readonly optional: boolean;
  readonly variance: Variance | null;
}

export interface InferTypeAnnotation extends BaseNode {
  readonly type: "InferTypeAnnotation";
  readonly typeParameter: TypeParameter;
}

// type T = { [[foo]]: number };
export interface ObjectTypeInternalSlot extends BaseNode {
  readonly type: "ObjectTypeInternalSlot";
  readonly id: Identifier;
  readonly optional: boolean;
  readonly static: boolean;
  readonly method: boolean;
  readonly value: TypeAnnotation;

  readonly parent: ObjectTypeAnnotation;
}

export interface InterfaceTypeAnnotation extends BaseInterfaceNode {
  readonly type: "InterfaceTypeAnnotation";
}

export interface UnionTypeAnnotation extends BaseNode {
  readonly type: "UnionTypeAnnotation";
  readonly types: ReadonlyArray<TypeAnnotationType>;
}
export interface IntersectionTypeAnnotation extends BaseNode {
  readonly type: "IntersectionTypeAnnotation";
  readonly types: ReadonlyArray<TypeAnnotationType>;
}

export interface ConditionalTypeAnnotation extends BaseNode {
  readonly type: "ConditionalTypeAnnotation";
  readonly checkType: TypeAnnotationType;
  readonly extendsType: TypeAnnotationType;
  readonly trueType: TypeAnnotationType;
  readonly falseType: TypeAnnotationType;
}

export type TypeOperator =
  RendersTypeOperator | RendersStarTypeOperator | RendersQuestionTypeOperator;

export type RendersType =
  RendersTypeOperator | RendersStarTypeOperator | RendersQuestionTypeOperator;

interface TypeOperatorBase extends BaseNode {
  readonly type: "TypeOperator";
  readonly typeAnnotation: TypeAnnotationType;
}
export interface RendersTypeOperator extends TypeOperatorBase {
  readonly type: "TypeOperator";
  readonly operator: "renders";
}
export interface RendersStarTypeOperator extends TypeOperatorBase {
  readonly type: "TypeOperator";
  readonly operator: "renders*";
}
export interface RendersQuestionTypeOperator extends TypeOperatorBase {
  readonly type: "TypeOperator";
  readonly operator: "renders?";
}

export interface TypePredicate extends BaseNode {
  readonly type: "TypePredicate";
  readonly parameterName: Identifier;
  readonly typeAnnotation: TypeAnnotationType | null;
  readonly kind: null | "asserts" | "implies";
}

export interface FunctionTypeAnnotation extends BaseNode {
  readonly type: "FunctionTypeAnnotation";
  readonly params: ReadonlyArray<FunctionTypeParam>;
  readonly returnType: TypeAnnotationType;
  readonly rest: null | FunctionTypeParam;
  readonly typeParameters: null | TypeParameterDeclaration;
  readonly this: FunctionTypeParam | null;
}
export interface FunctionTypeParam extends BaseNode {
  readonly type: "FunctionTypeParam";
  readonly name: Identifier | null;
  readonly typeAnnotation: TypeAnnotationType;
  readonly optional: boolean;

  readonly parent: FunctionTypeAnnotation;
}
export interface HookTypeAnnotation extends BaseNode {
  readonly type: "HookTypeAnnotation";
  readonly params: ReadonlyArray<FunctionTypeParam>;
  readonly returnType: TypeAnnotationType;
  readonly rest: null | FunctionTypeParam;
  readonly typeParameters: null | TypeParameterDeclaration;
}

export interface ComponentTypeAnnotation extends BaseNode {
  readonly type: "ComponentTypeAnnotation";
  readonly params: ReadonlyArray<ComponentTypeParameter>;
  readonly rest: null | ComponentTypeParameter;
  readonly typeParameters: null | TypeParameterDeclaration;
  readonly rendersType: null | RendersType;
}
export interface ComponentTypeParameter extends BaseNode {
  readonly type: "ComponentTypeParameter";
  readonly name: Identifier | StringLiteral | null;
  readonly typeAnnotation: TypeAnnotationType;
  readonly optional: boolean;

  readonly parent: ComponentTypeAnnotation | DeclareComponent;
}

export interface InferredPredicate extends BaseNode {
  readonly type: "InferredPredicate";

  readonly parent: AFunction | DeclareFunction;
}

export interface ObjectTypeAnnotation extends BaseNode {
  readonly type: "ObjectTypeAnnotation";
  readonly inexact: boolean;
  readonly exact: boolean;
  readonly properties: ReadonlyArray<
    ObjectTypeProperty | ObjectTypeSpreadProperty | ObjectTypeMappedTypeProperty
  >;
  readonly indexers: ReadonlyArray<ObjectTypeIndexer>;
  readonly callProperties: ReadonlyArray<ObjectTypeCallProperty>;
  readonly internalSlots: ReadonlyArray<ObjectTypeInternalSlot>;
}
interface ObjectTypePropertyBase extends BaseNode {
  readonly type: "ObjectTypeProperty";
  readonly key: ObjectPropertyKey;
  readonly value: TypeAnnotationType;
  readonly method: boolean;
  readonly optional: boolean;
  readonly static: boolean; // only applies to the "declare class" case
  readonly proto: boolean; // only applies to the "declare class" case
  readonly variance: Variance | null;
  readonly kind: "init" | "get" | "set";

  readonly parent: ObjectTypeAnnotation;
}
export interface ObjectTypeMethodSignature extends ObjectTypePropertyBase {
  readonly type: "ObjectTypeProperty";
  readonly value: FunctionTypeAnnotation;
  readonly method: true;
  readonly optional: false;
  readonly variance: null;
  readonly kind: "init";

  readonly parent: ObjectTypeAnnotation;
}
export interface ObjectTypePropertySignature extends ObjectTypePropertyBase {
  readonly type: "ObjectTypeProperty";
  readonly value: TypeAnnotationType;
  readonly method: false;
  readonly optional: boolean;
  readonly variance: Variance | null;
  readonly kind: "init";

  readonly parent: ObjectTypeAnnotation;
}
export interface ObjectTypeAccessorSignature extends ObjectTypePropertyBase {
  readonly type: "ObjectTypeProperty";
  readonly value: FunctionTypeAnnotation;
  readonly method: false;
  readonly optional: false;
  readonly variance: null;
  readonly kind: "get" | "set";

  readonly parent: ObjectTypeAnnotation;
}
export type ObjectTypeProperty =
  | ObjectTypeMethodSignature
  | ObjectTypePropertySignature
  | ObjectTypeAccessorSignature;

export interface ObjectTypeCallProperty extends BaseNode {
  readonly type: "ObjectTypeCallProperty";
  readonly value: FunctionTypeAnnotation;
  readonly static: boolean; // can only be static when defined on a declare class

  readonly parent: ObjectTypeAnnotation;
}
export interface ObjectTypeIndexer extends BaseNode {
  readonly type: "ObjectTypeIndexer";
  readonly id: null | Identifier;
  readonly key: TypeAnnotationType;
  readonly value: TypeAnnotationType;
  readonly static: boolean; // can only be static when defined on a declare class
  readonly variance: null | Variance;

  readonly parent: ObjectTypeAnnotation;
}
export interface ObjectTypeMappedTypeProperty extends BaseNode {
  readonly type: "ObjectTypeMappedTypeProperty";
  readonly keyTparam: TypeParameter;
  readonly propType: TypeAnnotationType;
  readonly sourceType: TypeAnnotationType;
  readonly variance: null | Variance;
  readonly optional: null | "PlusOptional" | "MinusOptional" | "Optional";

  readonly parent: ObjectTypeAnnotation;
}

export interface ObjectTypeSpreadProperty extends BaseNode {
  readonly type: "ObjectTypeSpreadProperty";
  readonly argument: TypeAnnotationType;

  readonly parent: ObjectTypeAnnotation;
}

export interface IndexedAccessType extends BaseNode {
  readonly type: "IndexedAccessType";
  readonly objectType: TypeAnnotationType;
  readonly indexType: TypeAnnotationType;
}
export interface OptionalIndexedAccessType extends BaseNode {
  readonly type: "OptionalIndexedAccessType";
  readonly objectType: TypeAnnotationType;
  readonly indexType: TypeAnnotationType;
  readonly optional: boolean;
}

export interface TypeCastExpression extends BaseNode {
  readonly type: "TypeCastExpression";
  readonly expression: Expression;
  readonly typeAnnotation: TypeAnnotation;
}
export interface AsExpression extends BaseNode {
  readonly type: "AsExpression";
  readonly expression: Expression;
  readonly typeAnnotation: TypeAnnotationType;
}
export interface AsConstExpression extends BaseNode {
  readonly type: "AsConstExpression";
  readonly expression: Expression;
}

interface BaseInterfaceNode extends BaseNode {
  readonly body: ObjectTypeAnnotation;
  readonly extends: ReadonlyArray<InterfaceExtends>;
}
interface BaseInterfaceDeclaration extends BaseInterfaceNode {
  readonly id: Identifier;
  readonly typeParameters: null | TypeParameterDeclaration;
}

export interface InterfaceDeclaration extends BaseInterfaceDeclaration {
  readonly type: "InterfaceDeclaration";
}

export interface InterfaceExtends extends BaseNode {
  readonly type: "InterfaceExtends";
  readonly id: Identifier | QualifiedTypeIdentifier;
  readonly typeParameters: null | TypeParameterInstantiation;

  readonly parent: InterfaceDeclaration | DeclareInterface;
}

export interface ClassImplements extends BaseNode {
  readonly type: "ClassImplements";
  readonly id: Identifier;
  readonly typeParameters: null | TypeParameterInstantiation;

  readonly parent: AClass | DeclareClass;
}

export interface Decorator extends BaseNode {
  readonly type: "Decorator";
  readonly expression: Expression;

  readonly parent: AClass;
}

export interface TypeParameterDeclaration extends BaseNode {
  readonly type: "TypeParameterDeclaration";
  readonly params: ReadonlyArray<TypeParameter>;
}
export interface TypeParameter extends BaseNode {
  readonly type: "TypeParameter";
  readonly name: string;
  readonly const: boolean;
  readonly bound: null | TypeAnnotation;
  readonly variance: null | Variance;
  readonly default: null | TypeAnnotationType;
  readonly usesExtendsBound: boolean;
  readonly parent: TypeParameterDeclaration;
}
export interface TypeParameterInstantiation extends BaseNode {
  readonly type: "TypeParameterInstantiation";
  readonly params: ReadonlyArray<TypeAnnotationType>;

  readonly parent: GenericTypeAnnotation | CallExpression | NewExpression;
}

export interface EnumDeclaration extends BaseNode {
  readonly type: "EnumDeclaration";
  readonly id: Identifier;
  readonly body:
    | EnumNumberBody
    | EnumBigIntBody
    | EnumStringBody
    | EnumBooleanBody
    | EnumSymbolBody;
}

interface BaseEnumBody extends BaseNode {
  readonly hasUnknownMembers: boolean;
}
interface BaseInferrableEnumBody extends BaseEnumBody {
  readonly explicitType: boolean;
}

export interface EnumNumberBody extends BaseInferrableEnumBody {
  readonly type: "EnumNumberBody";
  // enum number members cannot be defaulted
  readonly members: ReadonlyArray<EnumNumberMember>;
  readonly explicitType: boolean;

  readonly parent: EnumDeclaration;
}

export interface EnumNumberMember extends BaseNode {
  readonly type: "EnumNumberMember";
  readonly id: Identifier;
  readonly init: NumericLiteral;

  readonly parent: EnumNumberBody;
}

export interface EnumBigIntBody extends BaseInferrableEnumBody {
  readonly type: "EnumBigIntBody";
  // enum bigint members cannot be defaulted
  readonly members: ReadonlyArray<EnumBigIntMember>;
  readonly explicitType: boolean;

  readonly parent: EnumDeclaration;
}

export interface EnumBigIntMember extends BaseNode {
  readonly type: "EnumBigIntMember";
  readonly id: Identifier;
  readonly init: BigIntLiteral;

  readonly parent: EnumBigIntBody;
}

export interface EnumStringBody extends BaseInferrableEnumBody {
  readonly type: "EnumStringBody";
  readonly members: ReadonlyArray<EnumStringMember | EnumDefaultedMember>;

  readonly parent: EnumDeclaration;
}

export interface EnumStringMember extends BaseNode {
  readonly type: "EnumStringMember";
  readonly id: Identifier;
  readonly init: StringLiteral;

  readonly parent: EnumStringBody;
}

export interface EnumBooleanBody extends BaseInferrableEnumBody {
  readonly type: "EnumBooleanBody";
  // enum boolean members cannot be defaulted
  readonly members: ReadonlyArray<EnumBooleanMember>;

  readonly parent: EnumDeclaration;
}

export interface EnumBooleanMember extends BaseNode {
  readonly type: "EnumBooleanMember";
  readonly id: Identifier;
  readonly init: BooleanLiteral;

  readonly parent: EnumBooleanBody;
}

export interface EnumSymbolBody extends BaseEnumBody {
  readonly type: "EnumSymbolBody";
  // enum symbol members can only be defaulted
  readonly members: ReadonlyArray<EnumDefaultedMember>;

  readonly parent: EnumDeclaration;
}

export interface EnumDefaultedMember extends BaseNode {
  readonly type: "EnumDefaultedMember";
  readonly id: Identifier;

  readonly parent: EnumStringBody | EnumSymbolBody;
}

/*****************
 * Declare nodes *
 *****************/

export type DeclaredNode =
  | DeclareClass
  | DeclareComponent
  | DeclareHook
  | DeclareVariable
  | DeclareEnum
  | DeclareFunction
  | DeclareModule
  | DeclareInterface
  | DeclareTypeAlias
  | DeclareOpaqueType
  | DeclareExportAllDeclaration
  | DeclareExportDeclaration
  | DeclareModuleExports
  | DeclaredPredicate;

export interface DeclareClass extends BaseNode {
  readonly type: "DeclareClass";
  readonly id: Identifier;
  readonly typeParameters: null | TypeParameterDeclaration;
  readonly extends: ReadonlyArray<InterfaceExtends>;
  readonly implements: ReadonlyArray<ClassImplements>;
  readonly body: ObjectTypeAnnotation;
  readonly mixins: ReadonlyArray<InterfaceExtends>;
}

export interface DeclareComponent extends BaseNode {
  readonly type: "DeclareComponent";
  readonly id: Identifier;
  // The Flow parser emits the same param shape it uses for
  // `ComponentDeclaration` — `ComponentParameter`/`RestElement` in `params`,
  // with `rest` always null. Detached nodes built by `flow-transform` may
  // instead use the `ComponentTypeParameter` + `rest` shape, which is what
  // `ComponentTypeAnnotation` uses and what the printer emits.
  readonly params: ReadonlyArray<
    ComponentParameterAndRestElement | ComponentTypeParameter
  >;
  readonly rest: null | ComponentTypeParameter;
  readonly typeParameters: null | TypeParameterDeclaration;
  readonly rendersType: null | RendersType;
  readonly implicitDeclare: boolean;
}

export interface DeclareHook extends BaseNode {
  readonly type: "DeclareHook";
  // the hook signature is stored as a type annotation on the ID
  readonly id: Identifier & {
    readonly typeAnnotation: TypeAnnotation & {
      readonly typeAnnotation: HookTypeAnnotation;
    };
  };
  readonly implicitDeclare: boolean;
}

export interface DeclareVariable extends BaseNode {
  readonly type: "DeclareVariable";
  readonly declarations: ReadonlyArray<VariableDeclarator>;
  readonly kind: "var" | "let" | "const";
  readonly implicitDeclare: boolean;
}

export interface DeclareEnum extends BaseNode {
  readonly type: "DeclareEnum";
  readonly id: Identifier;
  readonly body:
    EnumNumberBody | EnumStringBody | EnumBooleanBody | EnumSymbolBody;
}

export interface DeclareFunction extends BaseNode {
  readonly type: "DeclareFunction";
  // the function signature is stored as a type annotation on the ID
  readonly id: Identifier & {
    readonly typeAnnotation: TypeAnnotation & {
      readonly typeAnnotation: FunctionTypeAnnotation;
    };
  };
  readonly implicitDeclare: boolean;
  readonly predicate: InferredPredicate | DeclaredPredicate | null;
}

export interface DeclareModule extends BaseNode {
  readonly type: "DeclareModule";
  readonly id: StringLiteral | Identifier;
  readonly body: BlockStatement;
}

export interface DeclareNamespace extends BaseNode {
  readonly type: "DeclareNamespace";
  readonly global: boolean;
  readonly id: Identifier;
  readonly body: BlockStatement;
  readonly implicitDeclare: boolean;
  readonly keyword: "namespace" | "module";
}

export interface DeclareInterface extends BaseInterfaceDeclaration {
  readonly type: "DeclareInterface";
}

export interface DeclareTypeAlias extends BaseTypeAlias {
  readonly type: "DeclareTypeAlias";
}

export interface DeclareOpaqueType extends BaseOpaqueType {
  readonly type: "DeclareOpaqueType";
  readonly impltype: null;
}

export interface DeclareExportAllDeclaration extends BaseNode {
  readonly type: "DeclareExportAllDeclaration";
  readonly source: StringLiteral;
}

interface DeclareExportDeclarationBase extends BaseNode {
  readonly type: "DeclareExportDeclaration";
  readonly specifiers: ReadonlyArray<ExportSpecifier>;
  readonly source: StringLiteral | null;
  readonly default: boolean;
}
export interface DeclareExportDefaultDeclaration extends DeclareExportDeclarationBase {
  readonly type: "DeclareExportDeclaration";
  readonly declaration:
    | DeclareClass
    | DeclareFunction
    | DeclareComponent
    | DeclareHook
    | TypeAnnotationType;
  readonly default: true;
  // default cannot have a source
  readonly source: null;
  // default cannot have specifiers
  readonly specifiers: [];
}
export interface DeclareExportDeclarationNamedWithDeclaration extends DeclareExportDeclarationBase {
  readonly type: "DeclareExportDeclaration";
  readonly declaration:
    | DeclareClass
    | DeclareFunction
    | DeclareComponent
    | DeclareHook
    | DeclareInterface
    | DeclareOpaqueType
    | DeclareVariable
    | DeclareEnum;
  readonly default: false;
  readonly source: null;
  // default cannot have specifiers and a declaration
  readonly specifiers: [];
}
export interface DeclareExportDeclarationNamedWithSpecifiers extends DeclareExportDeclarationBase {
  readonly type: "DeclareExportDeclaration";
  // with a source you can't have a declaration
  readonly declaration: null;
  readonly default: false;
  readonly source: StringLiteral;
  readonly specifiers: ReadonlyArray<ExportSpecifier>;
}
export type DeclareExportDeclaration =
  | DeclareExportDefaultDeclaration
  | DeclareExportDeclarationNamedWithDeclaration
  | DeclareExportDeclarationNamedWithSpecifiers;

export interface DeclareModuleExports extends BaseNode {
  readonly type: "DeclareModuleExports";
  readonly typeAnnotation: TypeAnnotation;
}

export interface DeclaredPredicate extends BaseNode {
  readonly type: "DeclaredPredicate";
  readonly value: Expression;
}

/**********************
 * JSX specific nodes *
 **********************/

export type JSXChild =
  JSXElement | JSXExpression | JSXFragment | JSXText | JSXSpreadChild;
export type JSXExpression = JSXEmptyExpression | JSXExpressionContainer;
export type JSXTagNameExpression =
  JSXIdentifier | JSXMemberExpression | JSXNamespacedName;

export type JSXNode =
  | JSXAttribute
  | JSXClosingElement
  | JSXClosingFragment
  | JSXElement
  | JSXEmptyExpression
  | JSXExpressionContainer
  | JSXFragment
  | JSXIdentifier
  | JSXMemberExpression
  | JSXNamespacedName
  | JSXOpeningElement
  | JSXOpeningFragment
  | JSXSpreadAttribute
  | JSXText
  | JSXSpreadChild;

export interface JSXAttribute extends BaseNode {
  readonly type: "JSXAttribute";
  readonly name: JSXIdentifier;
  readonly value: Literal | JSXExpression | null;

  readonly parent: JSXOpeningElement;
}

export interface JSXClosingElement extends BaseNode {
  readonly type: "JSXClosingElement";
  readonly name: JSXTagNameExpression;

  readonly parent: JSXElement;
}

export interface JSXClosingFragment extends BaseNode {
  readonly type: "JSXClosingFragment";

  readonly parent: JSXFragment;
}

export interface JSXElement extends BaseNode {
  readonly type: "JSXElement";
  readonly openingElement: JSXOpeningElement;
  readonly closingElement: JSXClosingElement | null;
  readonly children: ReadonlyArray<JSXChild>;
}

export interface JSXEmptyExpression extends BaseNode {
  readonly type: "JSXEmptyExpression";
}

export interface JSXExpressionContainer extends BaseNode {
  readonly type: "JSXExpressionContainer";
  readonly expression: Expression | JSXEmptyExpression;
}

export interface JSXFragment extends BaseNode {
  readonly type: "JSXFragment";
  readonly openingFragment: JSXOpeningFragment;
  readonly closingFragment: JSXClosingFragment;
  readonly children: ReadonlyArray<JSXChild>;
}

export interface JSXIdentifier extends BaseNode {
  readonly type: "JSXIdentifier";
  readonly name: string;
}

export interface JSXMemberExpression extends BaseNode {
  readonly type: "JSXMemberExpression";
  readonly object: JSXTagNameExpression;
  readonly property: JSXIdentifier;
}

export interface JSXNamespacedName extends BaseNode {
  readonly type: "JSXNamespacedName";
  readonly namespace: JSXIdentifier;
  readonly name: JSXIdentifier;
}

export interface JSXOpeningElement extends BaseNode {
  readonly type: "JSXOpeningElement";
  readonly selfClosing: boolean;
  readonly name: JSXTagNameExpression;
  readonly attributes: ReadonlyArray<JSXAttribute | JSXSpreadAttribute>;
  readonly typeArguments?: TypeParameterInstantiation | null;

  readonly parent: JSXElement;
}

export interface JSXOpeningFragment extends BaseNode {
  readonly type: "JSXOpeningFragment";

  readonly parent: JSXFragment;
}

export interface JSXSpreadAttribute extends BaseNode {
  readonly type: "JSXSpreadAttribute";
  readonly argument: Expression;

  readonly parent: JSXOpeningElement;
}

export interface JSXText extends BaseNode {
  readonly type: "JSXText";
  readonly value: string;
  readonly raw: string;
}

export interface JSXSpreadChild extends BaseNode {
  readonly type: "JSXSpreadChild";
  readonly expression: Expression;
}

/************************************
 * Match expressions and statements *
 ************************************/

export interface MatchExpression extends BaseNode {
  readonly type: "MatchExpression";
  readonly argument: Expression;
  readonly cases: ReadonlyArray<MatchExpressionCase>;
}
export interface MatchExpressionCase extends BaseNode {
  readonly type: "MatchExpressionCase";
  readonly pattern: MatchPattern;
  readonly body: Expression;
  readonly guard: Expression | null;
}

export interface MatchStatement extends BaseNode {
  readonly type: "MatchStatement";
  readonly argument: Expression;
  readonly cases: ReadonlyArray<MatchStatementCase>;
}
export interface MatchStatementCase extends BaseNode {
  readonly type: "MatchStatementCase";
  readonly pattern: MatchPattern;
  readonly body: BlockStatement;
  readonly guard: Expression | null;
}

/******************
 * Match patterns *
 ******************/

export type MatchPattern =
  | MatchOrPattern
  | MatchAsPattern
  | MatchWildcardPattern
  | MatchLiteralPattern
  | MatchUnaryPattern
  | MatchIdentifierPattern
  | MatchMemberPattern
  | MatchBindingPattern
  | MatchObjectPattern
  | MatchInstancePattern
  | MatchArrayPattern;

export interface MatchOrPattern extends BaseNode {
  readonly type: "MatchOrPattern";
  readonly patterns: ReadonlyArray<MatchPattern>;
}
export interface MatchAsPattern extends BaseNode {
  readonly type: "MatchAsPattern";
  readonly pattern: MatchPattern;
  readonly target: Identifier | MatchBindingPattern;
}
export interface MatchWildcardPattern extends BaseNode {
  readonly type: "MatchWildcardPattern";
}
export interface MatchLiteralPattern extends BaseNode {
  readonly type: "MatchLiteralPattern";
  readonly literal: Literal;
}
export interface MatchUnaryPattern extends BaseNode {
  readonly type: "MatchUnaryPattern";
  readonly argument: Literal;
  readonly operator: "-" | "+";
}
export interface MatchIdentifierPattern extends BaseNode {
  readonly type: "MatchIdentifierPattern";
  readonly id: Identifier;
}
export interface MatchMemberPattern extends BaseNode {
  readonly type: "MatchMemberPattern";
  readonly base: MatchIdentifierPattern | MatchMemberPattern;
  readonly property:
    Identifier | StringLiteral | NumericLiteral | BigIntLiteral;
}
export interface MatchBindingPattern extends BaseNode {
  readonly type: "MatchBindingPattern";
  readonly id: Identifier;
  readonly kind: "let" | "const" | "var";
}
export interface MatchObjectPattern extends BaseNode {
  readonly type: "MatchObjectPattern";
  readonly properties: ReadonlyArray<MatchObjectPatternProperty>;
  readonly rest: MatchRestPattern | null;
}
export interface MatchObjectPatternProperty extends BaseNode {
  readonly type: "MatchObjectPatternProperty";
  readonly key: ObjectPropertyKey;
  readonly pattern: MatchPattern;
  readonly shorthand: boolean;
}
export interface MatchInstancePattern extends BaseNode {
  readonly type: "MatchInstancePattern";
  readonly targetConstructor: MatchIdentifierPattern | MatchMemberPattern;
  readonly properties: MatchInstanceObjectPattern;
}
export interface MatchInstanceObjectPattern extends BaseNode {
  readonly type: "MatchInstanceObjectPattern";
  readonly properties: ReadonlyArray<MatchObjectPatternProperty>;
  readonly rest: MatchRestPattern | null;
}
export interface MatchArrayPattern extends BaseNode {
  readonly type: "MatchArrayPattern";
  readonly elements: ReadonlyArray<MatchPattern>;
  readonly rest: MatchRestPattern | null;
}
export interface MatchRestPattern extends BaseNode {
  readonly type: "MatchRestPattern";
  readonly argument: MatchBindingPattern | null;
}

/***********
 * Records *
 ***********/
export interface RecordDeclaration extends BaseNode {
  readonly type: "RecordDeclaration";
  readonly id: Identifier;
  readonly typeParameters: TypeParameterDeclaration | null;
  readonly implements: ReadonlyArray<RecordDeclarationImplements>;
  readonly body: RecordDeclarationBody;
}

export interface RecordDeclarationImplements extends BaseNode {
  readonly type: "RecordDeclarationImplements";
  readonly id: Identifier;
  readonly typeArguments: TypeParameterInstantiation | null;
}

export interface RecordDeclarationBody extends BaseNode {
  readonly type: "RecordDeclarationBody";
  readonly elements: ReadonlyArray<
    | RecordDeclarationProperty
    | RecordDeclarationStaticProperty
    | MethodDefinition
  >;
}

export interface RecordDeclarationProperty extends BaseNode {
  readonly type: "RecordDeclarationProperty";
  readonly key: ObjectPropertyKey;
  readonly typeAnnotation: TypeAnnotation;
  readonly defaultValue: Expression | null;
}

export interface RecordDeclarationStaticProperty extends BaseNode {
  readonly type: "RecordDeclarationStaticProperty";
  readonly key: ObjectPropertyKey;
  readonly typeAnnotation: TypeAnnotation;
  readonly value: Expression;
}

export interface RecordExpression extends BaseNode {
  readonly type: "RecordExpression";
  readonly recordConstructor: Expression;
  readonly typeArguments: TypeParameterInstantiation | null;
  readonly properties: RecordExpressionProperties;
}

export interface RecordExpressionProperties extends BaseNode {
  readonly type: "RecordExpressionProperties";
  readonly properties: ReadonlyArray<ObjectProperty | SpreadElement>;
}

/******************************************************
 * Deprecated spec nodes awaiting migration by Hermes *
 ******************************************************/

export {};
