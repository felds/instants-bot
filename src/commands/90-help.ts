import { Message } from "discord.js";
import { join } from "path";
import config from "../config";
import { Embed } from "../message";
import { Queue } from "../queue";
import { importDir } from "../util";

const commands: Promise<Command[]> = importDir<{ command: Command }>(
  join(__dirname, "../commands"),
).then((modules) => modules.map((module) => module.command));

export const command: Command = {
  aliases: ["-h", "-help"],
  description: "Esse troço aqui",
  async process(message: Message, queue: Queue, ...args: string[]) {
    const helpText = (await commands)
      .map((cmd) => {
        const xs = [config.PREFIX, cmd.aliases.join("|")].filter((x) => x);
        return `\`${xs.join(" ")}\`: ${cmd.description}`;
      })
      .join("\n");
    const description = `**Chama assim, ó:** \n\n ${helpText}`;

    const embed = new Embed({
      description,
    });

    message.channel.send(embed);
  },
};
