import Discord, { MessageEmbed, MessageReaction, ClientUser } from "discord.js";
import config from "./config";
import { listInstants } from "./src/connector";

const reactions = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  // handle connections
  let connection: VoiceConnection;
  try {
    connection = await connectToVoiceChannel(message);
  } catch (err) {
    return message.reply(err.message);
  }

  const searchTerms = message.content.slice(config.prefix.length).trim();
  const results = await listInstants(searchTerms, reactions.length);
  if (results.length < 1) {
    return message.reply("nachei nada, não!");
  }

  const desc = results
    .map((result, i) => `${reactions[i]} ${result.title}`)
    .join("\n");

  const embed = await message.channel.send(
    new MessageEmbed({
      color: "#fcba03",
      description: desc,
      length: 20,
    })
  );
  for (const r of reactions.slice(0, results.length)) {
    embed.react(r);
  }

  const filter = (reaction: MessageReaction, user: ClientUser) =>
    reactions.includes(reaction.emoji.name) && !user.bot; // && user.id === message.author.id;

  try {
    while (true) {
      const collected = await embed.awaitReactions(filter, {
        max: 1,
        time: 300_000,
      });
      for (const r of collected.array()) {
        const emoji = r.emoji.name!;
        const i = reactions.indexOf(emoji);
        connection.play(results[i].url).setVolumeLogarithmic(0.666);
      }
    }
  } catch (_) {
    embed.delete();
    // @TODO marcar o embed como morto
  }
});

client.login(config.token);

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
