type $JSXIntrinsic<T> = {instance: any, props: T};

type $JSXIntrinsics = {
  div: $JSXIntrinsic<{id: string}>,
  span: $JSXIntrinsic<{id: string, class: string}>,
};
