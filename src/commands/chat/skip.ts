import { Message } from "discord.js";
import { Queue } from "../../queue";
import { Command } from "../../util/command";

export const command: Command = {
  name: "skip",
  aliases: ["-j", "-s", "-jump", "-skip"],
  description: "Pula a pedrada",
  async process(message: Message, queue: Queue): Promise<void> {
    queue.skip();
  },
};
