import Discord, {
  Message,
  VoiceChannel,
  VoiceConnection,
  VoiceState,
} from "discord.js";
import config from "./config";
import CommandHandler from "./src/CommandHandler";
import Queue from "./src/Queue";

const client = new Discord.Client();
client.login(config.token);

const queues = new WeakMap<VoiceChannel, Queue>();

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  client.user?.setActivity({
    name: `${config.prefix} -help`,
    type: "LISTENING",
  });
});

client.on(
  "voiceStateUpdate",
  async (oldState: VoiceState, newState: VoiceState) => {
    const voiceChannel = newState.channel;
    if (!voiceChannel) return;

    const member = newState.member;
    if (!member || member.user.bot) return;

    if (oldState.channelID === newState.channelID) return; // user is not joinin a new server

    const queue = await getQueue(voiceChannel);

    if (member.id === "517135926334324747") {
      queue.play({
        url: "https://www.myinstants.com/media/sounds/eaburnea_u4ueT4r.mp3",
        title: "MIMA entrou na sala",
      });
    }
    if (member.id === "109491752984907776") {
      queue.play({
        url: "https://www.myinstants.com/media/sounds/hellou.mp3",
        title: "FELDS entrou na sala",
      });
    }
    if (member.id === "338896627228213248") {
      queue.play({
        url: "https://www.myinstants.com/media/sounds/oh-novinha_mixagem.mp3",
        title: "YURI entrou na sala",
      });
    }
    if (member.id === "229722390437822464") {
      queue.play({
        url: "https://www.myinstants.com/media/sounds/aqui-e-jamal-ok.mp3",
        title: "JAMAL entrou na sala",
      });
    }
    if (member.id === "692852659765641337") {
      queue.play({
        url:
          "https://www.myinstants.com/media/sounds/manda_o_michael_manuel.mp3",
        title: "MOTOSO entrou na sala",
      });
    }
    if (member.id === "172161615620341761") {
      queue.play({
        url: "https://www.myinstants.com/media/sounds/weeaboo-x-4.mp3",
        title: "CARRERA entrou na sala",
      });
    }
  }
);

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
  const handlers: ICommandHandler[] = [
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
  const voiceConnection = await connectToVoiceChannel(voiceChannel);

  if (queues.has(voiceChannel)) {
    return queues.get(voiceChannel)!;
  }

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

const CHECK_INTERVAL = 5_000;

/**
 * Disconnects from a channel when it becomes empty.
 */
function disconnectWhenEmpty() {
  const conns = client.voice?.connections;
  if (!conns) return;

  for (const [id, conn] of conns) {
    const allBots = conn.channel.members.every((m) => m.user.bot);
    if (allBots) {
      conn.disconnect();
    }
  }
}
client.setInterval(disconnectWhenEmpty, CHECK_INTERVAL);
