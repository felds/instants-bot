import { Message } from "discord.js";
import { Embed } from "../../message";
import { Queue } from "../../queue";
import { Command } from "../../util/command";

export const command: Command<{ queue: Queue }> = {
  name: "kill",
  aliases: ["-k", "-stop", "-kill"],
  description: "Mata a fila",
  process: async (
    args: string[],
    message: Message,
    allCommands: Command[],
    { queue },
  ): Promise<void> => {
    queue.kill();
    await message.channel.send(
      new Embed({ description: "🔥 *Fogo na babilônia* 🔥" }),
    );
  },
};
