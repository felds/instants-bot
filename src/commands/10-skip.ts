import Queue from "../queue";
import { Message } from "discord.js";

export const command: Command = {
  aliases: ["-skip", "-s", "-jump", "-j"],
  description: "Pula uma pedrada",
  async process(message: Message, queue: Queue, ...args: string[]) {
    queue.skip();
  },
};
