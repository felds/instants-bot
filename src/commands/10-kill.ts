import { Message } from "discord.js";
import { Embed } from "../message";
import { Queue } from "../queue";

export const command: Command = {
  aliases: ["-k", "-stop", "-kill"],
  description: "Mata a fila",
  process(message: Message, queue: Queue) {
    queue.kill();
    message.channel.send(
      new Embed({ description: "🔥 *Fogo na babilônia* 🔥" }),
    );
  },
};
