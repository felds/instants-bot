import { Message } from "discord.js";
import { Embed } from "../../message";
import { Queue } from "../../queue";
import { Command } from "../../util/command";

const MAX_ROWS = 10;

export const command: Command<{ queue: Queue }> = {
  name: "list",
  aliases: ["-l", "-list", "-ls"],
  description: "Lista as pedradas",
  process: async (
    args: string[],
    message: Message,
    allCommands: Command[],
    { queue },
  ): Promise<void> => {
    if (!queue.items.length) {
      await message.channel.send(
        new Embed({ description: "Tem nada aqui não" }),
      );
    } else {
      const items = queue.items.map(
        (instant, i) => `${i ? "🖐" : "👉"} ${instant.title}`,
      );
      const description =
        "\n" +
        items.slice(0, MAX_ROWS).join("\n") +
        "\n" +
        (items.length > MAX_ROWS ? `+${items.length - MAX_ROWS} pedradas` : "");
      await message.channel.send(new Embed({ description }));
    }
  },
};
