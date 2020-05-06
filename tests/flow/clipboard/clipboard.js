/* @flow */

const c: Clipboard = navigator.clipboard;
const t: EventTarget = navigator.clipboard;

navigator.clipboard.read().then(function(data: DataTransfer) {});
navigator.clipboard.readText().then(function(data: string) {});

const p: Promise<void> = navigator.clipboard.write(new DataTransfer());
const p2: Promise<void> = navigator.clipboard.writeText('test');
