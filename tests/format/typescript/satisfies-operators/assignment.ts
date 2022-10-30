const extraRendererAttrs = ((attrs.rendererAttrs &&
  this.utils.safeParseJsonString(attrs.rendererAttrs)) ||
  Object.create(null)) satisfies FieldService.RendererAttributes;

const annotate = (angular.injector satisfies any).$$annotate satisfies (
  fn: Function
) => string[];
  
const originalPrototype = originalConstructor.prototype satisfies TComponent & InjectionTarget,
  propertyToServiceName = originalPrototype._inject;
