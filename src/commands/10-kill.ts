import { Message } from "discord.js";
import { Embed } from "../message";
import { Queue } from "../queue";
import { Command } from "../types";

export const command: Command = {
  aliases: ["-k", "-stop", "-kill"],
  description: "Mata a fila",
  async process(message: Message, queue: Queue) {
    queue.kill();
    await message.channel.send(
      new Embed({ description: "🔥 *Fogo na babilônia* 🔥" }),
    );
  },
};
