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

client.on("message", async (message) => {
  if (message.channel.type !== "dm") return;
  if (message.author.bot) return;

  const terms = message.cleanContent;
  console.log({ terms });

  const results = await listInstants(terms, reactionIcons.length);
  if (results.length < 1) {
    // myLogger.trace("The search has yielded no results.");
    message.reply("Nachei nada, não!");
    return;
  }

  const reactionCollector = await searchResultsEmbed(message, results, {
    max: 1,
  });
  /** @todo extrair isso aqui */
  reactionCollector.once("collect", async (reaction, user) => {
    const emoji = reaction.emoji.name!;
    const i = reactionIcons.indexOf(emoji);
    const instant = results[i];

    setUserConfig(message.author.id, {
      doorbell: instant.url,
    });

    message.reply(format("Pronto. Sua campainha é a `%s`.", instant.title));
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

  const embed = new Embed({
    description: desc,
  });
  const sentMessage = await msg.channel.send(embed);

  console.log("");
  console.log("");
  console.log("");
  console.log("Entrando no loop do id #" + sentMessage.id);
  for (const r of reactionIcons.slice(0, results.length)) {
    console.log("Reagindo ao id #" + sentMessage.id);
    sentMessage.react(r).catch((err: Error) => {
      console.log(
        "Não foi possível reagir porque " + err.name + " " + sentMessage.id,
      );
    });
  }

  const filter = (reaction: MessageReaction, user: ClientUser) =>
    reactionIcons.includes(reaction.emoji.name) && !user.bot;

  const collector = sentMessage.createReactionCollector(filter, config);

  return collector;
}
