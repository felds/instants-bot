import { Message } from "discord.js";
import { Queue } from "../../queue";
import { Command } from "../../util/command";

export const command: Command<{ queue: Queue }> = {
  name: "skip",
  aliases: ["-j", "-s", "-jump", "-skip"],
  description: "Pula a pedrada",
  process: async (
    args: string[],
    message: Message,
    allCommands: Command[],
    { queue },
  ): Promise<void> => {
    queue.skip();
  },
};
