import {
  Snowflake,
  StreamDispatcher,
  VoiceChannel,
  VoiceConnection,
} from "discord.js";
import { connectToVoiceChannel } from "./discord";
import { logger } from "./logging";

export default class Queue {
  private isPlaying: boolean = false;
  private currentDispatcher?: StreamDispatcher;
  private connection: VoiceConnection | null = null;

  readonly items: Instant[] = [];

  constructor(private voiceChannelId: Snowflake) {}

  public async play(item: Instant) {
    this.items.push(item);

    if (!this.isPlaying) {
      this.isPlaying = true;
      while (this.items.length) {
        await this.playNext();
      }
      this.disconnect();
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
      try {
        if (!this.connection) {
          this.connection = await connectToVoiceChannel(this.voiceChannelId);
        }

        const dispatcher = this.connection.play(next.url);
        dispatcher.setVolumeLogarithmic(0.8);
        dispatcher.on("finish", () => {
          this.items.shift(); // remove from the queue after playing
          resolve();
        });
        dispatcher.on("error", () => {
          this.items.splice(0); // clear the queue in case of error
          reject();
        });
        this.currentDispatcher = dispatcher;
      } catch (err) {
        resolve();
      }
    });
  }

  private async connect(): Promise<void> {
    const { voiceChannelId } = this;

    if (this.connection) {
      logger.debug({ voiceChannelId }, "Already connected to voice channel.");
      return;
    }

    try {
      logger.debug({ voiceChannelId }, "Connecting to voice channel.");
      this.connection = await connectToVoiceChannel(this.voiceChannelId);
    } catch (err) {
      logger.error(
        { err, voiceChannelId },
        "Error while connecting to voice channel.",
      );
      throw err;
    }
  }

  private disconnect() {
    const { voiceChannelId } = this;

    if (!this.connection) {
      logger.debug({ voiceChannelId }, "Not connected to voice channel.");
      return;
    }

    logger.debug({ voiceChannelId }, "Disconnecting from voice channel.");
    this.connection.disconnect();
    this.connection = null;
  }
}

export const queues = new Map<Snowflake, Queue>();

export async function getQueue(voiceChannel: VoiceChannel): Promise<Queue> {
  if (queues.has(voiceChannel.id)) {
    logger.info({ voiceChannel }, "Queue for voice channel found.");
    return queues.get(voiceChannel.id)!;
  }

  logger.info(
    { voiceChannel },
    "Queue for voice channel not found. Creating a new one.",
  );
  const newQueue = new Queue(voiceChannel.id);
  queues.set(voiceChannel.id, newQueue);

  return newQueue;
}
