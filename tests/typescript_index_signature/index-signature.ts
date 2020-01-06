class LocalStorage implements Storage {
  [index: number]: string;
  [key: string]: any;
}

type A = { [key: string] };
