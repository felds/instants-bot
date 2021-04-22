import { ClientUser, Message, MessageReaction } from "discord.js";
import { listInstants } from "../connector";
import { logger } from "../logging";
import { Embed } from "../message";
import { Queue } from "../queue";
import { searchGifs } from "../util/tenor";

const reactionIcons = "1️⃣,2️⃣,3️⃣,4️⃣,5️⃣,6️⃣,7️⃣,8️⃣,9️⃣".split(",");

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
      listInstants(terms, reactionIcons.length),
      searchGifs(terms, reactionIcons.length),
    ]);

    if (results.length < 1) {
      myLogger.trace("The search has yielded no results.");
      message.reply("Nachei nada, não!");
      return;
    }

    const desc = results
      .map((result, i) => `${reactionIcons[i]} ${result.title}`)
      .join("\n");

    const embed = await message.channel.send(
      new Embed({
        description: desc,
      }),
    );
    for (const r of reactionIcons.slice(0, results.length)) {
      embed.react(r);
    }
    const filter = (reaction: MessageReaction, user: ClientUser) =>
      reactionIcons.includes(reaction.emoji.name) && !user.bot;
    try {
      while (true) {
        const collected = await embed.awaitReactions(filter, {
          max: 1,
          time: 300_000,
        });
        for (const r of collected.array()) {
          const emoji = r.emoji.name!;
          const i = reactionIcons.indexOf(emoji);
          const instant = results[i];
          queue.play(instant, () => {
            const gif = gifs[i];
            if (gif) message.channel.send(gif.url);
          });
        }
      }
    } catch (_) {
      embed.delete();
    }
  },
};
