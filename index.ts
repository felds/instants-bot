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

  const search = message.content.slice(config.prefix.length).trim();

  const voiceChannel = message?.member?.voice.channel;

  if (!voiceChannel)
    return message.channel.send("Você precisa estar em um canal de voz.");

  const permissions = voiceChannel.permissionsFor(
    message.client.user as Discord.User
  );
  if (
    !permissions ||
    !permissions.has("CONNECT") ||
    !permissions.has("SPEAK")
  ) {
    return message.channel.send(
      "Eu preciso de permissões para conectar e falar no seu canal de voz."
    );
  }

  const results = await listInstants(search, reactions.length);
  if (!results) {
    return message.channel.send("Não achei nada, não!");
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
    reactions.includes(reaction.emoji.name) && user.id === message.author.id;

  embed
    .awaitReactions(filter, {
      max: 1,
      time: 300_000,
    })
    .then(async (collected) => {
      const emoji = collected.first()?.emoji.name!;
      const i = reactions.indexOf(emoji);

      const connection = await voiceChannel.join();
      connection.play(results[i].url).setVolumeLogarithmic(0.666);
    })
    .catch((err) => message.reply(`Deu ruim (${err})`));
});

client.login(config.token);
