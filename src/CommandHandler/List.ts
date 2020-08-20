import { Message } from "discord.js";
import Queue from "../queue";
import MyEmbed from "../MyEmbed";

export default class List implements ICommandHandler {
  static readonly MAX_ROWS = 10;

  constructor(
    private args: string[],
    private message: Message,
    private queue: Queue
  ) {}

  public async accepts(): Promise<boolean> {
    return ["-l", "-ls", "-list"].includes(this.args[0]);
  }

  public async handle(): Promise<void> {
    let description: string;

    if (this.queue.items.length) {
      const items = this.queue.items.map(
        (instant, i) => `${i ? "🖐" : "👉"} ${instant.title}`
      );
      description =
        "\n" +
        items.slice(0, List.MAX_ROWS).join("\n") +
        "\n" +
        (items.length > List.MAX_ROWS
          ? `+${items.length - List.MAX_ROWS} pedradas`
          : "");
    } else {
      description = "Tem nada aqui não";
    }

    this.message.channel.send(new MyEmbed({ description }));
  }
}
