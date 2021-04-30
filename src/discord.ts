import {
  Client,
  Message,
  Snowflake,
  VoiceChannel,
  VoiceConnection,
} from "discord.js";
import config from "./config";
import { logger } from "./logging";

export const client = new Client();
client.login(config.TOKEN).catch((err) => {
  logger.fatal("Couldn't log in.", err);
  process.exit(1);
});

export async function connectToVoiceChannel(
  voiceChannelId: Snowflake,
): Promise<VoiceConnection> {
  const botUser = client.user;
  if (!botUser) throw new Error("quedê usuário?");

  const voiceChannel = client.channels.cache.get(
    voiceChannelId,
  ) as VoiceChannel;
  const permissions = voiceChannel.permissionsFor(botUser);

  if (
    !permissions ||
    !permissions.has("CONNECT") ||
    !permissions.has("SPEAK")
  ) {
    throw new Error(
      "eu não tenho permissão pra conectar nesse canal de voz [sad bot noises].",
    );
  }

  const connection = await voiceChannel.join();

  return connection;
}

export function getVoiceChannel(message: Message): VoiceChannel {
  const voiceChannel = message.member?.voice.channel;

  if (!voiceChannel) {
    throw new Error(
      "você tem que estar conectado em um canal de voz para me usar (ui).",
    );
  }

  return voiceChannel;
}
