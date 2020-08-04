import Discord from "discord.js";
import config from "./config";
import { listInstants } from "./src/connector";

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

  const instant = (await listInstants(search))[0];
  if (!instant) {
    return message.channel.send("Não achei nada, não!");
  }

  const connection = await voiceChannel.join();
  connection.play(instant.url).setVolumeLogarithmic(0.5);

  return message.reply(`tocani: **${instant.title}**`);
});

client.login(config.token);
