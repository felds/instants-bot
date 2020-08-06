import { Message } from "discord.js";

export default class Help implements CommandHandler {
  constructor(private args: string[], private message: Message) {}

  public accepts() {
    return ["-h", "--help"].includes(this.args[0]);
  }

  public async handle() {
    this.message.reply("Vem cá que eu te ajudo, cara");
  }
}
