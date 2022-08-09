const visitorKeys = {

root:["children", "trailingComment"],
"document": ["head", "body"],
"documentHead": ["children", "endComments"],
"documentBody": ["children", "endComments"],
"directive": [],
alias:[],
"blockLiteral": [],
"blockFolded": [],
"plain": [],
"quoteSingle": [],
"quoteDouble": [],
"mapping": ["children"],
"mappingItem": ["key", "value"],
"mappingKey": ["content"],
"mappingValue": ["content"],
"sequence": ["children"],
"sequenceItem": ["content"],
"flowMapping": ["children"],
"flowMappingItem": ["key", "value"],
"flowSequence": ["children"],
"flowSequenceItem": [],
"comment": [],
tag: [],
anchor: [],
}


export default visitorKeys
