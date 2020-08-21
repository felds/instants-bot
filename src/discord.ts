import { Client, Message, VoiceChannel, VoiceConnection } from "discord.js";

export const client = new Client();

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

  const connection = await voiceChannel.join();
  connection.on("authenticated", () =>
    console.log("Voice Channel authenticated")
  );
  connection.on("closing", () => console.log("Voice connection closing"));
  connection.on("debug", (msg) => console.log("Voice connection debug", msg));
  connection.on("disconnect", (err) =>
    console.log("Voice connection disconnected", err)
  );
  connection.on("error", (err) => console.log("Voice connection error", err));
  connection.on("failed", (err) => console.log("Voice connection failed", err));
  connection.on("newSession", () =>
    console.log("Voice connection new session")
  );
  connection.on("ready", () => console.log("Voice connection ready"));
  connection.on("reconnecting", () =>
    console.log("Voice connection reconnecting")
  );
  connection.on("speaking", (user, speaking) =>
    console.log("Voice connection speaking", user, speaking)
  );
  connection.on("warn", (warning) =>
    console.warn("Voice channel warning", warning)
  );

  return connection;
}

export function getVoiceChannel(message: Message): VoiceChannel {
  const voiceChannel = message.member?.voice.channel;

  if (!voiceChannel) {
    throw new Error(
      "você tem que estar conectado em um canal de voz para me usar (ui)."
    );
  }

  return voiceChannel;
}
