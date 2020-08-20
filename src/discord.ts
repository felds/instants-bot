import { Client, VoiceChannel, VoiceConnection } from "discord.js";
import config from "./config";

export const client = new Client();
client.login(config.token);

export async function connectToVoiceChannel(
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
