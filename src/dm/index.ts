import {
  ClientUser,
  Message,
  MessageReaction,
  ReactionCollector,
  ReactionCollectorOptions,
} from "discord.js";
import { format } from "util";
import { listInstants } from "../connector";
import { client } from "../discord";
import { Embed } from "../message";
import { setUserConfig } from "../util/firebase";

const reactionIcons = "1️⃣,2️⃣,3️⃣,4️⃣,5️⃣,6️⃣,7️⃣,8️⃣,9️⃣".split(",");

client.on("message", async (msg) => {
  if (msg.channel.type !== "dm") return;
  if (msg.author.bot) return;

  const terms = msg.cleanContent;
  console.log({ terms });

  const results = await listInstants(terms, reactionIcons.length);
  if (results.length < 1) {
    // myLogger.trace("The search has yielded no results.");
    msg.reply("Nachei nada, não!");
    return;
  }

  const reactionCollector = await searchResultsEmbed(msg, results, { max: 1 });

  /** @todo extrair isso aqui */
  reactionCollector.once("collect", async (reaction, user) => {
    const emoji = reaction.emoji.name!;
    const i = reactionIcons.indexOf(emoji);
    const instant = results[i];

    setUserConfig(msg.author.id, {
      doorbell: instant.url,
    });

    msg.reply(format("Pronto. Sua campainha é a `%s`.", instant.title));
    await reactionCollector.message.delete();
  });
});

async function searchResultsEmbed(
  msg: Message,
  results: Instant[],
  config: ReactionCollectorOptions = {},
): Promise<ReactionCollector> {
  const desc = results
    .map((result, i) => `${reactionIcons[i]} ${result.title}`)
    .join("\n");

  const embed = await msg.channel.send(
    new Embed({
      description: desc,
    }),
  );

  await Promise.all([
    reactionIcons.slice(0, results.length).map((r) => embed.react(r)),
  ]);

  const filter = (reaction: MessageReaction, user: ClientUser) =>
    reactionIcons.includes(reaction.emoji.name) && !user.bot;

  const collector = embed.createReactionCollector(filter, config);

  return collector;
}
