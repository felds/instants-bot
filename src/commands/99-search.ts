import { ClientUser, Message, MessageReaction } from "discord.js";
import { listInstants } from "../connector";
import { Embed } from "../message";
import Queue from "../queue";

const reactionIcons = "1️⃣,2️⃣,3️⃣,4️⃣,5️⃣,6️⃣,7️⃣,8️⃣,9️⃣".split(",");

export const command: Command = {
  aliases: [],
  description: "Busca as parada",
  async process(message: Message, queue: Queue, ...args: string[]) {
    const searchTerms = args.join(" ");
    const results = await listInstants(searchTerms, reactionIcons.length);

    if (results.length < 1) {
      message.reply("Nachei nada, não!");
      return;
    }

    const desc = results
      .map((result, i) => `${reactionIcons[i]} ${result.title}`)
      .join("\n");

    const embed = await message.channel.send(
      new Embed({
        description: desc,
      })
    );
    for (const r of reactionIcons.slice(0, results.length)) {
      embed.react(r);
    }
    const filter = (reaction: MessageReaction, user: ClientUser) =>
      reactionIcons.includes(reaction.emoji.name) && !user.bot; // && user.id === message.author.id;
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
          queue.play(instant);
        }
      }
    } catch (_) {
      embed.delete();
    }
  },
};
