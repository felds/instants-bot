import { format } from "util";
import { listInstants } from "../connector";
import { client } from "../discord";
import { createSearchResultsEmbed, REACTION_ICONS } from "../message";
import { setUserConfig } from "../util/firebase";

client.on("message", async (message) => {
  if (message.channel.type !== "dm") return;
  if (message.author.bot) return;

  const terms = message.cleanContent;
  const results = await listInstants(terms, REACTION_ICONS.length);

  if (results.length < 1) {
    // myLogger.trace("The search has yielded no results.");
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
});
