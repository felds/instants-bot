import { VoiceConnection } from "discord.js";

declare global {
  type Instant = {
    title: string;
    url: string;
  };

  type MyChannel = {
    connection: VoiceConnection;
  };
}
