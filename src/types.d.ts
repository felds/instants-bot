import { VoiceConnection } from "discord.js";

export type Instant = {
  title: string;
  url: string;
};

export type MyChannel = {
  connection: VoiceConnection;
};
