declare module "example" {
  declare interface EventEmitter {
    on(type: string, listener: Function): void;
    off(type: string, listener: Function): void;
  }

  declare export class Terminal implements EventEmitter {
    on(type: string, listener: Function): void;
    off(type: string, listener: Function): void;
  }
}
