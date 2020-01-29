// @flow

import type { Listener, Logger } from './import_interfaces';

class AdsULLogger<TFields> implements Logger {
  _enabled: boolean;
  _listeners: Array<Listener<TFields>>;

  isActive(): boolean {
    return this._enabled;
  }
  start(): void {
    this._enabled = true;
  }
  stop(): void {
    this._enabled = false;
  }
}
