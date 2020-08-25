import {
  Client,
  Snowflake,
  StreamDispatcher,
  VoiceChannel,
  VoiceConnection,
  VoiceState,
} from "discord.js";
import config from "./src/config";
import { logger } from "./src/logging";

const client = new Client();
client.login(config.TOKEN);

const sounds: { [id: string]: Instant } = {
  "741127151289499709": {
    title: "Bow chicka bow-wow",
    url: "/Users/felds/Downloads/boom-chicka-wah-wah.mp3",
  },
};

client.on("ready", () => logger.info("Logged in as user %O", client.user?.tag));

client.on("voiceStateUpdate", async function voiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
) {
  if (!shouldPlay(oldState, newState)) {
    return;
  }

  const member = newState.member!;
  const channel = newState.channel!;
  const sound = sounds[member.id];

  try {
    const queue = getQueue(channel);
    logger.debug({ sound }, "Playing buzzer.");
    await queue.play(sound);
  } catch (err) {
    if (err instanceof QueueException) {
      logger.warn(
        { channel: err.channel.name, guild: err.channel.guild.name },
        err.message,
      );
    }
  }
});

function isJoining(oldState: VoiceState, newState: VoiceState): boolean {
  return !!(newState.channel && oldState.channel !== newState.channel);
}
function shouldPlay(oldState: VoiceState, newState: VoiceState): boolean {
  const { member } = newState;

  if (!member) {
    logger.debug("No member.");
    return false;
  }
  if (member.user.bot) {
    logger.trace({ user: member.user.tag }, "User is a bot.");
    return false;
  }
  if (!isJoining(oldState, newState)) {
    logger.trace(
      { user: member.user.tag },
      "User is not joining a new voice channel.",
    );
    return false;
  }
  if (!sounds[member.id]) {
    logger.trace({ user: member.user.tag }, "User is a bot.");
    return false;
  }

  return true;
}

// -----------------------------------------------------------------------
// -                              Queue
// -----------------------------------------------------------------------

type NewQueue = {
  play(instant: Instant): Promise<void>;
  skip(): void;
  kill(): void;
  readonly isPlaying: boolean;
  readonly items: Instant[];
};
type Instant = {
  title: string;
  url: string;
};
const queues = new Map<Snowflake, NewQueue>();
function getQueue(channel: VoiceChannel): NewQueue {
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
function createQueue(channel: VoiceChannel): NewQueue {
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
      connection?.disconnect();
      connection = null;
    }
  }

  async function actuallyPlay(): Promise<void> {
    await connect().then(
      (connection) =>
        new Promise((resolve, reject) => {
          const next = items[0];

          dispatcher = connection.play(next.url);
          dispatcher.setVolumeLogarithmic(0.8);
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
    if (connection) {
      return connection;
    }

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
