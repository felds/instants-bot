import { VoiceConnection, StreamDispatcher } from "discord.js";

export default class Queue {
  protected isPlaying: boolean = false;
  protected connection: VoiceConnection;
  protected currentDispatcher?: StreamDispatcher;

  readonly items: Instant[] = [];

  constructor(connection: VoiceConnection) {
    this.connection = connection;
  }

  public async play(item: Instant) {
    this.items.push(item);

    if (!this.isPlaying) {
      this.isPlaying = true;
      while (this.items.length) {
        await this.playNext();
      }
      this.isPlaying = false;
    }
  }

  public skip() {
    this.currentDispatcher?.end();
  }

  public stop() {
    this.items.splice(0);
    this.currentDispatcher?.end();
    this.isPlaying = false;
  }

  /**
   * Plays the next item and removes it from the queue.
   * Cleans the queue in case of error.
   */
  protected async playNext(): Promise<void> {
    const next = this.items[0];
    if (!next) return;

    return new Promise((resolve, reject) => {
      const dispatcher = this.connection.play(next.url);
      dispatcher.setVolumeLogarithmic(0.666);
      dispatcher.on("finish", () => {
        this.items.shift(); // remove from the queue after playing
        resolve();
      });
      dispatcher.on("error", () => {
        this.items.splice(0); // clear the queue in case of error
        reject();
      });
      this.currentDispatcher = dispatcher;
    });
  }
}
