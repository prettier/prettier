type $JSXIntrinsic<T> = {props: T, instance: any};

type $JSXIntrinsics = {
  div: $JSXIntrinsic<{id: string}>,
  span: $JSXIntrinsic<{id: string, class: string}>,
};
