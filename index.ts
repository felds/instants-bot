import Discord, {
  ClientUser,
  Message,
  MessageEmbed,
  MessageReaction,
  VoiceChannel,
  VoiceConnection,
} from "discord.js";
import config from "./config";
import CommandHandler from "./src/CommandHandler";
import { listInstants } from "./src/connector";
import Queue from "./src/Queue";

const reactionIcons = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

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

  const args = cleanContent.substr(config.prefix.length).trim().split(/\s+/);
  console.log({ args });
  const handlers: CommandHandler[] = [
    // --------------------------
    new CommandHandler.Help(args, message),
    // new CommandHandler.Search(args, message, queue);
    // --------------------------
  ];
  for (const handler of handlers) {
    if (handler.accepts()) {
      handler.handle();
      return;
    }
  }

  return;

  //#region search
  const searchTerms = message.content.slice(config.prefix.length).trim();
  const results = await listInstants(searchTerms, reactionIcons.length);
  if (results.length < 1) {
    return message.reply("nachei nada, não!");
  }

  const desc = results
    .map((result, i) => `${reactionIcons[i]} ${result.title}`)
    .join("\n");

  //#endregion

  //#region interacion
  const embed = await message.channel.send(
    new MessageEmbed({
      color: "#fcba03",
      description: desc,
    })
  );
  for (const r of reactionIcons.slice(0, results.length)) {
    embed.react(r);
  }
  const filter = (reaction: MessageReaction, user: ClientUser) =>
    reactionIcons.includes(reaction.emoji.name) && !user.bot; // && user.id === message.author.id;
  try {
    while (true) {
      const collected = await embed.awaitReactions(filter, {
        max: 1,
        time: 300_000,
      });
      for (const r of collected.array()) {
        const emoji = r.emoji.name!;
        const i = reactionIcons.indexOf(emoji);
        const instant = results[i];
        queue.play(instant);
      }
    }
  } catch (_) {
    embed.delete();
  }
  //#endregion
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

async function displayQueue(message: Message) {
  return; // @FIXME
  // const voiceChannel = await connectToVoiceChannel(message);

  // const queue = queues.get(voiceChannel);
  // if (!queue || !queue.instants.length) {
  //   message.reply("tem nada tocani não");
  //   return;
  // }

  // message.reply(
  //   queue.instants.map((instant) => `\n ☞ ${instant.title}`).join("")
  // );
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
