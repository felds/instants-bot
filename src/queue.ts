import { Guild, StreamDispatcher, VoiceChannel } from "discord.js";
import { connectToVoiceChannel } from "./discord";
import { logger } from "./logging";
import { Instant } from "./model/Instant";

const queues = new WeakMap<Guild, Queue>();

export class Queue {
  private isPlaying = false;
  private dispatcher: StreamDispatcher | null = null;
  readonly items: Instant[] = [];

  constructor(private guild: Guild) {}

  public async play(item: Instant): Promise<void> {
    this.items.push(item);

    if (!this.isPlaying) {
      this.isPlaying = true;
      while (this.items.length) {
        try {
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

  public skip(): void {
    logger.debug("Item skipped by the user.");
    this.dispatcher?.end();
  }

  public kill(): void {
    logger.debug("Queue cleared.");
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

    next.onStart?.();

    const connection = await connectToVoiceChannel(next.voiceChannel.id);
    await new Promise<void>((resolve, reject) => {
      const dispatcher = connection.play(next.url);

      dispatcher.setVolumeLogarithmic(0.85);
      dispatcher.on("unpipe", () => {
        const item = {
          url: next.url,
          title: next.title,
          voiceChannel: next.voiceChannel.name,
        };
        logger.debug(item, "Queue item played successfully");
        // remove item from playlist AFTER playing it so it can be shown as "playing"
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
}

export function getQueue(guild: Guild): Queue {
  const existingQueue = queues.get(guild);
  if (existingQueue !== undefined) return existingQueue;

  const newQueue = new Queue(guild);
  queues.set(guild, newQueue);
  return newQueue;
}

export class QueueException extends Error {
  constructor(message: string, readonly channel: VoiceChannel) {
    super(message);
  }
  readonly name = "QueueException";
}
