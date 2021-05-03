import { Message } from "discord.js";
import { format } from "util";
import { listInstants } from "../../connector";
import { createSearchResultsEmbed, REACTION_ICONS } from "../../message";
import { Queue } from "../../queue";
import { Command } from "../../util/command";
import { setUserConfig } from "../../util/firebase";

export const command: Command = {
  name: "search",
  aliases: [],
  description: "Busca as parada",
  async process(message: Message, queue: Queue, args: string[]) {
    const terms = args.join(" ");
    const results = await listInstants(terms, REACTION_ICONS.length);

    if (results.length < 1) {
      message.reply("Nachei nada, não!");
      return;
    }

    await createSearchResultsEmbed(message, results, (i) => {
      const instant = results[i];
      setUserConfig(message.author.id, {
        doorbell: instant.url,
      });
      message.reply(format("Pronto. Sua campainha é a `%s`.", instant.title));
    });
  },
};
