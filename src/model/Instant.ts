import { VoiceChannel } from "discord.js";

export type Instant = {
  /** The title of the audio, as shown to the user. */
  title: string;

  /** The URL of the sound file. */
  url: string;

  /** Where to play this audio. */
  voiceChannel: VoiceChannel;

  /** A callback that will be called when the audio starts playing. */
  onStart?(): void;
};
