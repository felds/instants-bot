import { Message } from "discord.js";
import config from "../config";
import { Embed } from "../message";

export default class Help implements ICommandHandler {
  constructor(private args: string[], private message: Message) {}

  public async accepts(): Promise<boolean> {
    return ["-h", "-help", "-?"].includes(this.args[0]);
  }

  public async handle(): Promise<void> {
    const description = `
      **Chama assim, ó:**
      \`${config.prefix} -h|-?|-help\`:       Ajuda
      \`${config.prefix} -l|-ls|-list\`:      Lista
      \`${config.prefix} -s|-j|-skip|-jump\`: Próximo
      \`${config.prefix} -k|-kill|-stop\`:    Limpa a lista
      \`${config.prefix} <busca>\`:           Busca
      `;

    const embed = new Embed({
      description,
    });

    this.message.channel.send(embed);
  }
}
