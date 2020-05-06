/* @flow */

const EventEmitter = require('events');
const emitter = new EventEmitter();
const noop = function() {}

emitter.addListener('foo', noop);         // ok
emitter.addListener('bar', noop).addListener('baz', noop); // ok: supports chaining
emitter.addListener();                    // err: both args are required
emitter.addListener(123, {});             // err: `event` and `handler `type mismatch

emitter.emit('foo', 'bar', {}, [], noop); // ok: emits `foo` with any args
emitter.emit('foo');                      // ok: emits `foo` with no event data
emitter.emit({});                         // err: `event` must be a string

emitter.eventNames().pop();               // ok: returns string[]
emitter.eventNames('foo')                 // err: does not process args

emitter.listeners('foo').pop()();         // ok: returns Function[]
emitter.listeners();                      // err: requires `event`

emitter.listenerCount('foo').toFixed();   // ok: returns a number
emitter.listenerCount();                  // err: requires `event`

emitter.on('foo', noop);                  // ok
emitter.on('bar', noop).on('baz', noop);  // ok: chaining
emitter.on(123, []);                      // err: `event` and `handler `type mismatch

emitter.once('foo', noop);                // ok
emitter.once('bar', noop).on('baz', noop);  // ok: chaining
emitter.once(123, []);                    // err: `event` and `handler `type mismatch

emitter.prependListener('foo', noop);     // ok
emitter.prependListener('bar', noop).prependListener('baz', noop); // ok: supports chaining
emitter.prependListener();                // err: both args are required
emitter.prependListener(123, {});         // err: `event` and `handler `type mismatch

emitter.prependOnceListener('foo', noop); // ok
emitter.prependOnceListener('bar', noop).prependOnceListener('baz', noop); // ok: supports chaining
emitter.prependOnceListener();            // err: both args are required
emitter.prependOnceListener(123, {});     // err: `event` and `handler `type mismatch

emitter.removeAllListeners('foo');        // ok
emitter.removeAllListeners();             // ok
emitter.removeAllListeners().removeAllListeners(); // ok: supports chaining
emitter.removeAllListeners(123);          // err: `event` must be a string

emitter.removeListener('foo', noop);      // ok
emitter.removeListener('foo', noop).removeListener('foo', noop); // ok: supports chaining
emitter.removeListener();                 // err: both args are required
emitter.removeListener(123, {});          // `event` and `handler `type mismatch

emitter.off('foo', noop);                 // ok
emitter.off('foo', noop).off('foo', noop); // ok: supports chaining
emitter.off();                            // err: both args are required
emitter.off(123, {});                     // `event` and `handler `type mismatch

emitter.setMaxListeners(5);               // ok
emitter.setMaxListeners('foo');           // err: numeric arg is required

emitter.getMaxListeners().toFixed();      // ok
emitter.getMaxListeners('foo');           // err: does not process args

emitter.rawListeners('foo').pop()();      // ok: returns Function[]
emitter.rawListeners();                   // err: requires `event`

EventEmitter.defaultMaxListeners.toFixed() // ok
