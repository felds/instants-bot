import Discord, { Message, VoiceChannel, VoiceConnection } from "discord.js";
import config from "./config";
import CommandHandler from "./src/CommandHandler";
import Queue from "./src/Queue";

const client = new Discord.Client();
client.login(config.token);

const queues = new WeakMap<VoiceChannel, Queue>();

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  client.user?.setActivity({
    name: "chama",
    type: "LISTENING",
  });
});

client.on("message", async (message) => {
  if (message.author.bot) return;

  const cleanContent = message.cleanContent.trim();
  if (!matchPrefix(cleanContent)) return;

  // handle connections
  let voiceChannel: VoiceChannel;
  let queue: Queue;
  try {
    voiceChannel = getVoiceChannel(message);
    queue = await getQueue(voiceChannel);
  } catch (err) {
    return message.reply(err.message);
  }

  const args = cleanContent.split(/\s+/).slice(1);
  console.log({ args });
  const handlers: CommandHandler[] = [
    // --------------------------
    new CommandHandler.Help(args, message),
    new CommandHandler.List(args, message, queue),
    new CommandHandler.Skip(args, message, queue),
    new CommandHandler.Stop(args, message, queue),
    new CommandHandler.Search(args, message, queue),
    // --------------------------
  ];
  for (const handler of handlers) {
    if (await handler.accepts()) {
      await handler.handle();
      return;
    }
  }
});

async function connectToVoiceChannel(
  voiceChannel: VoiceChannel
): Promise<VoiceConnection> {
  const botUser = client.user;
  if (!botUser) throw new Error("quedê usuário?");

  const permissions = voiceChannel.permissionsFor(botUser);

  if (
    !permissions ||
    !permissions.has("CONNECT") ||
    !permissions.has("SPEAK")
  ) {
    throw new Error(
      "eu não tenho permissão pra conectar nesse canal de voz [sad bot noises]."
    );
  }

  return voiceChannel.join();
}

function getVoiceChannel(message: Message): VoiceChannel {
  const voiceChannel = message.member?.voice.channel;

  if (!voiceChannel) {
    throw new Error(
      "você tem que estar conectado em um canal de voz para me usar (ui)."
    );
  }

  return voiceChannel;
}

async function getQueue(voiceChannel: VoiceChannel): Promise<Queue> {
  if (queues.has(voiceChannel)) {
    return queues.get(voiceChannel)!;
  }

  const voiceConnection = await connectToVoiceChannel(voiceChannel);
  const newQueue = new Queue(voiceConnection);
  queues.set(voiceChannel, newQueue);

  return newQueue;
}

function matchPrefix(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return (
    lowerContent.startsWith(config.prefix + " ") ||
    lowerContent === config.prefix
  );
}
