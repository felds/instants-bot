import Discord, {
  ClientUser,
  Message,
  MessageEmbed,
  MessageReaction,
  VoiceConnection,
  StreamDispatcher,
} from "discord.js";
import config from "./config";
import { listInstants } from "./src/connector";
import { Instant } from "./src/types";

const reactionIcons = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

const client = new Discord.Client();

type Queue = {
  isPlaying: boolean;
  instants: Instant[];
  dispatcher?: StreamDispatcher;
};

const queues = new WeakMap<VoiceConnection, Queue>();

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  client.user?.setActivity({
    name: "chama assim, ó",
    type: "LISTENING",
  });
});

client.on("message", async (message) => {
  if (message.author.bot) return;

  if (
    ["chama assim, ó", "chama assim ó"].includes(
      message.content.trim().toLowerCase()
    )
  ) {
    const desc = `
      **Pra fazê as galera debochá legal:**
      \`chama [busca]\` pra machucar o regueiro
      \`faya\` pra parar de machucar o regueiro
      \`comequie\` pra ver a lista de debochadas de maceió
    `;
    const embed = new Discord.MessageEmbed({
      color: "#fcba03",
      description: desc,
    });
    message.reply(embed);
    return;
  }

  if (
    [
      "como eh que eh",
      "como é que é",
      "comequie",
      "comequié",
      "comequieh",
    ].includes(message.content.trim().toLowerCase())
  ) {
    displayQueue(message);
    return;
  }

  if (["faia", "faya"].includes(message.content.trim().toLowerCase())) {
    stop(message);
    return;
  }

  if (!message.content.startsWith(config.prefix)) return;

  // handle connections
  let connection: VoiceConnection;
  try {
    connection = await connectToVoiceChannel(message);
  } catch (err) {
    return message.reply(err.message);
  }

  const searchTerms = message.content.slice(config.prefix.length).trim();
  const results = await listInstants(searchTerms, reactionIcons.length);
  if (results.length < 1) {
    return message.reply("nachei nada, não!");
  }

  const desc = results
    .map((result, i) => `${reactionIcons[i]} ${result.title}`)
    .join("\n");

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

        enqueue(connection, instant);
        playQueue(connection);
      }
    }
  } catch (_) {
    embed.delete();
  }
});

function enqueue(connection: VoiceConnection, instant: Instant) {
  const queue = queues.get(connection) || {
    isPlaying: false,
    instants: [],
  };
  queues.set(connection, queue);
  queue.instants.push(instant);
}

function playQueue(connection: VoiceConnection) {
  const queue = queues.get(connection);

  if (!queue) {
    return;
  }

  if (!queue.instants.length) {
    queue.isPlaying = false;
    return;
  }

  if (queue.isPlaying) {
    return;
  }

  queue.isPlaying = true;
  const instant = queue.instants[0];
  const dispatcher = connection.play(instant.url);
  dispatcher.setVolumeLogarithmic(0.666);
  dispatcher.on("finish", () => {
    queue.isPlaying = false;
    queue.instants.shift();
    playQueue(connection);
  });
  dispatcher.on("error", (err) => {
    queue.isPlaying = false;
    console.error(err);
  });

  queue.dispatcher = dispatcher;
}

async function connectToVoiceChannel(
  message: Message
): Promise<VoiceConnection> {
  const voiceChannel = message.member?.voice?.channel;

  if (!voiceChannel) {
    throw new Error(
      "você tem que estar conectado em um canal de voz para me usar (ui)."
    );
  }

  const permissions = voiceChannel.permissionsFor(
    message.client.user as Discord.User
  );

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

client.login(config.token);

async function displayQueue(message: Message) {
  const voiceChannel = await connectToVoiceChannel(message);

  const queue = queues.get(voiceChannel);
  if (!queue || !queue.instants.length) {
    message.reply("tem nada tocani não");
    return;
  }

  message.reply(
    queue.instants.map((instant) => `\n ☞ ${instant.title}`).join("")
  );
}

async function stop(message: Message) {
  const voiceChannel = await connectToVoiceChannel(message);
  const queue = queues.get(voiceChannel);
  if (!queue || !queue.instants.length) {
    message.reply("tem nada tocani não");
    return;
  }

  message.reply("fogo na babilônia");
  queue.dispatcher?.end();
  queue.instants = [];
  queue.isPlaying = false;
}
