import assert from "assert";
import { Message } from "discord.js";
import config from "../../config";
import { Embed } from "../../message";
import { Queue } from "../../queue";
import { Command } from "../../util/command";

export const command: Command = {
  name: "help",
  aliases: ["-h", "-help"],
  description: "Esse troço aqui",
  process: async (
    message: Message,
    queue: Queue,
    args: string[],
    allCommands?: Command[],
  ): Promise<void> => {
    assert(allCommands, "How help if no commands?");

    const helpText = allCommands
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
