import { Message } from "discord.js";
import { join } from "path";
import config from "../../config";
import { Embed } from "../../message";
import { Command } from "../../util/command";
import { importDir } from "../../util/fs";

const commands: Promise<Command[]> = importDir<{ command: Command }>(
  join(__dirname, "."),
).then((modules) => modules.map((module) => module.command));

export const command: Command = {
  name: "help",
  aliases: ["-h", "-help"],
  description: "Esse troço aqui",
  async process(message: Message): Promise<void> {
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

    await message.channel.send(embed);
  },
};
