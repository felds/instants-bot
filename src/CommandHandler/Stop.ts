import { Message } from "discord.js";
import Queue from "../queue";
import MyEmbed from "../MyEmbed";

export default class Stop implements ICommandHandler {
  constructor(
    private args: string[],
    private message: Message,
    private queue: Queue
  ) {}

  public async accepts(): Promise<boolean> {
    return ["-k", "-stop", "-kill"].includes(this.args[0]);
  }

  public async handle(): Promise<void> {
    this.queue.stop();
    this.message.channel.send(
      new MyEmbed({ description: "🔥 *Fogo na babilônia* 🔥" })
    );
  }
}
