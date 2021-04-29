import {
  Guild,
  Snowflake,
  StreamDispatcher,
  VoiceChannel,
  VoiceConnection,
} from "discord.js";
import { logger } from "./logging";
import { Instant } from "./model/Instant";

const queues = new Map<Snowflake, Queue>();

/**
 * @TODO log channel and guild for everything
 */
export class Queue {
  private isPlaying: boolean = false;
  private dispatcher: StreamDispatcher | null = null;
  readonly items: Instant[] = [];

  constructor(private guild: Guild) {}

  /**
   * @TODO log who did the thing
   */
  public async play(item: Instant, onStart?: () => void) {
    this.items.push(item);

    if (!this.isPlaying) {
      this.isPlaying = true;
      while (this.items.length) {
        try {
          onStart?.();
          await this.playForRealsies();
        } catch (err) {
          this.kill();
          throw err;
        }
      }
      logger.debug({ guild: this.guild.name }, "Queue finished.");
      this.isPlaying = false;
    }
  }

  /**
   * @TODO log who did the thing
   */
  public skip() {
    logger.debug("Item skipped by the user.");
    this.dispatcher?.end();
  }

  /**
   * @TODO log who did the thing
   */
  public kill() {
    logger.debug("Queue cleared by the user.");
    this.items.splice(0);
    this.dispatcher?.end();
    this.isPlaying = false;
  }

  /**
   * Plays the next item and removes it from the queue.
   * Cleans the queue in case of error.
   */
  private async playForRealsies(): Promise<void> {
    const next = this.items[0];
    if (!next) return;

    const connection = await this.connect();
    await new Promise<void>((resolve, reject) => {
      const dispatcher = connection.play(next.url);

      dispatcher.setVolumeLogarithmic(0.85);
      dispatcher.on("finish", () => {
        logger.debug({ item: next }, "Queue item played successfully");
        // remove item from playlist AFTER playing it
        // so it can be shown as "playing"
        this.items.shift();
        resolve();
      });
      dispatcher.on("error", (err) => {
        logger.error(err, "Error while playing queue item.");
        this.kill(); // kill the playlist in case of error
        reject();
      });

      this.dispatcher = dispatcher;
    });
  }

  private async connect(): Promise<VoiceConnection> {
    if (!this.channel.joinable) {
      throw new QueueException("Channel is not joinable.", this.channel);
    }
    return this.channel.join();
  }
}

export function getQueue(channel: VoiceChannel): Queue {
  // if (!channel.joinable) {
  //   throw new QueueException("Query is not joinable.", channel);
  // }

  if (queues.has(channel.id)) {
    return queues.get(channel.id)!;
  }

  const queue = new Queue(channel);
  queues.set(channel.id, queue);
  return queue;
}

export class QueueException extends Error {
  constructor(message: string, readonly channel: VoiceChannel) {
    super(message);
  }
  readonly name = "QueueException";
}
