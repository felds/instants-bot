import { VoiceConnection } from "discord.js";

export default class Queue {
  protected _isPlaying: boolean = false;

  readonly items: Instant[] = [];

  private connection: VoiceConnection;

  constructor(connection: VoiceConnection) {
    this.connection = connection;
  }

  public async play(item: Instant) {
    this.items.push(item);

    if (!this.isPlaying) {
      this._isPlaying = true;
      while (this.items.length) {
        const next = this.items[0];
        await this.playItem();
      }
      this._isPlaying = false;
    }
  }

  protected async playItem(): Promise<void> {
    const next = this.items[0];
    if (!next) return;

    return new Promise((resolve, reject) => {
      const dispatcher = this.connection.play(next.url);
      dispatcher.setVolume(0.666);
      dispatcher.on("finish", () => {
        this.items.shift(); // remove from the queue after playing
        resolve();
      });
      dispatcher.on("error", () => {
        this.items.splice(0); // clear the queue in case of error
        reject();
      });
    });
  }

  get isPlaying() {
    return this._isPlaying;
  }
}
