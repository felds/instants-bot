import assert from "assert";
import { Message } from "discord.js";
import { listInstants } from "../../connector";
import { getVoiceChannel } from "../../discord";
import { logger } from "../../logging";
import { createSearchResultsEmbed, REACTION_ICONS } from "../../message";
import { Instant } from "../../model/Instant";
import { Queue } from "../../queue";
import { Command } from "../../util/command";
import { getGuildConfig } from "../../util/firebase";
import { searchGifs } from "../../util/tenor";

export const command: Command<{ queue: Queue }> = {
  name: "search",
  aliases: [],
  description: "Busca as parada",
  process: async (
    args: string[],
    message: Message,
    allCommands: Command[],
    { queue },
  ): Promise<void> => {
    const terms = args.join(" ");

    const guild = message.guild;
    assert(guild, "Você não está em um servidor.");

    const user = message.author;
    const voiceChannel = getVoiceChannel(message);

    const myLogger = logger.child({
      guild: guild.name,
      channel: voiceChannel.name,
      user: user.tag,
      terms,
    });

    const { maxgifs } = await getGuildConfig(guild.id);

    myLogger.trace("User made a new search.");
    const [results, gifs] = await Promise.all([
      listInstants(terms, REACTION_ICONS.length),
      terms.length ? searchGifs(terms, Number(maxgifs)) : [],
    ]);

    if (results.length < 1) {
      myLogger.trace("The search has yielded no results.");
      message.reply("Nachei nada, não!");
      return;
    }

    createSearchResultsEmbed(message, results, (i) => {
      const instant: Instant = {
        ...results[i],
        voiceChannel,
        onStart: () => {
          const gif = gifs[i];
          if (gif) message.channel.send(gif.url);
        },
      };

      queue.play(instant);
    });
  },
};
