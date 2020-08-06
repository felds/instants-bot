import { Message } from "discord.js";
import Queue from "../Queue";

export default class List implements CommandHandler {
  constructor(
    private args: string[],
    private message: Message,
    private queue: Queue
  ) {}

  public async accepts(): Promise<boolean> {
    return ["-l", "-ls", "-list"].includes(this.args[0]);
  }

  public async handle(): Promise<void> {
    const maxRows = 10;
    const items = this.queue.items.map(
      (instant, i) => `${i ? "🧊" : "🔥"} ${instant.title}`
    );
    const texto =
      "\n" +
      items.slice(0, maxRows).join("\n") +
      "\n" +
      (items.length > maxRows ? `+${items.length - maxRows} pedradas` : "");

    this.message.channel.send(texto);
  }
}
