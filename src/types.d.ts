import { VoiceConnection, Message } from "discord.js";

declare global {
  type Instant = {
    title: string;
    url: string;
  };

  interface CommandHandler {
    /**
     * Checks whether or not the object can handle the command.
     */
    public accepts(): Promise<boolean>;

    /**
     * Process the command.
     */
    public handle(): Promise<void>;
  }
}
