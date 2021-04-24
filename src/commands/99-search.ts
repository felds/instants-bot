import { Message } from "discord.js";
import { listInstants } from "../connector";
import { logger } from "../logging";
import { createSearchResultsEmbed, REACTION_ICONS } from "../message";
import { Queue } from "../queue";
import { searchGifs } from "../util/tenor";

export const command: Command = {
  aliases: [],
  description: "Busca as parada",
  async process(message: Message, queue: Queue, ...args: string[]) {
    const terms = args.join(" ");

    const myLogger = logger.child({
      guild: message.member?.guild.name,
      channel: message.member?.voice.channel?.name,
      user: message.author.tag,
      terms,
    });

    myLogger.trace("User made a new search.");
    const [results, gifs] = await Promise.all([
      listInstants(terms, REACTION_ICONS.length),
      searchGifs(terms, 50),
    ]);

    if (results.length < 1) {
      myLogger.trace("The search has yielded no results.");
      message.reply("Nachei nada, não!");
      return;
    }

    createSearchResultsEmbed(message, results, (i) => {
      const instant = results[i];
      queue.play(instant, () => {
        const gif = gifs[i];
        if (gif) message.channel.send(gif.url);
      });
    });
  },
};
