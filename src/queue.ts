import {
  Snowflake,
  StreamDispatcher,
  VoiceChannel,
  VoiceConnection,
} from "discord.js";
import { logger } from "./logging";

export type Queue = {
  play(instant: Instant): Promise<void>;
  skip(): void;
  kill(): void;
  readonly isPlaying: boolean;
  readonly items: Instant[];
};

const queues = new Map<Snowflake, Queue>();

export function getQueue(channel: VoiceChannel): Queue {
  if (!channel.joinable) {
    logger.warn({ channel: channel.name }, "Channel is not joinable.");
  }
  if (queues.has(channel.id)) {
    return queues.get(channel.id)!;
  }
  const queue = createQueue(channel);
  queues.set(channel.id, queue);
  return queue;
}

function createQueue(channel: VoiceChannel): Queue {
  let connection: VoiceConnection | null = null;
  let isPlaying: boolean = false;
  let dispatcher: StreamDispatcher | null = null;
  const items: Instant[] = [];

  async function play(item: Instant) {
    items.push(item);
    if (!isPlaying) {
      while (items.length) {
        await actuallyPlay().catch((err) => {
          console.log("Passa por aqui 2");
          throw err;
        });
        items.shift();
      }
      isPlaying = false;
      connection = null;
    }
  }

  async function actuallyPlay(): Promise<void> {
    await connect().then(
      (connection) =>
        new Promise((resolve, reject) => {
          const next = items[0];

          dispatcher = connection.play(next.url);
          dispatcher.setVolumeDecibels(80);
          dispatcher.on("finish", () => {
            logger.debug({ item: next }, "Queue item played successfully"); // remove item from playlist after playing it
            resolve();
          });
          dispatcher.on("error", (err) => {
            logger.error(err, "Error while playing queue item.");
            kill(); // kill the playlist in case of error
            reject();
          });
        }),
    );
  }

  function skip() {
    dispatcher?.end();
  }

  function kill() {
    items.splice(0);
    dispatcher?.end();
    dispatcher = null;
    isPlaying = false;
  }

  async function connect(): Promise<VoiceConnection> {
    if (!channel.joinable) {
      throw new QueueException("Channel is not joinable.", channel);
    }

    connection = await channel.join();

    return connection;
  }

  return {
    play,
    skip,
    kill,
    get isPlaying() {
      return isPlaying;
    },
    get items() {
      return [...items];
    },
  };
}

export class QueueException extends Error {
  constructor(message: string, readonly channel: VoiceChannel) {
    super(message);
  }
  readonly name = "QueueException";
}
