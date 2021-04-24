import { ClientUser, Message, MessageEmbed, MessageReaction } from "discord.js";

export const REACTION_ICONS = "1️⃣,2️⃣,3️⃣,4️⃣,5️⃣,6️⃣,7️⃣,8️⃣,9️⃣".split(",");

export class Embed extends MessageEmbed {
  public color = 16562691; // bananana
}

export async function createSearchResultsEmbed(
  msg: Message,
  results: Instant[],
  onReact?: (i: number) => void,
): Promise<Message> {
  const desc = results
    .map((result, i) => `${REACTION_ICONS[i]} ${result.title}`)
    .join("\n");

  const embed = new Embed({
    description: desc,
  });
  const sentMessage = await msg.channel.send(embed);

  for (const r of REACTION_ICONS.slice(0, results.length)) {
    sentMessage.react(r).catch(() => {});
  }

  const filter = (reaction: MessageReaction, user: ClientUser) =>
    REACTION_ICONS.includes(reaction.emoji.name) && !user.bot;

  const collector = sentMessage.createReactionCollector(filter);
  collector.on("collect", (r) => {
    const emoji = r.emoji.name!;
    const i = REACTION_ICONS.indexOf(emoji);
    if (i >= 0) onReact?.(i);
  });

  return sentMessage;
}
