// @flow

const TYPE_MAP = {
    'character device': 'special',
    'character special file': 'special',
    directory: 'directory',
    'regular file': 'file',
    socket: 'socket',
    'symbolic link': 'link',
} as Foo;

this.previewPlayerHandle = (setInterval(async () => {
  if (this.previewIsPlaying) {
    await this.fetchNextPreviews();
    this.currentPreviewIndex++;
  }
}, this.refreshDelay) as any);

this.intervalID = (setInterval(() => {
  self.step();
}, 30) as any);
