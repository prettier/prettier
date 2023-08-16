//@flow

type Mapped = {[key in keyof O]: O[key]};
type MappedLong = {[key in keyof AReallyLongNameThatShouldReallyMostDefinitelyCauseALineWrap]: number};
type MappedWithVariance = {+[key in keyof O]: number};
type MappedWithVarianceLong = {-[key in keyof AReallyLongNameThatShouldReallyMostDefinitelyCauseALineWrap]: number};
type MappedWithPlusOptional = {[key in keyof O]+?: number};
type MappedWithMinusOptional = {[key in keyof O]-?: number};
type MappedWithOptional = {[key in keyof O]?: number};
type MappedWithPlusOptionalLong = {[key in keyof AReallyLongNameThatShouldReallyMostDefinitelyCauseALineWrap]+?: number};
type MappedWithMinusOptionalLong = {[key in keyof AReallyLongNameThatShouldReallyMostDefinitelyCauseALineWrap]-?: number};
type MappedWithOptionalLong = {[key in keyof AReallyLongNameThatShouldReallyMostDefinitelyCauseALineWrap]?: number};
type MappedWithOptionalAndVariance = {+[key in keyof O]+?: number};
type MappedWithOptionalAndVarianceLong = {+[key in keyof AReallyLongNameThatShouldReallyMostDefinitelyCauseALineWrap]+?: number};
type MappedWithComments = {/*comment about variance */+[key /* comment about key name */ in /* comment before source type */ keyof O /* comment after source type */]/* comment about optionality */? /*comment before colon */:number /*comment about the prop type */};
