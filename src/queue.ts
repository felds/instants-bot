import {
  VoiceConnection,
  StreamDispatcher,
  VoiceChannel,
  Snowflake,
} from "discord.js";
import { connectToVoiceChannel } from "./discord";

export default class Queue {
  private isPlaying: boolean = false;
  private currentDispatcher?: StreamDispatcher;

  readonly items: Instant[] = [];

  constructor(private voiceChannelId: Snowflake) {}

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

    return new Promise(async (resolve, reject) => {
      const connection = await connectToVoiceChannel(this.voiceChannelId);
      const dispatcher = connection.play(next.url);
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

export const queues = new Map<Snowflake, Queue>();

export async function getQueue(voiceChannel: VoiceChannel): Promise<Queue> {
  if (queues.has(voiceChannel.id)) {
    return queues.get(voiceChannel.id)!;
  }

  const newQueue = new Queue(voiceChannel.id);
  queues.set(voiceChannel.id, newQueue);

  return newQueue;
}
