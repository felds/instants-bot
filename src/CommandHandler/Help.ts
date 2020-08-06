import { Message } from "discord.js";

export default class Help implements CommandHandler {
  constructor(private command: string, private message: Message) {}

  public accepts() {
    return ["-h", "--help", "-?"].includes(this.command);
  }

  public async handle() {
    this.message.reply("Vem cá que eu te ajudo, cara");
  }
}
