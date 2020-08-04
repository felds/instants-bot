// @ts-check

const path = require("path");
const config = require("./config.js");
const Discord = require("discord.js");
const oia = require("@discordjs/opus");
const client = new Discord.Client();

const FILE = path.join(__dirname, "manda_o_michael_manuel.mp3");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const voiceChannel = message.member.voice.channel;

  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  const connection = await voiceChannel.join();
  connection.play(FILE).setVolumeLogarithmic(0.25);

  message.reply(`OLHA A PEDRA`);
});

client.login(config.token);
