class InMethod {
  value = input
  "in"() {}
}

class InstanceofMethod {
  value = input
  "instanceof"() {}
}

class QuotedFields {
  "get"
  "set"
  "static"
  method() {}
}

interface GetProperty {
  "get"
  value: string
}

interface SetProperty {
  "set"
  value: string
}

interface StaticProperty {
  "static"
  value: string
}

type KeywordProperties = {
  "get"
  "set"
  "static"
  value: string
}

interface QuotedSibling {
  "get"
  "needs-quotes": string
}

interface ConsistentIdentifier {
  get;
  "needs-quotes": string
}

interface ComputedProperty {
  ["get"]
  value: string
}
