import { Message } from "discord.js";
import Queue from "../queue";

export default class Skip implements ICommandHandler {
  constructor(
    private args: string[],
    private message: Message,
    private queue: Queue
  ) {}

  public async accepts(): Promise<boolean> {
    return ["-skip", "-s", "-jump", "-j"].includes(this.args[0]);
  }

  public async handle(): Promise<void> {
    this.queue.skip();
  }
}
