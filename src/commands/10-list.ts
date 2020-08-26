import { Message } from "discord.js";
import { Embed } from "../message";
import { Queue } from "../queue";

const MAX_ROWS = 10;

export const command: Command = {
  aliases: ["-l", "-list", "-ls"],

  description: "Lista as pedradas",

  process(message: Message, queue: Queue, ...args: string[]): void {
    if (!queue.items.length) {
      message.channel.send(new Embed({ description: "Tem nada aqui não" }));
    } else {
      const items = queue.items.map(
        (instant, i) => `${i ? "🖐" : "👉"} ${instant.title}`,
      );
      const description =
        "\n" +
        items.slice(0, MAX_ROWS).join("\n") +
        "\n" +
        (items.length > MAX_ROWS ? `+${items.length - MAX_ROWS} pedradas` : "");
      message.channel.send(new Embed({ description }));
    }
  },
};
